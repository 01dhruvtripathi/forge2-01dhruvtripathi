<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * List tickets scoped to the authenticated user's organization.
     * Org ID is always derived from the auth session — never from request body.
     */
    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->organization_id;

        $tickets = Ticket::forOrg($orgId)
            ->withFilters($request->only('status', 'priority', 'assignee_id', 'search'))
            ->with(['requester:id,name', 'assignee:id,name'])
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($tickets);
    }

    /**
     * Create a new ticket in the user's organization.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject'     => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => 'sometimes|in:low,medium,high,critical',
        ]);

        $user   = $request->user();
        $ticket = Ticket::create([
            'organization_id' => $user->organization_id,
            'requester_id'    => $user->id,
            'subject'         => $data['subject'],
            'description'     => $data['description'],
            'priority'        => $data['priority'] ?? 'medium',
            'status'          => 'open',
        ]);

        ActivityLog::create([
            'ticket_id' => $ticket->id,
            'actor_id'  => $user->id,
            'action'    => 'created',
            'meta'      => ['priority' => $ticket->priority],
        ]);

        return response()->json($ticket->load(['requester:id,name', 'assignee:id,name']), 201);
    }

    /**
     * Show a single ticket — must belong to the user's organization.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::forOrg($request->user()->organization_id)
            ->with(['requester:id,name', 'assignee:id,name'])
            ->findOrFail($id);

        return response()->json($ticket);
    }

    /**
     * Update ticket (status, priority, assignee_id).
     * Only agents and admins may update.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $user->isAgent(), 403, 'Only agents and admins may update tickets.');

        $ticket = Ticket::forOrg($user->organization_id)->findOrFail($id);

        $data = $request->validate([
            'status'      => 'sometimes|in:open,in_progress,resolved,closed',
            'priority'    => 'sometimes|in:low,medium,high,critical',
            'assignee_id' => 'sometimes|nullable|exists:users,id',
            'subject'     => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        // Log status change
        if (isset($data['status']) && $data['status'] !== $ticket->status) {
            ActivityLog::create([
                'ticket_id' => $ticket->id,
                'actor_id'  => $user->id,
                'action'    => 'status_changed',
                'meta'      => ['from' => $ticket->status, 'to' => $data['status']],
            ]);
        }

        $ticket->update($data);

        return response()->json($ticket->load(['requester:id,name', 'assignee:id,name']));
    }

    /**
     * Delete a ticket (admin only).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only admins may delete tickets.');

        $ticket = Ticket::forOrg($request->user()->organization_id)->findOrFail($id);
        $ticket->delete();

        return response()->json(null, 204);
    }
}
