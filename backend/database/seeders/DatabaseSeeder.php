<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Comment;
use App\Models\Organization;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Organization: Acme Corp ───────────────────────────────────────────────
        $acme = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acme',
        ]);

        // ── Organization: Beta Inc (to verify isolation) ──────────────────────────
        $beta = Organization::create([
            'name' => 'Beta Inc',
            'slug' => 'beta',
        ]);

        // ── Acme users — 1 admin, 2 agents, 2 customers ──────────────────────────
        $admin = User::create([
            'name'            => 'Alice Admin',
            'email'           => 'admin@acme.test',
            'password'        => Hash::make('password'),
            'organization_id' => $acme->id,
            'role'            => 'admin',
        ]);

        $agent1 = User::create([
            'name'            => 'Bob Agent',
            'email'           => 'agent@acme.test',
            'password'        => Hash::make('password'),
            'organization_id' => $acme->id,
            'role'            => 'agent',
        ]);

        $agent2 = User::create([
            'name'            => 'Eve Agent',
            'email'           => 'eve@acme.test',
            'password'        => Hash::make('password'),
            'organization_id' => $acme->id,
            'role'            => 'agent',
        ]);

        $customer1 = User::create([
            'name'            => 'Carol Customer',
            'email'           => 'customer@acme.test',
            'password'        => Hash::make('password'),
            'organization_id' => $acme->id,
            'role'            => 'customer',
        ]);

        $customer2 = User::create([
            'name'            => 'Frank Customer',
            'email'           => 'frank@acme.test',
            'password'        => Hash::make('password'),
            'organization_id' => $acme->id,
            'role'            => 'customer',
        ]);

        // ── Beta users (must NOT see Acme tickets) ────────────────────────────────
        $betaAdmin = User::create([
            'name'            => 'Dave Beta',
            'email'           => 'dave@beta.test',
            'password'        => Hash::make('password'),
            'organization_id' => $beta->id,
            'role'            => 'admin',
        ]);

        User::create([
            'name'            => 'Grace Beta',
            'email'           => 'grace@beta.test',
            'password'        => Hash::make('password'),
            'organization_id' => $beta->id,
            'role'            => 'agent',
        ]);

        // ── SLA policies for Acme ─────────────────────────────────────────────────
        $slaDefaults = [
            'low'      => [480,  5760],
            'medium'   => [240,  2880],
            'high'     => [60,   480],
            'critical' => [15,   120],
        ];
        foreach ($slaDefaults as $priority => [$response, $resolution]) {
            SlaPolicy::create([
                'organization_id'    => $acme->id,
                'priority'           => $priority,
                'response_minutes'   => $response,
                'resolution_minutes' => $resolution,
            ]);
        }

        // ── SLA policies for Beta ─────────────────────────────────────────────────
        foreach ($slaDefaults as $priority => [$response, $resolution]) {
            SlaPolicy::create([
                'organization_id'    => $beta->id,
                'priority'           => $priority,
                'response_minutes'   => $response,
                'resolution_minutes' => $resolution,
            ]);
        }

        // ── Sample tickets (~12 for Acme) ─────────────────────────────────────────
        $tickets = [
            [
                'subject'     => 'Cannot login to my account',
                'description' => 'I have been trying to log in since this morning but keep getting "invalid credentials" even though I am sure the password is correct.',
                'status'      => 'open',
                'priority'    => 'high',
                'requester'   => $customer1,
                'assignee'    => $agent1,
            ],
            [
                'subject'     => 'Invoice for March is incorrect',
                'description' => 'The invoice shows $599 but our contract says $499 per seat. Please correct and re-issue.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'requester'   => $customer1,
                'assignee'    => $agent1,
            ],
            [
                'subject'     => 'Feature request: dark mode',
                'description' => 'Would love to have a dark mode option in the settings. Many of us work late.',
                'status'      => 'open',
                'priority'    => 'low',
                'requester'   => $customer1,
                'assignee'    => null,
            ],
            [
                'subject'     => 'System outage — CRITICAL',
                'description' => 'The production dashboard is unreachable for all users in our org since 09:45 UTC.',
                'status'      => 'in_progress',
                'priority'    => 'critical',
                'requester'   => $admin,
                'assignee'    => $agent1,
            ],
            [
                'subject'     => 'How to export data as CSV?',
                'description' => 'I need to export our ticket history to CSV for a monthly report. Could you point me to the right settings?',
                'status'      => 'resolved',
                'priority'    => 'low',
                'requester'   => $customer1,
                'assignee'    => $agent1,
            ],
            [
                'subject'     => 'Password reset email not arriving',
                'description' => 'I clicked "Forgot Password" twice but never received the reset email. Checked spam folder too.',
                'status'      => 'open',
                'priority'    => 'high',
                'requester'   => $customer2,
                'assignee'    => $agent2,
            ],
            [
                'subject'     => 'API rate limit too low for our usage',
                'description' => 'We are hitting the 100 req/min rate limit during peak hours. Can we get it raised to 500?',
                'status'      => 'open',
                'priority'    => 'medium',
                'requester'   => $customer2,
                'assignee'    => $agent1,
            ],
            [
                'subject'     => 'Mobile app crashes on Android 14',
                'description' => 'The app crashes immediately after splash screen on my Pixel 8 running Android 14. Works fine on my iPad.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'requester'   => $customer1,
                'assignee'    => $agent2,
            ],
            [
                'subject'     => 'Billing page shows wrong currency',
                'description' => 'Our account is in EUR but the billing page keeps showing USD. This started after the last update.',
                'status'      => 'open',
                'priority'    => 'medium',
                'requester'   => $customer2,
                'assignee'    => null,
            ],
            [
                'subject'     => 'SSO integration with Okta',
                'description' => 'We need to set up SSO with our Okta tenant. Can you provide the SAML configuration docs?',
                'status'      => 'resolved',
                'priority'    => 'medium',
                'requester'   => $admin,
                'assignee'    => $agent2,
            ],
            [
                'subject'     => 'Slow dashboard loading times',
                'description' => 'The analytics dashboard takes over 15 seconds to load. It used to load in under 3 seconds.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'requester'   => $customer1,
                'assignee'    => $agent1,
            ],
            [
                'subject'     => 'Request to add team member',
                'description' => 'Please add john.doe@acme.com to our organization with agent-level access.',
                'status'      => 'closed',
                'priority'    => 'low',
                'requester'   => $admin,
                'assignee'    => $agent1,
            ],
        ];

        foreach ($tickets as $t) {
            $ticket = Ticket::create([
                'organization_id' => $acme->id,
                'requester_id'    => $t['requester']->id,
                'assignee_id'     => $t['assignee']?->id,
                'subject'         => $t['subject'],
                'description'     => $t['description'],
                'status'          => $t['status'],
                'priority'        => $t['priority'],
            ]);

            // Activity log: ticket created
            ActivityLog::create([
                'ticket_id'  => $ticket->id,
                'actor_id'   => $t['requester']->id,
                'action'     => 'created',
                'meta'       => ['priority' => $ticket->priority],
                'created_at' => $ticket->created_at,
            ]);

            // Add a sample comment to each ticket
            Comment::create([
                'ticket_id'   => $ticket->id,
                'author_id'   => ($t['assignee'] ?? $agent1)->id,
                'body'        => 'Thanks for reaching out! We are looking into this and will update you shortly.',
                'is_internal' => false,
            ]);

            // Add an internal note to high/critical tickets
            if (in_array($t['priority'], ['high', 'critical'])) {
                Comment::create([
                    'ticket_id'   => $ticket->id,
                    'author_id'   => $admin->id,
                    'body'        => 'Escalating to engineering team. Do not share externally.',
                    'is_internal' => true,
                ]);
            }

            // Add a customer follow-up on some tickets
            if ($t['status'] === 'in_progress') {
                Comment::create([
                    'ticket_id'   => $ticket->id,
                    'author_id'   => $t['requester']->id,
                    'body'        => 'Any update on this? It has been a while since I reported it.',
                    'is_internal' => false,
                ]);

                ActivityLog::create([
                    'ticket_id'  => $ticket->id,
                    'actor_id'   => ($t['assignee'] ?? $agent1)->id,
                    'action'     => 'status_changed',
                    'meta'       => ['from' => 'open', 'to' => 'in_progress'],
                    'created_at' => now(),
                ]);
            }
        }

        // ── Beta tickets (must be invisible to Acme users) ────────────────────────
        $betaTicket = Ticket::create([
            'organization_id' => $beta->id,
            'requester_id'    => $betaAdmin->id,
            'subject'         => 'Beta private ticket',
            'description'     => 'This ticket must NEVER appear in Acme org queries.',
            'status'          => 'open',
            'priority'        => 'medium',
        ]);

        Ticket::create([
            'organization_id' => $beta->id,
            'requester_id'    => $betaAdmin->id,
            'subject'         => 'Beta onboarding issue',
            'description'     => 'New user cannot access the onboarding flow after signup.',
            'status'          => 'open',
            'priority'        => 'high',
        ]);

        Comment::create([
            'ticket_id'   => $betaTicket->id,
            'author_id'   => $betaAdmin->id,
            'body'        => 'This is a Beta-only comment for isolation testing.',
            'is_internal' => false,
        ]);
    }
}
