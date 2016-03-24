<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Data\Category;
use Flashtag\Data\Page;
use Flashtag\Data\Post;
use Flashtag\Data\Tag;

class HomeController extends Controller
{
    public function home()
    {
        $mostViewed = Post::mostViewed(5)->get();
        $leastViewed = Post::leastViewed(5)->get();

        $postCount = Post::count();
        $categoryCount = Category::count();
        $tagCount = Tag::count();
        $pageCount = Page::count();

        return  view('admin::home', compact('mostViewed', 'leastViewed', 'mostViews', 'leastViews', 'postCount', 'categoryCount', 'tagCount', 'pageCount'));
    }
}
