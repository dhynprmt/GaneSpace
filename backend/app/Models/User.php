<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable, MustVerifyEmailTrait;
    use SoftDeletes;
    protected $fillable = ['name', 'email', 'password', 'account_status'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'last_login_at' => 'datetime', 'deleted_at' => 'datetime'];
    }

    public function studentProfile(): HasOne { return $this->hasOne(StudentProfile::class); }
    public function roleAssignments(): HasMany { return $this->hasMany(UserRole::class); }
    public function roles(): BelongsToMany { return $this->belongsToMany(Role::class, 'user_roles')
        ->withPivot(['organization_id', 'assigned_at', 'revoked_at'])->wherePivotNull('revoked_at'); }
    public function registrations(): HasMany { return $this->hasMany(Registration::class, 'student_user_id'); }
    public function aiConversations(): HasMany { return $this->hasMany(AiConversation::class, 'student_user_id'); }
    public function createdEvents(): HasMany { return $this->hasMany(Event::class, 'created_by'); }
    public function verificationActions(): HasMany { return $this->hasMany(StudentVerificationLog::class, 'actor_user_id'); }
    public function auditLogs(): HasMany { return $this->hasMany(AuditLog::class, 'actor_user_id'); }
    public function securityEvents(): HasMany { return $this->hasMany(SecurityEvent::class); }
    public function notificationDeliveryLogs(): HasMany { return $this->hasMany(NotificationDeliveryLog::class); }

    public function hasActiveRole(string $slug, ?int $organizationId = null): bool
    {
        return $this->roleAssignments()
            ->whereNull('revoked_at')
            ->whereHas('role', fn ($q) => $q->where('slug', $slug))
            ->when($organizationId !== null, fn ($q) => $q->where('organization_id', $organizationId))
            ->exists();
    }

    public function isSuperAdmin(): bool { return $this->hasActiveRole('super_admin'); }

    public function managesOrganization(int $organizationId): bool
    {
        return $this->account_status === 'active'
            && ($this->isSuperAdmin() || $this->roleAssignments()
                ->whereNull('revoked_at')->where('organization_id', $organizationId)
                ->whereHas('role', fn ($q) => $q->where('slug', 'event_admin'))
                ->whereHas('organization', fn ($q) => $q->where('is_active', true))->exists());
    }

    public function isVerifiedStudent(): bool
    {
        return $this->account_status === 'active'
            && $this->hasVerifiedEmail()
            && $this->hasActiveRole('student')
            && $this->studentProfile()->where('verification_status', 'verified')->exists();
    }
}
