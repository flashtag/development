<?php

namespace Scribbl\Api\Http\Controllers;

use Illuminate\Http\Request;
use Scribbl\Api\DataFormatter;
use Scribbl\Api\Http\Response;
use Scribbl\Api\Transformers\TransformerManager;
use Scribbl\Post;

class PostsController extends Controller
{
    /**
     * @var \Scribbl\Post
     */
    private $post;

    /**
     * @var \Scribbl\Api\DataFormatter
     */
    private $dataFormatter;

    /**
     * @var \Scribbl\Api\Http\Response
     */
    private $response;

    /**
     * @param \Scribbl\Post $post
     * @param \Scribbl\Api\DataFormatter $dataFormatter
     * @param \Scribbl\Api\Http\Response $response
     */
    public function __construct(Post $post, DataFormatter $dataFormatter, Response $response)
    {
        $this->post = $post;
        $this->dataFormatter = $dataFormatter;
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
        $cursor = $this->buildCursorFromRequest($request);
        $includes = $request->get('include', []);

        $data = $this->dataFormatter->collection($posts, $cursor, $includes);

        return $this->response->collection($data);
    }

    /**
     * Build a cursor array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildCursorFromRequest(Request $request)
    {
        return [
            'current'  => $request->get('current'),
            'previous' => $request->get('prev'),
            'next'     => $request->get('next'),
            'count'    => $request->get('count', 1000),
        ];
    }

    /**
     * Display the specified post.
     *
     * @param \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $post = $this->post->findOrFail($id);
        $includes = $request->get('include', []);

        $data = $this->dataFormatter->item($post, $includes);

        return $this->response->item($data);
    }

    /**
     * Store a newly created post in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $postData = $this->buildPostFromRequest($request);
        $post = $this->post->create($postData);

        $data = $this->dataFormatter->item($post);

        return $this->response->item($data);
    }

    /**
     * Update the specified post in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $postData = $this->buildPostFromRequest($request);
        $post = $this->post->findOrFail((int)$id);
        $post->update($postData);

        $data = $this->dataFormatter->item($post);

        return $this->response->item($data);
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
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $post = $this->post->findOrFail((int)$id);
        $post->delete();

        $data = $this->dataFormatter->item($post);

        return $this->response->item($data);
    }
}
