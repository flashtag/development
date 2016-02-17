<?php

namespace Tests\Admin;

use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class UsersTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createUser($properties = [])
    {
        return factory(User::class)->create($properties);
    }

    /** @test */
    public function show()
    {
        $user = $this->createUser(['password' => 'test_word']);

        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit("/admin/users/{$user->id}")
            ->seePageIs("/admin/users/{$user->id}/edit")
            ->see($user->name)
            ->see($user->email)
            ->dontSee($user->password)
            ->dontSee(bcrypt($user->password));
    }

    /** @test */
    public function show_only_for_admin()
    {
        $user = $this->createUser();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin")
            ->dontSeeLink("Users")
            ->get("/admin/users")
            ->seeStatusCode(403)
            ->get("/admin/users/1/edit")
            ->seeStatusCode(403)
            ->dontSee($user['name']);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $user = factory(User::class)->make([
            'password' => bcrypt('my_password'),
        ])->toArray();

        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit('/admin/users/create')
            ->type($user['name'], 'name')
            ->type($user['email'], 'email')
            ->type('my_password', 'password')
            ->type('my_password', 'password_confirmation')
            ->press('Save')
            ->seePageIs('/admin/users')
            ->seeInDatabase('users', $user);
    }

    /** @test */
    public function create_fails_without_name()
    {
        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit('/admin/users/create')
            ->type('test@test.com', 'email')
            ->type('my_password', 'password')
            ->type('my_password', 'password_confirmation')
            ->press('Save')
            ->seePageIs('/admin/users/create')
            ->see('test@test.com')
            ->dontSeeInDatabase('users', ['email' => 'test@test.com']);
    }

    /** @test */
    public function edit_all_fields()
    {
        $user = factory(User::class)->make([
            'password' => bcrypt('my_password'),
        ])->toArray();

        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit("/admin/users/{$this->createUser()->id}/edit")
            ->type($user['name'], 'name')
            ->type($user['email'], 'email')
            ->type('my_password', 'password')
            ->type('my_password', 'password_confirmation')
            ->press('Save')
            ->seePageIs('/admin/users')
            ->seeInDatabase('users', $user);
    }

    /** @test */
    public function edit_fails_without_name()
    {
        $user = $this->createUser();
        $page = "/admin/users/{$user->id}/edit";

        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit($page)
            ->type('', 'name')
            ->type('test@test.com', 'email')
            ->press('Save')
            ->seePageIs($page)
            ->see($user->name)
            ->dontSeeInDatabase('users', ['email' => 'test@test.com']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $user = $this->createUser();

        $this->actingAs(factory(User::class, 'admin')->create())
            ->delete("/admin/users/{$user->id}")
            ->dontSeeInDatabase('users', ['id' => $user->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $user = $this->createUser();

        $this->delete("/admin/users/{$user->id}")
            ->seeInDatabase('users', ['id' => $user->id]);
    }
}
