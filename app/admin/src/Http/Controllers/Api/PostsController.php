<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\Post;
use Illuminate\Http\Request;

class PostsController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $posts = Post::with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $post = Post::with('category')
            ->findOrFail($id);

        return response()->json($post);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        Post::create($this->buildPostFromRequest($request));
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $post->update($request->all());
    }

    /**
     * @param int $id
     */
    public function lock($id)
    {
        $post = Post::findOrFail($id);
        $post->is_locked = true;
        $post->locked_by_id = \Auth::user()->id;
        $post->save();
    }

    /**
     * @param int $id
     */
    public function unlock($id)
    {
        $post = Post::findOrFail($id);
        $post->is_locked = false;
        $post->locked_by_id = null;
        $post->save();
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        $query = str_replace(' ', '%', ' '.$query.' ');

        $posts = Post::whereRaw('lower(title) like ?', [$query])
            ->get();

        return response()->json($posts);
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();
    }

    /**
     * Build the post data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildPostFromRequest(Request $request)
    {
        $post = $request->only([
            'title',
            'subtitle',
            'category_id',
            'author_id',
            'show_author',
            'body',
            'is_published',
            'start_showing_at',
            'stop_showing_at',
        ]);
        if (isset($post['title'])) {
            $post['slug'] = str_slug($post['title']);
        }

        return $post;
    }
}