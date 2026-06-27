<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

/**
 * Ticket authorization policy.
 *
 * Enforces two layers:
 * 1. Tenant isolation — user must belong to the same org as the ticket.
 * 2. Role-based access — only agents/admins may update; only admins may delete.
 */
class TicketPolicy
{
    /**
     * Anyone in the same org can view the ticket list.
     */
    public function viewAny(User $user): bool
    {
        return true; // org-scoping happens in the controller via forOrg()
    }

    /**
     * A user may view a ticket only if it belongs to their organization.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->organization_id === $ticket->organization_id;
    }

    /**
     * Any authenticated user may create a ticket in their own org.
     */
    public function create(User $user): bool
    {
        return true; // org_id is auto-set from auth session
    }

    /**
     * Only agents and admins in the same org may update a ticket.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->organization_id === $ticket->organization_id
            && ($user->isAdmin() || $user->isAgent());
    }

    /**
     * Only admins in the same org may delete a ticket.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->organization_id === $ticket->organization_id
            && $user->isAdmin();
    }
}
