<?php

namespace Tests\Admin;

use Flashtag\Data\Author;
use Flashtag\Data\Category;
use Flashtag\Data\Post;
use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PostCreateTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    public function testCreateWithOnlyTitleAndBody()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/posts/create')
            ->type('My Test Post', 'title')
            ->type('<p>My Body.</p>', 'body')
            ->press('Save')
            ->seePageIs('/admin/posts')
            ->seeInDatabase('posts', ['title' => 'My Test Post']);
    }

    public function testCreateWithAllFields()
    {
        $data = factory(Post::class)->make([
            'is_published' => true,
            'show_author' => true,
            'category_id' => factory(Category::class)->create()->id,
            'author_id' => factory(Author::class)->create()->id,
        ])->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/posts/create')
            ->type($data['title'], 'title')
            ->type($data['subtitle'], 'subtitle')
            ->type($data['body'], 'body')
            ->type($data['start_showing_at'], 'start_showing_at')
            ->type($data['stop_showing_at'], 'stop_showing_at')
            ->type($data['meta_description'], 'meta_description')
            ->type($data['meta_canonical'], 'meta_canonical')
            ->select($data['category_id'], 'category_id')
            ->select($data['author_id'], 'author_id')
            ->check('is_published')
            ->check('show_author')
            ->press('Save')
            ->seePageIs('/admin/posts')
            ->seeInDatabase('posts', $data);
    }

    public function testCreateFailsWithoutTitle()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/posts/create')
            ->type('My subtitle', 'subtitle')
            ->type('<p>My Body.</p>', 'body')
            ->press('Save')
            ->seePageIs('/admin/posts/create')
            ->see('My subtitle')
            ->see('<p>My Body.</p>')
            ->dontSeeInDatabase('posts', ['subtitle' => 'My subtitle']);
    }

    public function testCreateFailsWithoutBody()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/posts/create')
            ->type('My Title', 'title')
            ->press('Save')
            ->seePageIs('/admin/posts/create')
            ->see('My Title')
            ->dontSeeInDatabase('posts', ['title' => 'My Title']);
    }
}
