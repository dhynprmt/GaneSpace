<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class Event extends Model
{
    use SoftDeletes;
    protected $fillable = ['organization_id', 'event_type_id', 'created_by', 'updated_by', 'title', 'slug', 'description', 'objectives', 'topics', 'participant_requirements', 'start_at', 'end_at', 'location_mode', 'venue_name', 'venue_address', 'meeting_url_encrypted', 'capacity', 'registration_opens_at', 'registration_closes_at', 'external_registration_url', 'contact_name', 'contact_email', 'contact_phone', 'publication_status', 'published_at', 'cancelled_at', 'cancelled_by', 'cancellation_reason'];
    protected $hidden = ['meeting_url_encrypted'];

    protected function casts(): array
    {
        return ['meeting_url_encrypted' => 'encrypted', 'start_at' => 'datetime', 'end_at' => 'datetime', 'registration_opens_at' => 'datetime', 'registration_closes_at' => 'datetime', 'published_at' => 'datetime', 'cancelled_at' => 'datetime', 'capacity' => 'integer'];
    }

    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }
    public function eventType(): BelongsTo { return $this->belongsTo(EventType::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class,'created_by'); }
    public function updater(): BelongsTo { return $this->belongsTo(User::class,'updated_by'); }
    public function cancelledBy(): BelongsTo { return $this->belongsTo(User::class,'cancelled_by'); }
    public function media(): HasMany { return $this->hasMany(EventMedia::class); }
    public function moderationLogs(): HasMany { return $this->hasMany(EventModerationLog::class); }
    public function registrations(): HasMany { return $this->hasMany(Registration::class); }
    public function aiSummary(): HasOne { return $this->hasOne(EventAiSummary::class); }
    public function aiConversations(): HasMany { return $this->hasMany(AiConversation::class); }


}
