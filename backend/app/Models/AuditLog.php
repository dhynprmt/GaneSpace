<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class AuditLog extends Model
{
    public $timestamps = false;
    protected $guarded = ['*'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime', 'old_values' => 'array', 'new_values' => 'array'];
    }

    public function actor(): BelongsTo { return $this->belongsTo(User::class,'actor_user_id'); }
    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }


}
