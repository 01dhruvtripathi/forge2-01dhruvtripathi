<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * List comments on a ticket.
     * Customers only see public comments; agents/admins also see internal notes.
     */
    public function index(Request $request, int $ticketId): JsonResponse
    {
        $user   = $request->user();
        $ticket = Ticket::forOrg($user->organization_id)->findOrFail($ticketId);

        $query = $ticket->comments()->with('author:id,name');

        // Customers cannot see internal notes
        if (!$user->isAdmin() && !$user->isAgent()) {
            $query->where('is_internal', false);
        }

        return response()->json($query->get());
    }

    /**
     * Add a comment/internal note to a ticket.
     */
    public function store(Request $request, int $ticketId): JsonResponse
    {
        $user   = $request->user();
        $ticket = Ticket::forOrg($user->organization_id)->findOrFail($ticketId);

        $data = $request->validate([
            'body'        => 'required|string',
            'is_internal' => 'sometimes|boolean',
        ]);

        // Only agents/admins can post internal notes
        $isInternal = ($user->isAdmin() || $user->isAgent()) && ($data['is_internal'] ?? false);

        $comment = Comment::create([
            'ticket_id'   => $ticket->id,
            'author_id'   => $user->id,
            'body'        => $data['body'],
            'is_internal' => $isInternal,
        ]);

        return response()->json($comment->load('author:id,name'), 201);
    }
}
