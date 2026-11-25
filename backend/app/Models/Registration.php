<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class Registration extends Model
{
    protected $fillable = ['public_uuid', 'registration_code', 'event_id', 'student_user_id', 'status', 'registered_at', 'cancelled_at', 'cancelled_by', 'cancellation_source', 'cancellation_reason', 'participant_snapshot', 'event_snapshot'];

    protected function casts(): array
    {
        return ['participant_snapshot' => 'array', 'event_snapshot' => 'array', 'registered_at' => 'datetime', 'cancelled_at' => 'datetime'];
    }

    public function event(): BelongsTo { return $this->belongsTo(Event::class); }
    public function student(): BelongsTo { return $this->belongsTo(User::class,'student_user_id'); }
    public function cancelledBy(): BelongsTo { return $this->belongsTo(User::class,'cancelled_by'); }


}
