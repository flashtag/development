<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Core\Post;

class PostTransformer extends Transformer
{
    /**
     * List of resources possible to include
     *
     * @var array
     */
    protected $availableIncludes = ['category', 'tags', 'fields', 'revisions'];

    /**
     * @param \Flashtag\Core\Post $post
     * @return array
     */
    public function transform(Post $post)
    {
        return [
            'id'               => $post->id,
            'title'            => $post->title,
            'slug'             => $post->slug,
            'subtitle'         => $post->subtitle,
            'order'            => $post->order,
            'category_id'      => $post->category_id,
            'body'             => $post->body,
            'is_published'     => $post->is_published,
            'start_showing_at' => $post->start_showing_at->getTimestamp(),
            'stop_showing_at'  => $post->stop_showing_at->getTimestamp(),
            'created_at'       => $post->created_at->getTimestamp(),
            'updated_at'       => $post->updated_at->getTimestamp(),
        ];
    }

    /**
     * @param \Flashtag\Core\Post $post
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeFields(Post $post)
    {
        $fields = $post->fields;

        return $this->collection($fields, new FieldTransformer);
    }

    /**
     * Include Category
     *
     * @param \Flashtag\Core\Post $post
     * @return \League\Fractal\ItemResource
     */
    public function includeCategory(Post $post)
    {
        $category = $post->category;

        return $this->item($category, new CategoryTransformer);
    }

    /**
     * @param \Flashtag\Core\Post $post
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeRevisions(Post $post)
    {
        $revisions = $post->revisionHistory;

        return $this->collection($revisions, new RevisionTransformer);
    }
}
