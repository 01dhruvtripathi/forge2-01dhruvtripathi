<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Return aggregate metrics for the authenticated user's org.
     * Powers the frontend dashboard stats cards & charts.
     */
    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->organization_id;

        // Ticket counts by status
        $statusCounts = Ticket::forOrg($orgId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Ticket counts by priority
        $priorityCounts = Ticket::forOrg($orgId)
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority');

        // Recent tickets (last 5)
        $recent = Ticket::forOrg($orgId)
            ->with(['requester:id,name', 'assignee:id,name'])
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        // Agents in the org
        $agents = User::where('organization_id', $orgId)
            ->whereIn('role', ['admin', 'agent'])
            ->select('id', 'name', 'role')
            ->get()
            ->map(function ($agent) use ($orgId) {
                $agent->assigned_count = Ticket::forOrg($orgId)
                    ->where('assignee_id', $agent->id)
                    ->whereIn('status', ['open', 'in_progress'])
                    ->count();
                return $agent;
            });

        // Unassigned count
        $unassigned = Ticket::forOrg($orgId)
            ->whereNull('assignee_id')
            ->whereIn('status', ['open', 'in_progress'])
            ->count();

        // Total
        $total = Ticket::forOrg($orgId)->count();

        return response()->json([
            'total'           => $total,
            'status_counts'   => $statusCounts,
            'priority_counts' => $priorityCounts,
            'unassigned'      => $unassigned,
            'agents'          => $agents,
            'recent_tickets'  => $recent,
        ]);
    }
}
