<?php

namespace Scribbl\CMS\Http\Controllers;

use Scribbl\Category;
use Scribbl\CMS\Http\Requests;
use Scribbl\Field;
use Scribbl\Post;
use Scribbl\Tag;

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
