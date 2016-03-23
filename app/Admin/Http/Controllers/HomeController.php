<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Data\Post;

class HomeController extends Controller
{
    public function home()
    {
        $mostViewed = Post::mostViewed(5)->get();
        $mostViews = $mostViewed->first()->views ?: 1;

        $leastViewed = Post::leastViewed(5)->get();
        $leastViews = $leastViewed->first()->views ?: 1;

        return  view('admin::home', compact('mostViewed', 'leastViewed', 'mostViews', 'leastViews'));
    }
}
