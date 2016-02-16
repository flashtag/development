<?php

namespace Tests\Admin;

use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PagesTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    /** @test */
    public function dashboard()
    {
        $user = factory(User::class)->create();

        $this->actingAs($user)
            ->visit("/admin")
            ->see('Dashboard')
            ->see('Posts')
            ->see('Post fields')
            ->see('Categories')
            ->see('Tags')
            ->see('Authors')
            //->see('Users')    TODO
            //->see('Settings') TODO
            ->see($user->name)
            ->see('Logout');
    }
}
