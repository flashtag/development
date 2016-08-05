<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Posts\Category;
use Flashtag\Posts\Post;

class HomeController extends Controller
{
    /**
     * Display the default page.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $posts = Post::getLatest(10);
        $categories = Category::all();

        return view('flashtag::home', compact('posts', 'categories'));
    }
}
