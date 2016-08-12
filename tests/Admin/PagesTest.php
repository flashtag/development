<?php

namespace Tests\Admin;

use Flashtag\Core\Page;
use Flashtag\Auth\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PagesTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createPage()
    {
        return factory(Page::class)->create([
            'is_published' => false,
        ]);
    }

    /** @test */
    public function show()
    {
        $page = $this->createPage();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/pages/{$page->id}")
            ->seePageIs("/admin/pages/{$page->id}/edit")
            ->see($page->title)
            ->see($page->body);
    }

    /** @test */
    public function create_with_only_title_and_slug()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/pages/create')
            ->type('My Test Page', 'title')
            ->type('slugg', 'slug')
            ->press('Save')
            ->seePageIs('/admin/pages')
            ->seeInDatabase('pages', ['title' => 'My Test Page']);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $data = factory(Page::class)->make([
            'is_published' => true,
        ])->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/pages/create')
            ->type($data['title'], 'title')
            ->type($data['subtitle'], 'subtitle')
            ->type($data['slug'], 'slug')
            ->type($data['body'], 'body')
            ->type($data['start_showing_at'], 'start_showing_at')
            ->type($data['stop_showing_at'], 'stop_showing_at')
            ->type($data['meta_description'], 'meta_description')
            ->type($data['meta_canonical'], 'meta_canonical')
            ->check('is_published')
            ->press('Save')
            ->seePageIs('/admin/pages')
            ->seeInDatabase('pages', $data);
    }

    /** @test */
    public function create_fails_without_title()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/pages/create')
            ->type('My subtitle', 'subtitle')
            ->type('<p>My Body.</p>', 'body')
            ->press('Save')
            ->seePageIs('/admin/pages/create')
            ->see('My subtitle')
            ->see('<p>My Body.</p>')
            ->dontSeeInDatabase('pages', ['subtitle' => 'My subtitle']);
    }

    /** @test */
    public function create_fails_without_slug()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/pages/create')
            ->type('My Title', 'title')
            ->press('Save')
            ->seePageIs('/admin/pages/create')
            ->see('My Title')
            ->dontSeeInDatabase('pages', ['title' => 'My Title']);
    }

    /** @test */
    public function edit_all_fields()
    {
        $data = factory(Page::class)->make([
            'is_published' => true,
        ])->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/pages/{$this->createPage()->id}/edit")
            ->type($data['title'], 'title')
            ->type($data['subtitle'], 'subtitle')
            ->type($data['slug'], 'slug')
            ->type($data['body'], 'body')
            ->type($data['start_showing_at'], 'start_showing_at')
            ->type($data['stop_showing_at'], 'stop_showing_at')
            ->type($data['meta_description'], 'meta_description')
            ->type($data['meta_canonical'], 'meta_canonical')
            ->check('is_published')
            ->press('Save')
            ->seePageIs('/admin/pages')
            ->seeInDatabase('pages', $data);
    }

    /** @test */
    public function edit_fails_without_title()
    {
        $page = $this->createPage();
        $url = "/admin/pages/{$page->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($url)
            ->type('', 'title')
            ->press('Save')
            ->seePageIs($url)
            ->see($page->subtitle)
            ->see($page->body)
            ->dontSeeInDatabase('pages', ['subtitle' => 'My subtitle']);
    }

    /** @test */
    public function edit_fails_without_slug()
    {
        $page = $this->createPage();
        $url = "/admin/pages/{$page->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($url)
            ->type('', 'slug')
            ->press('Save')
            ->seePageIs($url)
            ->see($page->title)
            ->dontSeeInDatabase('pages', ['title' => 'My Title']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $page = $this->createPage();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/pages/{$page->id}")
            ->dontSeeInDatabase('pages', ['id' => $page->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $page = $this->createPage();

        $this->delete("/admin/pages/{$page->id}")
            ->seeInDatabase('pages', ['id' => $page->id]);
    }
}
