<?php

namespace Tests\Admin;

use Flashtag\Posts\Tag;
use Flashtag\Auth\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TagsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createTag()
    {
        return factory(Tag::class)->create();
    }

    /** @test */
    public function show()
    {
        $tag = $this->createTag();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/tags/{$tag->id}")
            ->seePageIs("/admin/tags/{$tag->id}/edit")
            ->see($tag->name)
            ->see($tag->description);
    }

    /** @test */
    public function create_with_only_name_and_description()
    {
        $tag = [
            'name' => 'Super Duper',
            'description' => '<p>My Bio.</p>',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/tags/create')
            ->type($tag['name'], 'name')
            ->type($tag['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/tags')
            ->seeInDatabase('tags', $tag);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $tag = factory(Tag::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/tags/create')
            ->type($tag['name'], 'name')
            ->type($tag['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/tags')
            ->seeInDatabase('tags', $tag);
    }

    /** @test */
    public function create_fails_without_name()
    {
        $tag = [
            'description' => '<p>My Bio.</p>',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/tags/create')
            ->type($tag['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/tags/create')
            ->see($tag['description'])
            ->dontSeeInDatabase('tags', $tag);
    }

    /** @test */
    public function edit_all_fields()
    {
        $tag = factory(Tag::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/tags/{$this->createTag()->id}/edit")
            ->type($tag['name'], 'name')
            ->type($tag['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/tags')
            ->seeInDatabase('tags', $tag);
    }

    /** @test */
    public function edit_fails_without_name()
    {
        $tag = $this->createTag();
        $page = "/admin/tags/{$tag->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'name')
            ->type('<p>My description.</p>', 'description')
            ->press('Save')
            ->seePageIs($page)
            ->see($tag->name)
            ->see($tag->description)
            ->dontSeeInDatabase('tags', ['description' => '<p>My description.</p>']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $tag = $this->createTag();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/tags/{$tag->id}")
            ->dontSeeInDatabase('tags', ['id' => $tag->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $tag = $this->createTag();

        $this->delete("/admin/tags/{$tag->id}")
            ->seeInDatabase('tags', ['id' => $tag->id]);
    }
}
