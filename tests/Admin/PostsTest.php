<?php

namespace Tests\Admin;

use Flashtag\Posts\Author;
use Flashtag\Posts\Category;
use Flashtag\Posts\Post;
use Flashtag\Auth\User;
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

    /** @test */
    public function show()
    {
        $post = $this->createPost();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/posts/{$post->id}")
            ->seePageIs("/admin/posts/{$post->id}/edit")
            ->see($post->title)
            ->see($post->body);
    }

    /** @test */
    public function create_with_only_title_and_body()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/posts/create')
            ->type('My Test Post', 'title')
            ->type('<p>My Body.</p>', 'body')
            ->press('Save')
            ->seePageIs('/admin/posts')
            ->seeInDatabase('posts', ['title' => 'My Test Post']);
    }

    /** @test */
    public function create_with_all_fields()
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

    /** @test */
    public function create_fails_without_title()
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

    /** @test */
    public function create_fails_without_body()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/posts/create')
            ->type('My Title', 'title')
            ->press('Save')
            ->seePageIs('/admin/posts/create')
            ->see('My Title')
            ->dontSeeInDatabase('posts', ['title' => 'My Title']);
    }

    /** @test */
    public function edit_all_fields()
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

    /** @test */
    public function edit_fails_without_title()
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

    /** @test */
    public function edit_fails_without_body()
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

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $post = $this->createPost();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/posts/{$post->id}")
            ->dontSeeInDatabase('posts', ['id' => $post->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $post = $this->createPost();

        $this->delete("/admin/posts/{$post->id}")
            ->seeInDatabase('posts', ['id' => $post->id]);
    }
}
