<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function setup_org(): array
    {
        $org = Organization::create(['name' => 'TestOrg', 'slug' => 'test-org']);
        $admin = User::factory()->create([
            'organization_id' => $org->id,
            'role'            => 'admin',
        ]);

        return [$org, $admin];
    }

    public function test_dashboard_returns_metrics(): void
    {
        [$org, $admin] = $this->setup_org();

        Ticket::create([
            'organization_id' => $org->id,
            'requester_id'    => $admin->id,
            'subject'         => 'Test',
            'description'     => 'Test desc',
            'status'          => 'open',
            'priority'        => 'high',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
                         ->getJson('/api/dashboard');

        $response->assertOk()
                 ->assertJsonStructure([
                     'total',
                     'status_counts',
                     'priority_counts',
                     'unassigned',
                     'agents',
                     'recent_tickets',
                 ]);

        $this->assertEquals(1, $response->json('total'));
    }

    public function test_dashboard_only_shows_own_org_data(): void
    {
        [$orgA, $adminA] = $this->setup_org();
        $orgB = Organization::create(['name' => 'OrgB', 'slug' => 'org-b']);
        $adminB = User::factory()->create([
            'organization_id' => $orgB->id,
            'role'            => 'admin',
        ]);

        // Create tickets in both orgs
        Ticket::create([
            'organization_id' => $orgA->id,
            'requester_id'    => $adminA->id,
            'subject'         => 'OrgA ticket',
            'description'     => 'Visible',
            'status'          => 'open',
            'priority'        => 'medium',
        ]);

        Ticket::create([
            'organization_id' => $orgB->id,
            'requester_id'    => $adminB->id,
            'subject'         => 'OrgB ticket',
            'description'     => 'Hidden',
            'status'          => 'open',
            'priority'        => 'medium',
        ]);

        $response = $this->actingAs($adminA, 'sanctum')
                         ->getJson('/api/dashboard');

        $response->assertOk();
        $this->assertEquals(1, $response->json('total'));
    }

    public function test_sla_policies_scoped_to_org(): void
    {
        [$org, $admin] = $this->setup_org();

        SlaPolicy::create([
            'organization_id'    => $org->id,
            'priority'           => 'high',
            'response_minutes'   => 60,
            'resolution_minutes' => 480,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
                         ->getJson('/api/sla-policies');

        $response->assertOk()
                 ->assertJsonCount(1);
    }

    public function test_only_admin_can_update_sla(): void
    {
        [$org, $admin] = $this->setup_org();
        $agent = User::factory()->create([
            'organization_id' => $org->id,
            'role'            => 'agent',
        ]);

        $sla = SlaPolicy::create([
            'organization_id'    => $org->id,
            'priority'           => 'high',
            'response_minutes'   => 60,
            'resolution_minutes' => 480,
        ]);

        // Agent cannot update
        $this->actingAs($agent, 'sanctum')
             ->putJson("/api/sla-policies/{$sla->id}", ['response_minutes' => 30])
             ->assertForbidden();

        // Admin can update
        $this->actingAs($admin, 'sanctum')
             ->putJson("/api/sla-policies/{$sla->id}", ['response_minutes' => 30])
             ->assertOk()
             ->assertJsonFragment(['response_minutes' => 30]);
    }
}
