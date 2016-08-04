<?php

namespace Flashtag\Admin\Http\Controllers\Web;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\Category;
use Flashtag\Posts\Page;
use Flashtag\Posts\Post;
use Flashtag\Posts\Tag;

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
