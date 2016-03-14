<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Data\Post;
use Flashtag\Data\Tag;

class TagsController extends Controller
{
    /**
     * Display a listing of tags.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param string $tag_slug
     * @return \Illuminate\Http\Response
     */
    public function show($tag_slug)
    {
        $tag = Tag::getBySlug($tag_slug);

        $posts = Post::whereHas('tags', function ($query) use ($tag_slug) {
            $query->where('slug', $tag_slug);
        })->simplePaginate();

        return view('flashtag::posts.tag', compact('tag', 'posts'));
    }
}
