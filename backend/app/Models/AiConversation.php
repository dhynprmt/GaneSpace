<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class AiConversation extends Model
{
    protected $fillable = ['student_user_id', 'event_id', 'title', 'closed_at'];

    protected function casts(): array
    {
        return ['closed_at' => 'datetime'];
    }

    public function student(): BelongsTo { return $this->belongsTo(User::class,'student_user_id'); }
    public function event(): BelongsTo { return $this->belongsTo(Event::class); }
    public function messages(): HasMany { return $this->hasMany(AiMessage::class); }


}
