<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Illuminate\Http\Request;
use Flashtag\Api\Transformers\PostTransformer;
use Flashtag\Post;

class PostsController extends Controller
{
    /**
     * @var \Flashtag\Post
     */
    private $post;

    /**
     * @param \Flashtag\Post $post
     */
    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    /**
     * Display a listing of the posts.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $posts = $this->post->paginate($count);

        $this->appendPaginationLinks($posts, $request);

        return $this->response->paginator($posts, new PostTransformer());
    }

    /**
     * Display the specified post.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $post = $this->post->findOrFail($id);

        return $this->response->item($post, new PostTransformer());
    }

    /**
     * Store a newly created post in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $postData = $this->buildPostFromRequest($request);
        $post = $this->post->create($postData);

        return $this->response->item($post, new PostTransformer());
    }

    /**
     * Update the specified post in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $postData = $this->buildPostFromRequest($request);
        $post = $this->post->findOrFail((int)$id);
        $post->update($postData);

        return $this->response->item($post, new PostTransformer());
    }

    /**
     * Build the post data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildPostFromRequest(Request $request)
    {
        return [
            'title'            => $request->get('title'),
            'slug'             => str_slug($request->get('title')),
            'subtitle'         => $request->get('subtitle'),
            'order'            => $request->get('order'),
            'category_id'      => $request->get('category_id'),
            'body'             => $request->get('body'),
            'is_published'     => $request->get('is_published'),
            'start_showing_at' => $request->get('start_showing_at'),
            'stop_showing_at'  => $request->get('stop_showing_at'),
        ];
    }

    /**
     * Remove the specified post from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $post = $this->post->findOrFail((int)$id);
        $post->delete();

        return $this->response->item($post, new PostTransformer());
    }
}
