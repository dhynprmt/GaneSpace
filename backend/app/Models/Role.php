<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class Role extends Model
{
    protected $fillable = ['slug', 'name', 'scope_type'];

    protected function casts(): array
    {
        return [];
    }

    public function assignments(): HasMany { return $this->hasMany(UserRole::class); }


}
