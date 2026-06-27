<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * List activity logs for a ticket (scoped to the user's org).
     */
    public function index(Request $request, int $ticketId): JsonResponse
    {
        $user   = $request->user();
        $ticket = Ticket::forOrg($user->organization_id)->findOrFail($ticketId);

        $logs = ActivityLog::where('ticket_id', $ticket->id)
            ->with('actor:id,name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($logs);
    }
}
