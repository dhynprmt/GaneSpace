<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class StudyProgram extends Model
{
    protected $fillable = ['department_id', 'code', 'name', 'degree_level', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function department(): BelongsTo { return $this->belongsTo(Department::class); }
    public function studentProfiles(): HasMany { return $this->hasMany(StudentProfile::class); }


}
