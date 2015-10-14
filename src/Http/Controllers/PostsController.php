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
    private $transformer;

    /**
     * @param \Scribbl\Post $post
     * @param \Scribbl\Api\Transformers\TransformerManager $transformer
     */
    public function __construct(Post $post, TransformerManager $transformer)
    {
        $this->post = $post;
        $this->transformer = $transformer;
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
        $data = $this->transformer->collection($posts, $request->get('include', []));

        return $this->response->collection($data);
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
        $data = $this->transformer->item($post, $request->get('include', []));

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
        $postData = [
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

        $post = $this->post->create($postData);
        $data = $this->transformer->item($post);

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
        $postData = [
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

        $post = $this->post->findOrFail((int)$id);
        $post->update($postData);
        $data = $this->transformer->item($post);

        return $this->response->item($data);
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
        $data = $this->transformer->item($post);

        return $this->response->item($data);
    }
}
