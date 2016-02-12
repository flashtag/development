<?php

namespace Tests\Admin;

use Flashtag\Data\Author;
use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AuthorsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createAuthor()
    {
        return factory(Author::class)->create();
    }

    /** @test */
    public function show()
    {
        $author = $this->createAuthor();

        // TODO: Use photo
        unset($author['photo']);

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/authors/{$author->id}")
            ->seePageIs("/admin/authors/{$author->id}/edit")
            ->see($author->name)
            ->see($author->bio);
    }

    /** @test */
    public function create_with_only_name_and_bio()
    {
        $author = [
            'name' => 'Joe Schmoe',
            'bio' => '<p>My Bio.</p>',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/authors/create')
            ->type($author['name'], 'name')
            ->type($author['bio'], 'bio')
            ->press('Save')
            ->seePageIs('/admin/authors')
            ->seeInDatabase('authors', $author);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $author = factory(Author::class)->make()->toArray();

        // TODO: Use photo
        unset($author['photo']);

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/authors/create')
            ->type($author['name'], 'name')
            ->type($author['link'], 'link')
            ->type($author['bio'], 'bio')
            ->press('Save')
            ->seePageIs('/admin/authors')
            ->seeInDatabase('authors', $author);
    }

    /** @test */
    public function create_fails_without_name()
    {
        $author = [
            'link' => 'https://mylink.com',
            'bio' => '<p>My Bio.</p>',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/authors/create')
            ->type($author['link'], 'link')
            ->type($author['bio'], 'bio')
            ->press('Save')
            ->seePageIs('/admin/authors/create')
            ->see($author['link'])
            ->see($author['bio'])
            ->dontSeeInDatabase('authors', $author);
    }

    /** @test */
    public function edit_all_fields()
    {
        $author = factory(Author::class)->make()->toArray();

        // TODO: Use photo
        unset($author['photo']);

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/authors/{$this->createAuthor()->id}/edit")
            ->type($author['name'], 'name')
            ->type($author['bio'], 'bio')
            ->type($author['link'], 'link')
            ->press('Save')
            ->seePageIs('/admin/authors')
            ->seeInDatabase('authors', $author);
    }

    /** @test */
    public function edit_fails_without_name()
    {
        $author = $this->createAuthor();
        $page = "/admin/authors/{$author->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'name')
            ->type('https://super-duper-link.com', 'link')
            ->press('Save')
            ->seePageIs($page)
            ->see($author->name)
            ->see($author->bio)
            ->dontSeeInDatabase('authors', ['link' => 'https://super-duper-link.com']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $author = $this->createAuthor();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/authors/{$author->id}")
            ->dontSeeInDatabase('authors', ['id' => $author->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $author = $this->createAuthor();

        $this->delete("/admin/authors/{$author->id}")
            ->seeInDatabase('authors', ['id' => $author->id]);
    }
}
