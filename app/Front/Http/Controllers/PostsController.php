<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Data\Post;

class PostsController extends Controller
{
    /**
     * Display a listing of posts.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $posts = Post::getLatest(10);

        return view('flashtag::posts.index', compact('posts'));
    }

    /**
     * Display the specified resource.
     *
     * @param string $post_slug
     * @return \Illuminate\Http\Response
     */
    public function show($post_slug)
    {
        try {
            $post = Post::showing()->whereSlug($post_slug)->firstOrFail();
        } catch (\Exception $e) {
            abort(404);
        }

        $post->viewed();

        return view('flashtag::posts.show', compact('post'));
    }
}
