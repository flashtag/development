<?php

namespace Scribbl\Api\Http\Controllers;

use Illuminate\Http\Request;
use Scribbl\Api\Transformers\TransformerManager;
use Scribbl\Post;

class PostsController extends Controller
{
    /**
     * @var \Scribbl\Post
     */
    private $post;

    /**
     * @var \Scribbl\Api\Transformers\TransformerManager
     */
    private $transformerManager;

    /**
     * @param \Scribbl\Post $post
     * @param \Scribbl\Api\Transformers\TransformerManager $transformerManager
     */
    public function __construct(Post $post, TransformerManager $transformerManager)
    {
        $this->post = $post;
        $this->transformerManager = $transformerManager;
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
        $data = $this->transformerManager($posts);

        return $this->response->collection($data);
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
        $data = $this->transformerManager($post);

        return $this->response->item($data);
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
        $data = $this->transformerManager($post);

        return $this->response->item($data);
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
        $data = $this->transformerManager($post);

        return $this->response->item($data);
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
        $data = $this->transformerManager($post);

        return $this->response->item($data);
    }
}
