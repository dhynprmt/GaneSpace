<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class EventModerationLog extends Model
{
    public $timestamps = false;
    protected $fillable = ['event_id', 'moderator_user_id', 'action', 'previous_publication_status', 'new_publication_status', 'reason', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function event(): BelongsTo { return $this->belongsTo(Event::class); }
    public function moderator(): BelongsTo { return $this->belongsTo(User::class,'moderator_user_id'); }


}
