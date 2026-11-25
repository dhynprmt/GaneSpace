<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class NotificationDeliveryLog extends Model
{
    protected $guarded = ['*'];

    protected function casts(): array
    {
        return ['sent_at' => 'datetime', 'attempts' => 'integer'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }


}
