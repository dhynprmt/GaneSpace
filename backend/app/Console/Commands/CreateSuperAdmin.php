<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\RoleAssignmentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateSuperAdmin extends Command
{
    protected $signature = 'ganespace:create-super-admin {--name=} {--email=}';
    protected $aliases = ['ueis:create-super-admin'];
    protected $description = 'Create the first GaneSpace Super Admin securely (never through public signup)';

    public function handle(RoleAssignmentService $roles): int
    {
        $name = $this->option('name') ?: $this->ask('Administrator name');
        $email = $this->option('email') ?: $this->ask('Administrator email');
        $password = $this->secret('Administrator password');
        $confirmation = $this->secret('Confirm password');

        $input = compact('name', 'email', 'password');
        $input['password_confirmation'] = $confirmation;
        $validator = Validator::make($input, [
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:254', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);
        if ($validator->fails()) {
            $this->error($validator->errors()->first());
            return self::FAILURE;
        }

        DB::transaction(function () use ($name, $email, $password, $roles) {
            $user = User::create([
                'name' => $name, 'email' => mb_strtolower($email),
                'password' => $password, 'account_status' => 'active',
            ]);
            // Account is provisioned via the authenticated server console by a trusted maintainer.
            $user->forceFill(['email_verified_at' => now('UTC')])->save();
            $roles->assign($user, 'super_admin');
        });
        $this->info('Super Admin created. No password was displayed or stored in source control.');
        return self::SUCCESS;
    }
}
