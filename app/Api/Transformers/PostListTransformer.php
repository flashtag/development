<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\PostList;

class PostListTransformer extends Transformer
{
    /**
     * List of resources possible to include
     *
     * @var array
     */
//    protected $availableIncludes = ['posts'];

    /**
     * @var array
     */
    protected $defaultIncludes = ['posts'];

    /**
     * @param \Flashtag\Data\PostList $postList
     * @return array
     */
    public function transform(PostList $postList)
    {
        return [
            'id' => (int) $postList->id,
            'name' => $postList->name,
            'slug' => $postList->slug,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
        ];
    }

    /**
     * Include posts.
     *
     * @param \Flashtag\Data\PostList $postList
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeFields(PostList $postList)
    {
        $posts = $postList->posts;

        if (empty($posts)) {
            return null;
        }

        return $this->collection($posts, new PostTransformer());
    }
}
