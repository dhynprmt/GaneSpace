<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class StudentVerificationLog extends Model
{
    public $timestamps = false;
    protected $fillable = ['student_profile_id', 'actor_user_id', 'previous_status', 'new_status', 'reason', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function studentProfile(): BelongsTo { return $this->belongsTo(StudentProfile::class); }
    public function actor(): BelongsTo { return $this->belongsTo(User::class,'actor_user_id'); }


}
