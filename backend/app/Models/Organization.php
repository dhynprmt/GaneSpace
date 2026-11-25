<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class Organization extends Model
{
    protected $fillable = ['parent_id', 'faculty_id', 'name', 'slug', 'organization_type', 'contact_email', 'contact_phone', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function parent(): BelongsTo { return $this->belongsTo(self::class,'parent_id'); }
    public function children(): HasMany { return $this->hasMany(self::class,'parent_id'); }
    public function faculty(): BelongsTo { return $this->belongsTo(Faculty::class); }
    public function roleAssignments(): HasMany { return $this->hasMany(UserRole::class); }
    public function events(): HasMany { return $this->hasMany(Event::class); }


}
