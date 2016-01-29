<?php

namespace Flashtag\Admin\Http\Controllers;

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
        //
    }

    public function store()
    {
        //
    }

    public function edit($id)
    {
        $post = Post::findOrFail($id);
        $post->lock(auth()->user()->id);

        $categories = Category::all(['id', 'name']);
        $tags = Tag::all(['id', 'name']);
        $authors = Author::all(['id', 'name']);
        $fields = Field::all();

        return view('admin::posts.edit', compact('post', 'categories', 'tags', 'authors', 'fields'));
    }

    public function update($id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}