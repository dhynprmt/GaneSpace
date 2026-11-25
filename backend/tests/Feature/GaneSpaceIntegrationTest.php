<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\DatabaseTestCase;

class GaneSpaceIntegrationTest extends DatabaseTestCase
{
    public function test_login_returns_the_account_and_role_contract_with_a_valid_captcha_response(): void
    {
        config(['ueis.turnstile.secret'=>'local-test', 'ueis.turnstile.expected_hostname'=>null]);
        Http::fake(['https://challenges.cloudflare.com/turnstile/v0/siteverify'=>Http::response(['success'=>true])]);
        $user = User::create(['name'=>'Login test', 'email'=>'login-check@example.test',
            'password'=>'SamplePassword42', 'account_status'=>'active']);
        $user->forceFill(['email_verified_at'=>now()])->save();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        app(\App\Services\RoleAssignmentService::class)->assign($user, 'super_admin');
        $this->withHeader('Origin','http://localhost:5173')->postJson('/api/auth/login', [
            'email'=>$user->email, 'password'=>'SamplePassword42', 'turnstile_token'=>'test',
        ])->assertOk()->assertJsonPath('user.roles.0.role','super_admin')->assertJsonPath('user.id',$user->id);
    }

    public function test_password_recovery_mail_targets_the_react_form_and_changes_the_password(): void
    {
        Notification::fake();
        config(['ueis.turnstile.secret'=>'local-test', 'ueis.turnstile.expected_hostname'=>null]);
        Http::fake(['https://challenges.cloudflare.com/turnstile/v0/siteverify'=>Http::response(['success'=>true])]);
        $user = User::create(['name'=>'Reset test', 'email'=>'reset-check@example.test',
            'password'=>'PreviousPassword42', 'account_status'=>'active']);
        $this->postJson('/api/auth/forgot-password', ['email'=>$user->email, 'turnstile_token'=>'test'])->assertOk();
        $notice = Notification::sent($user, ResetPassword::class)->first();
        $url = $notice->toMail($user)->actionUrl;
        $this->assertSame('http://localhost:5173/reset-password', strtok($url, '?'));
        $this->postJson('/api/auth/reset-password', ['email'=>$user->email, 'token'=>$notice->token,
            'password'=>'NewPassword42', 'password_confirmation'=>'NewPassword42'])->assertOk();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('NewPassword42', $user->fresh()->password));
    }

    public function test_rejected_or_wrong_host_captcha_cannot_create_a_session(): void
    {
        $siteverify = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        config(['ueis.turnstile.secret'=>'qa-secret', 'ueis.turnstile.expected_hostname'=>'localhost']);
        Http::fake([$siteverify => Http::sequence()
            ->push(['success'=>false])->push(['success'=>true, 'hostname'=>'other.example.test'])]);
        foreach ([1, 2] as $attempt) {
            $this->postJson('/api/auth/login', ['email'=>'captcha@example.test','password'=>'ValidPassword123',
                'turnstile_token'=>'qa-'.$attempt])->assertUnprocessable()->assertJsonValidationErrors('turnstile_token');
            $this->assertGuest();
        }
    }

    public function test_production_rejects_official_dummy_secret_before_network_call(): void
    {
        $this->app->instance('env', 'production');
        config(['ueis.turnstile.secret'=>'1x'.str_repeat('0', 31).'AA']);
        Http::fake();
        try {
            app(\App\Services\TurnstileVerifier::class)->verify('dummy', request());
            $this->fail('Production accepted a test secret.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('production secret', $exception->getMessage());
        } finally {
            $this->app->instance('env', 'testing');
        }
        Http::assertNothingSent();
    }
}
