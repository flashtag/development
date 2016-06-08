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
        $post = $this->getBySlugOrFail($post_slug);

        $post->viewed();

        return view('flashtag::posts.show', compact('post'));
    }


    /**
     * Add a rating for a post
     *
     * @param  \Illuminate\Http\Request $request
     * @param  string  $post_slug
     * @return \Illuminate\Http\RedirectResponse
     */
    public function rate(Request $request, $post_slug)
    {
        /* TODO:
            validate rating is an integer
         */

        $post = $this->getBySlugOrFail($post_slug);

        $iplong = ip2long($request->ip());

        $q = $post->ratings();

        if ($user = $request->user()) {
            $q->where('rater_id', $user->id);
        } else {
            $q->where('ip', $iplong)
              ->where('created_at', '>', \Carbon\Carbon::now()->subMonth());
        }

        if (! $q->exists()) {
            $post->addRating(
                $request->input('rating'),
                $iplong,
                isset($user) ? $user->id : null
            );
        }

        return redirect()->route('posts.show', [$post_slug]);
    }

    /**
     * Get post that is showing by slug or fail
     *
     * @param  string $post_slug The Post's slug
     * @return \Illuminate\Database\Eloquent\Model The found model by slug
     */
    protected function getBySlugOrFail($post_slug)
    {
        try {
            $post = Post::showing()->whereSlug($post_slug)->firstOrFail();
        } catch (\Exception $e) {
            abort(404);
        }

        return $post;
    }
}
