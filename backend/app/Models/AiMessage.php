<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany,HasOne,BelongsToMany};

class AiMessage extends Model
{
    public $timestamps = false;
    protected $fillable = ['ai_conversation_id', 'role', 'content', 'model_name', 'token_input', 'token_output', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime', 'token_input' => 'integer', 'token_output' => 'integer'];
    }

    public function conversation(): BelongsTo { return $this->belongsTo(AiConversation::class,'ai_conversation_id'); }


}
