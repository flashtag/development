<?php

namespace Flashtag\Cms\Http\Controllers;

use Flashtag\Category;
use Flashtag\Cms\Http\Requests;
use Flashtag\Field;
use Flashtag\Post;
use Flashtag\Tag;

class TestController extends Controller
{
    public function posts()
    {
        return Post::with(['category', 'tags', 'fields'])->get();
    }

    public function fields()
    {
        return Field::all();
    }

    public function categories()
    {
        return Category::all();
    }

    public function tags()
    {
        return Tag::all();
    }
}
