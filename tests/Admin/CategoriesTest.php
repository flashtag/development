<?php

namespace Tests\Admin;

use Flashtag\Data\Author;
use Flashtag\Data\Category;
use Flashtag\Data\Post;
use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CategoriesTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createCategory()
    {
        return factory(Category::class)->create();
    }

    /** @test */
    public function show()
    {
        $category = $this->createCategory();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/categories/{$category->id}")
            ->seePageIs("/admin/categories/{$category->id}/edit")
            ->see($category->title)
            ->see($category->body);
    }

    /** @test */
    public function create_with_only_name()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/categories/create')
            ->type('My Test Category', 'name')
            ->press('Save')
            ->seePageIs('/admin/categories')
            ->seeInDatabase('categories', ['name' => 'My Test Category']);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $data = factory(Category::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/categories/create')
            ->type($data['name'], 'name')
            ->type($data['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/categories')
            ->seeInDatabase('categories', $data);
    }

    /** @test */
    public function create_fails_without_name()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/categories/create')
            ->type('A cool description...', 'description')
            ->press('Save')
            ->seePageIs('/admin/categories/create')
            ->see('A cool description...')
            ->dontSeeInDatabase('categories', ['description' => 'A cool description...']);
    }

    /** @test */
    public function edit_all_fields()
    {
        $data = factory(Category::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/categories/{$this->createCategory()->id}/edit")
            ->type($data['name'], 'name')
            ->type($data['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/categories')
            ->seeInDatabase('categories', $data);
    }

    /** @test */
    public function edit_fails_without_name()
    {
        $category = $this->createCategory();
        $page = "/admin/categories/{$category->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'name')
            ->type('New description', 'description')
            ->press('Save')
            ->seePageIs($page)
            ->see($category->name)
            ->dontSeeInDatabase('categories', ['description' => 'New description']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $category = $this->createCategory();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/categories/{$category->id}")
            ->dontSeeInDatabase('categories', ['id' => $category->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $category = $this->createCategory();

        $this->delete("/admin/categories/{$category->id}")
            ->seeInDatabase('categories', ['id' => $category->id]);
    }
}
