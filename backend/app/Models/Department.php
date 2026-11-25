<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class Department extends Model
{
    protected $fillable = ['faculty_id', 'code', 'name', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function faculty(): BelongsTo { return $this->belongsTo(Faculty::class); }
    public function studyPrograms(): HasMany { return $this->hasMany(StudyProgram::class); }


}
