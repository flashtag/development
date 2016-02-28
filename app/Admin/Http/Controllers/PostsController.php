<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Requests\PostCreateRequest;
use Flashtag\Admin\Http\Requests\PostDestroyRequest;
use Flashtag\Admin\Http\Requests\PostUpdateRequest;
use Flashtag\Data\Author;
use Flashtag\Data\Category;
use Flashtag\Data\Field;
use Flashtag\Data\Post;
use Flashtag\Data\Tag;

class PostsController extends Controller
{
    public function index()
    {
        return view('admin::posts.index');
    }

    public function show($id)
    {
        return redirect()->route('admin.posts.edit', [$id], 301);
    }

    public function create()
    {
        $post = new Post();

        $categories = Category::all(['id', 'name']);
        $tags = Tag::all(['id', 'name']);
        $authors = Author::all(['id', 'name']);
        $fields = Field::all();

        return view('admin::posts.create', compact('post', 'categories', 'tags', 'authors', 'fields'));
    }

    public function store(PostCreateRequest $request)
    {
        $post = Post::create($this->buildPostFromRequest($request));

        $this->handleImageUpload($post, $request->file('image'));
        $this->syncTags($post, $request->get('tags'));
        $this->syncFields($post, $request->get('fields'));

        return redirect()->route('admin.posts.index');
    }

    public function edit($id)
    {
        $post = Post::with('author', 'fields', 'category', 'tags')->findOrFail($id);
        $post->lock(auth()->user()->id);

        $categories = Category::all(['id', 'name']);
        $tags = Tag::all(['id', 'name']);
        $authors = Author::all(['id', 'name']);
        $fields = Field::all();

        return view('admin::posts.edit', compact('post', 'categories', 'tags', 'authors', 'fields'));
    }

    public function update(PostUpdateRequest $request, $id)
    {
        $post = Post::findOrFail($id);

        $post->update($this->buildPostFromRequest($request));

        $this->handleImageUpload($post, $request->file('image'));
        $this->syncTags($post, $request->get('tags'));
        $this->syncFields($post, $request->get('fields'));

        return redirect()->route('admin.posts.index');
    }

    private function buildPostFromRequest($request)
    {
        $data['title'] = $request->get('title');
        $data['subtitle'] = $request->get('subtitle');
        $data['slug'] = str_slug($request->get('title'));
        $data['category_id'] = $request->get('category_id');
        $data['body'] = $request->get('body');
        $data['author_id'] = $request->get('author_id');
        $data['show_author'] = $request->get('show_author', false);
        $data['is_published'] = $request->get('is_published', false);
        $data['meta_description'] = $request->get('meta_description');
        $data['meta_canonical'] = $request->get('meta_canonical');

        if ($request->get('start_showing_at')) {
            $data['start_showing_at'] = $request->get('start_showing_at');
        }
        if ($request->get('stop_showing_at')) {
            $data['stop_showing_at'] = $request->get('stop_showing_at');
        }

        return $data;
    }

    private function handleImageUpload(Post $post, $image)
    {
        if (! empty($image)) {
            $post->addImage($image);
        }
    }

    private function syncTags($post, $tags = [])
    {
        $post->tags()->sync((array) $tags);
    }

    private function syncFields($post, $fields = [])
    {
        foreach ((array) $fields as $id => $field) {
            $post->fields()->sync([$id => ['value' => $field]], false);
        }
    }

    public function destroy(PostDestroyRequest $request, $id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return redirect()->route('admin.posts.index');
    }
}