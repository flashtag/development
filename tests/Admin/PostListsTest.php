<?php

namespace Tests\Admin;

use Flashtag\Posts\PostList;
use Flashtag\Auth\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PostListsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createList()
    {
        return factory(PostList::class)->create();
    }

    /** @test */
    public function show()
    {
        $postList = $this->createList();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/post-lists/{$postList->id}")
            ->seePageIs("/admin/post-lists/{$postList->id}/edit")
            ->see($postList->name);
    }

    /** @test */
    public function create_with_only_name_and_description()
    {
        $postList = [
            'name' => 'super_duper',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/post-lists/create')
            ->type($postList['name'], 'name')
            ->press('Save')
            ->seePageIs('/admin/post-lists')
            ->seeInDatabase('post_lists', $postList);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $postList = factory(PostList::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/post-lists/create')
            ->type($postList['name'], 'name')
            ->press('Save')
            ->seePageIs('/admin/post-lists')
            ->seeInDatabase('post_lists', $postList);
    }

    /** @test */
    public function create_fails_without_name()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/post-lists/create')
            ->press('Save')
            ->seePageIs('/admin/post-lists/create');
    }

    /** @test */
    public function edit_all_fields()
    {
        $postList = factory(PostList::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/post-lists/{$this->createList()->id}/edit")
            ->type($postList['name'], 'name')
            ->press('Save')
            ->seePageIs('/admin/post-lists')
            ->seeInDatabase('post_lists', $postList);
    }

    /** @test */
    public function edit_fails_without_name()
    {
        $postList = $this->createList();
        $page = "/admin/post-lists/{$postList->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'name')
            ->press('Save')
            ->seePageIs($page)
            ->see($postList->name)
            ->dontSeeInDatabase('post_lists', ['name' => '']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $postList = $this->createList();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/post-lists/{$postList->id}")
            ->dontSeeInDatabase('post_lists', ['id' => $postList->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $postList = $this->createList();

        $this->delete("/admin/post-lists/{$postList->id}")
            ->seeInDatabase('post_lists', ['id' => $postList->id]);
    }
}
