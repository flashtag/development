<?php

namespace Tests\Admin;

use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    /** @test */
    public function redirects_to_log_in()
    {
        $this->visit('/admin')
            ->seePageIs('/admin/auth/login');
    }

    /** @test */
    public function logs_in()
    {
        $user = factory(User::class)->create([
            'password' => bcrypt('my-password'),
        ]);

        $this->visit('/admin/auth/login')
            ->type($user->email, 'email')
            ->type('my-password', 'password')
            ->press('Login')
            ->seePageIs('/admin');
    }

    /** @test */
    public function logs_out()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin')
            ->click('Logout')
            ->seePageIs('/admin/auth/login');
    }
}
