<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Flashtag\Api\Http\Requests\PublishRequest;
use Illuminate\Http\Request;
use Flashtag\Api\Transformers\PostTransformer;
use Flashtag\Data\Post;

class PostsController extends Controller
{
    /**
     * @var \Flashtag\Data\Post
     */
    private $post;

    /**
     * @param \Flashtag\Data\Post $post
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
        $post = $this->post->findOrFail($id);
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
        $post = $this->post->findOrFail($id);
        $post->delete();

        return $this->response->item($post, new PostTransformer());
    }

    /**
     * Publish or un-publish an article.
     *
     * @param PublishRequest $request
     * @param int            $id
     *
     * @return mixed
     */
    public function publish(PublishRequest $request, $id)
    {
        $is_published = $request->json('is_published');
        $user_id = $request->json('user_id');

        $post = $this->post->findOrFail($id);

        if ($is_published) {
            $post->publish();
            event(new \Flashtag\Data\Events\PostWasPublished($post, $user_id));
        } else {
            $post->unpublish();
            event(new \Flashtag\Data\Events\PostWasUnpublished($post, $user_id));
        }

        return $post;
    }
}
