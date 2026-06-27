<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Macro extends Model
{
    protected $fillable = [
        'organization_id',
        'title',
        'body',
    ];

    /**
     * Scope all queries to the currently authenticated user's organization,
     * unless explicitly running outside of an auth context (like seeds/tests).
     */
    protected static function booted(): void
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('organization_id', Auth::user()->organization_id);
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
