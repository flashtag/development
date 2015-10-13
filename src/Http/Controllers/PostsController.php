<?php

namespace Scribbl\Api\Http\Controllers;

use Illuminate\Http\Request;
use Scribbl\Api\Http\Response;
use Scribbl\Post;

class PostsController extends Controller
{
    /**
     * @var \Scribbl\Post
     */
    private $post;

    /**
     * @var \Scribbl\Api\Http\Response
     */
    private $response;

    /**
     * @param \Scribbl\Post $post
     * @param \Scribbl\Api\Http\Response $response
     */
    public function __construct(Post $post, Response $response)
    {
        $this->post = $post;
        $this->response = $response;
    }

    /**
     * Display a listing of the posts.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $posts = $this->post->all();

        return $this->response->collection($posts);
    }

    /**
     * Display the specified post.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $post = $this->post->findOrFail((int) $id);

        return $this->response->item($post);
    }

    /**
     * Store a newly created post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $post = $this->post->createFromRequest($request);

        return $this->response->item($post);
    }

    /**
     * Update the specified post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $post = $this->post->findOrFail((int) $id);
        $post->updateFromRequest($request);

        return $this->response->item($post);
    }

    /**
     * Remove the specified post from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $post = $this->post->findOrFail((int) $id);
        $post->delete();

        return $this->response->item($post);
    }
}
