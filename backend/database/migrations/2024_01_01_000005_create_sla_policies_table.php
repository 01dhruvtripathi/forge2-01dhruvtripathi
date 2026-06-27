<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sla_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->enum('priority', ['low', 'medium', 'high', 'critical']);
            $table->unsignedInteger('response_minutes')->default(480);   // 8 hours
            $table->unsignedInteger('resolution_minutes')->default(2880); // 48 hours
            $table->timestamps();

            $table->unique(['organization_id', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sla_policies');
    }
};
