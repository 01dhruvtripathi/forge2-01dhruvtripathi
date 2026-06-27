<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTenancyTest extends TestCase
{
    use RefreshDatabase;

    private function makeOrg(string $slug): Organization
    {
        return Organization::create(['name' => ucfirst($slug), 'slug' => $slug]);
    }

    private function makeUser(Organization $org, string $role = 'customer'): User
    {
        return User::factory()->create(['organization_id' => $org->id, 'role' => $role]);
    }

    private function makeTicket(User $user, array $extra = []): Ticket
    {
        return Ticket::create(array_merge([
            'organization_id' => $user->organization_id,
            'requester_id'    => $user->id,
            'subject'         => 'Test ticket',
            'description'     => 'A test.',
            'status'          => 'open',
            'priority'        => 'medium',
        ], $extra));
    }

    /** Core requirement: Org A cannot see Org B's tickets */
    public function test_org_a_cannot_see_org_b_tickets(): void
    {
        $orgA    = $this->makeOrg('org-a');
        $orgB    = $this->makeOrg('org-b');
        $userA   = $this->makeUser($orgA);
        $userB   = $this->makeUser($orgB);
        $ticketB = $this->makeTicket($userB);

        $response = $this->actingAs($userA, 'sanctum')
                         ->getJson('/api/tickets');

        $response->assertOk();
        $data = collect($response->json('data'));
        $this->assertFalse($data->contains('id', $ticketB->id),
            'Org A user must not see Org B ticket');
    }

    /** Customer can create a ticket */
    public function test_customer_can_create_ticket(): void
    {
        $org      = $this->makeOrg('org-c');
        $customer = $this->makeUser($org, 'customer');

        $response = $this->actingAs($customer, 'sanctum')
                         ->postJson('/api/tickets', [
                             'subject'     => 'My issue',
                             'description' => 'Details here.',
                         ]);

        $response->assertCreated()
                 ->assertJsonFragment(['subject' => 'My issue']);

        $this->assertDatabaseHas('tickets', [
            'organization_id' => $org->id,
            'requester_id'    => $customer->id,
        ]);
    }

    /** Only agent/admin can update status */
    public function test_customer_cannot_update_ticket_status(): void
    {
        $org      = $this->makeOrg('org-d');
        $customer = $this->makeUser($org, 'customer');
        $ticket   = $this->makeTicket($customer);

        $this->actingAs($customer, 'sanctum')
             ->putJson("/api/tickets/{$ticket->id}", ['status' => 'resolved'])
             ->assertForbidden();
    }

    /** Agent CAN update status */
    public function test_agent_can_update_ticket_status(): void
    {
        $org    = $this->makeOrg('org-e');
        $agent  = $this->makeUser($org, 'agent');
        $ticket = $this->makeTicket($agent);

        $this->actingAs($agent, 'sanctum')
             ->putJson("/api/tickets/{$ticket->id}", ['status' => 'resolved'])
             ->assertOk()
             ->assertJsonFragment(['status' => 'resolved']);
    }

    /** Direct ticket access: cannot fetch another org's ticket by ID */
    public function test_cannot_fetch_other_org_ticket_by_id(): void
    {
        $orgA    = $this->makeOrg('org-f');
        $orgB    = $this->makeOrg('org-g');
        $userA   = $this->makeUser($orgA);
        $userB   = $this->makeUser($orgB);
        $ticketB = $this->makeTicket($userB);

        $this->actingAs($userA, 'sanctum')
             ->getJson("/api/tickets/{$ticketB->id}")
             ->assertNotFound();
    }
}
