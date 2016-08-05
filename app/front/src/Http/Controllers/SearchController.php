<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Posts\Post;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Display the search result page.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\View\View
     */
    public function search(Request $request)
    {
        $query = $request->get('q', false);

        $posts = $query
            ? Post::showing()->search($query)->get()
            : collect([]);

        return view('flashtag::search', compact('posts', 'query'));
    }
}
