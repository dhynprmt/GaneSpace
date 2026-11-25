<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class StudentProfile extends Model
{
    protected $fillable = ['user_id', 'nim', 'study_program_id', 'profile_photo_path', 'ktm_private_path', 'ktm_uploaded_at', 'verification_status', 'verification_note', 'verified_by', 'verified_at', 'verification_requested_at'];
    protected $hidden = ['ktm_private_path', 'profile_photo_path'];

    protected function casts(): array
    {
        return ['ktm_uploaded_at' => 'datetime', 'verified_at' => 'datetime', 'verification_requested_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function studyProgram(): BelongsTo { return $this->belongsTo(StudyProgram::class); }
    public function reviewer(): BelongsTo { return $this->belongsTo(User::class,'verified_by'); }
    public function verificationLogs(): HasMany { return $this->hasMany(StudentVerificationLog::class); }


}
