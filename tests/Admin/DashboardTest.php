<?php

namespace Tests\Admin;

use Flashtag\Auth\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    /** @test */
    public function dashboard()
    {
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->visit("/admin")
            ->see('Dashboard')
            ->seeLink('Posts')
            ->seeLink('Fields')
            ->seeLink('Lists')
            ->seeLink('Categories')
            ->seeLink('Tags')
            ->seeLink('Authors')
            ->dontSeeLink('Users')
            ->dontSeeLink('Settings')
            //->see($user->name)
            ->seeLink('Logout');
    }

    /** @test */
    public function dashboard_as_admin()
    {
        $user = factory(User::class, 'admin')->create();

        $this->actingAs($user)
            ->visit("/admin")
            ->see('Dashboard')
            ->seeLink('Posts')
            ->seeLink('Fields')
            ->seeLink('Lists')
            ->seeLink('Categories')
            ->seeLink('Tags')
            ->seeLink('Authors')
            ->seeLink('Users')
            ->seeLink('Settings')
            //->see($user->name)
            ->seeLink('Logout');
    }
}
