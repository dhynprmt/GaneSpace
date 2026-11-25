<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class EventAiSummary extends Model
{
    protected $fillable = ['event_id', 'source_hash', 'summary_text', 'model_name', 'generated_at'];

    protected function casts(): array
    {
        return ['generated_at' => 'datetime'];
    }

    public function event(): BelongsTo { return $this->belongsTo(Event::class); }


}
