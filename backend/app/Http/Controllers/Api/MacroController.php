<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Macro;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MacroController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Macros are automatically scoped to the auth user's org via the Macro model's global scope
        $macros = Macro::orderBy('title')->get();
        return response()->json($macros);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
        ]);

        $validated['organization_id'] = $request->user()->organization_id;
        $macro = Macro::create($validated);

        return response()->json($macro, 201);
    }

    public function update(Request $request, Macro $macro): JsonResponse
    {
        // The Macro model global scope ensures this macro belongs to the user's org.
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'body'  => 'sometimes|required|string',
        ]);

        $macro->update($validated);
        return response()->json($macro);
    }

    public function destroy(Macro $macro): JsonResponse
    {
        $macro->delete();
        return response()->json(null, 204);
    }
}
