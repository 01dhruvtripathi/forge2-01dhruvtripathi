<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\Ticket;
use App\Models\User;

/**
 * Comment authorization policy.
 *
 * Enforces tenant isolation via the parent ticket's organization,
 * and restricts internal-note visibility to agents/admins.
 */
class CommentPolicy
{
    /**
     * Anyone in the ticket's org can view comments.
     * (Internal notes are filtered in the controller, not here.)
     */
    public function viewAny(User $user, Ticket $ticket): bool
    {
        return $user->organization_id === $ticket->organization_id;
    }

    /**
     * Any user in the ticket's org may post a comment.
     * (is_internal flag is only honoured for agents/admins in the controller.)
     */
    public function create(User $user, Ticket $ticket): bool
    {
        return $user->organization_id === $ticket->organization_id;
    }
}
