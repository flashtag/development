<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Data\Author;
use Flashtag\Data\Post;

class AuthorsController extends Controller
{
    /**
     * Display a listing of posts.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $authors = Author::all();

        return response()->json($authors);
    }

    /**
     * Display the specified resource.
     *
     * @param string $author_slug
     * @return \Illuminate\Http\Response
     */
    public function show($author_slug)
    {
        $author = Author::getBySlug($author_slug);

        $posts = Post::whereHas('author', function ($query) use ($author_slug) {
            $query->where('slug', $author_slug)
                ->where('show_author', true);
        })->simplePaginate();

        return view('flashtag::authors.show', compact('author', 'posts'));
    }
}
