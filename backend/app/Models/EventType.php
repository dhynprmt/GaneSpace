<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class EventType extends Model
{
    protected $fillable = ['event_category_id', 'slug', 'name', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function category(): BelongsTo { return $this->belongsTo(EventCategory::class,'event_category_id'); }
    public function events(): HasMany { return $this->hasMany(Event::class); }


}
