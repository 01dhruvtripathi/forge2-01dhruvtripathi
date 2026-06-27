<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_get_token(): void
    {
        $org  = Organization::create(['name' => 'Test Org', 'slug' => 'test-org']);
        $user = User::factory()->create([
            'organization_id' => $org->id,
            'role'            => 'admin',
            'password'        => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_invalid_credentials_return_422(): void
    {
        $response = $this->postJson('/api/login', [
            'email'    => 'nobody@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_get_own_info(): void
    {
        $org  = Organization::create(['name' => 'Test Org', 'slug' => 'test-org2']);
        $user = User::factory()->create(['organization_id' => $org->id]);

        $this->actingAs($user, 'sanctum')
             ->getJson('/api/me')
             ->assertOk()
             ->assertJsonFragment(['email' => $user->email]);
    }
}
