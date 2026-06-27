<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SlaPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlaPolicyController extends Controller
{
    /**
     * List SLA policies for the user's org.
     */
    public function index(Request $request): JsonResponse
    {
        $policies = SlaPolicy::where('organization_id', $request->user()->organization_id)
            ->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
            ->get();

        return response()->json($policies);
    }

    /**
     * Update an SLA policy (admin only).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only admins may update SLA policies.');

        $policy = SlaPolicy::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $data = $request->validate([
            'response_minutes'   => 'sometimes|integer|min:1',
            'resolution_minutes' => 'sometimes|integer|min:1',
        ]);

        $policy->update($data);

        return response()->json($policy);
    }
}
