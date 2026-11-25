<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class EventMedia extends Model
{
    protected $table = 'event_media';
    protected $fillable = ['event_id', 'media_kind', 'storage_disk', 'file_path', 'alt_text', 'mime_type', 'file_size_bytes', 'sort_order'];

    protected function casts(): array
    {
        return ['file_size_bytes' => 'integer', 'sort_order' => 'integer'];
    }

    public function event(): BelongsTo { return $this->belongsTo(Event::class); }


}
