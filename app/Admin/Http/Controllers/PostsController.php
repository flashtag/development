<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Data\Author;
use Flashtag\Data\Category;
use Flashtag\Data\Field;
use Flashtag\Data\Post;
use Flashtag\Data\Tag;
use Illuminate\Http\Request;

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
        //
    }

    public function store()
    {
        //
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

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $post->update([
            'title' => $request->get('title'),
            'subtitle' => $request->get('subtitle'),
            'category_id' => $request->get('category_id'),
            'body' => $request->get('body'),
            'author_id' => $request->get('author_id'),
            'show_author' => $request->get('show_author', false),
            'is_published' => $request->get('is_published', false),
            'start_showing_at' => $request->get('start_showing_at'),
            'stop_showing_at' => $request->get('stop_showing_at'),
        ]);

        $this->syncTags($post, $request->get('tags'));
        $this->syncFields($post, $request->get('fields'));

        return back();
    }

    private function syncTags($post, $tags = [])
    {
        $post->tags()->sync($tags);
    }

    private function syncFields($post, $fields = [])
    {
        foreach ($fields as $id => $field) {
            $post->fields()->sync([$id => ['value' => $field]], false);
        }
    }

    public function destroy($id)
    {
        //
    }
}