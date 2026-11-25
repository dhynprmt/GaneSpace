<?php

namespace App\Policies;

use App\Models\AiConversation;
use App\Models\User;

class AiConversationPolicy
{
    public function view(User $user, AiConversation $conversation): bool
    {
        return $user->isVerifiedStudent() && $conversation->student_user_id === $user->id;
    }
    public function update(User $user, AiConversation $conversation): bool { return $this->view($user, $conversation); }
    public function delete(User $user, AiConversation $conversation): bool { return $this->view($user, $conversation); }
}
