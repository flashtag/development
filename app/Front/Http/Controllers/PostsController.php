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
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if (is_numeric($id)) {
            $post = Post::findOrFail($id);
            return redirect()->route('posts.show', [$post->slug]);
        }

        $post = Post::getBySlug($id);

        // TODO: only retrieve showing posts to avoid this check.
        if (! $post->isShowing()) {
            abort(404);
        }

        $post->viewed();

        return view('flashtag::posts.show', compact('post'));
    }
}
