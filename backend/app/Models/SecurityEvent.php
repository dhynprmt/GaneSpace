<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class SecurityEvent extends Model
{
    public $timestamps = false;
    protected $guarded = ['*'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime', 'context_redacted' => 'array'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }


}
