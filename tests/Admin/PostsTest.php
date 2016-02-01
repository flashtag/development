<?php

namespace Tests\Admin;

use Flashtag\Data\Author;
use Flashtag\Data\Category;
use Flashtag\Data\Post;
use Flashtag\Data\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PostsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createPost()
    {
        return factory(Post::class)->create([
            'is_published' => false,
            'show_author' => false,
        ]);
    }

    public function testShow()
    {
        $post = $this->createPost();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/posts/{$post->id}")
            ->seePageIs("/admin/posts/{$post->id}/edit")
            ->see($post->title)
            ->see($post->body);
    }

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

    public function testEditAllFields()
    {
        $data = factory(Post::class)->make([
            'is_published' => true,
            'show_author' => true,
            'category_id' => factory(Category::class)->create()->id,
            'author_id' => factory(Author::class)->create()->id,
        ])->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/posts/{$this->createPost()->id}/edit")
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

    public function testEditFailsWithoutTitle()
    {
        $post = $this->createPost();
        $page = "/admin/posts/{$post->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'title')
            ->press('Save')
            ->seePageIs($page)
            ->see($post->subtitle)
            ->see($post->body)
            ->dontSeeInDatabase('posts', ['subtitle' => 'My subtitle']);
    }

    public function testEditFailsWithoutBody()
    {
        $post = $this->createPost();
        $page = "/admin/posts/{$post->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'body')
            ->press('Save')
            ->seePageIs($page)
            ->see($post->title)
            ->dontSeeInDatabase('posts', ['title' => 'My Title']);
    }

    public function testDelete()
    {
        $this->withoutMiddleware();

        $post = $this->createPost();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/posts/{$post->id}")
            ->dontSeeInDatabase('posts', ['id' => $post->id]);
    }

    public function testDeleteFailsWhenNotAuthorized()
    {
        $this->withoutMiddleware();

        $post = $this->createPost();

        $this->delete("/admin/posts/{$post->id}")
            ->seeInDatabase('posts', ['id' => $post->id]);
    }
}
