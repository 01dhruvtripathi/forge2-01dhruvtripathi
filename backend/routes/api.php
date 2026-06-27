<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SlaPolicyController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — PulseDesk
|--------------------------------------------------------------------------
*/

// ── Public auth routes ────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Authenticated routes (Sanctum token required) ─────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Dashboard metrics
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Macros
    Route::apiResource('macros', \App\Http\Controllers\Api\MacroController::class);

    // Tickets — all scoped to auth user's organization inside the controller
    Route::get('/tickets/export-csv', [TicketController::class, 'exportCsv']);
    Route::apiResource('tickets', TicketController::class);

    // Comments — nested under tickets
    Route::get('/tickets/{ticket}/comments',  [CommentController::class, 'index']);
    Route::post('/tickets/{ticket}/comments', [CommentController::class, 'store']);

    // Activity logs — nested under tickets
    Route::get('/tickets/{ticket}/activity', [ActivityLogController::class, 'index']);

    // SLA Policies
    Route::get('/sla-policies',      [SlaPolicyController::class, 'index']);
    Route::put('/sla-policies/{id}', [SlaPolicyController::class, 'update']);
});
