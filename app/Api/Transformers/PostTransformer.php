<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Post;

class PostTransformer extends Transformer
{
    /**
     * List of resources possible to include
     *
     * @var array
     */
    protected $availableIncludes = ['category', 'tags', 'fields', 'revisions', 'meta'];

    /**
     * @param \Flashtag\Data\Post $post
     * @return array
     */
    public function transform(Post $post)
    {
        return [
            'id'               => (int) $post->id,
            'title'            => $post->title,
            'slug'             => $post->slug,
            'subtitle'         => $post->subtitle,
            'category_id'      => (int) $post->category_id,
            'body'             => $post->body,
            'is_published'     => (bool) $post->is_published,
            'start_showing_at' => $post->start_showing_at->getTimestamp(),
            'stop_showing_at'  => $post->stop_showing_at->getTimestamp(),
            'created_at'       => $post->created_at->getTimestamp(),
            'updated_at'       => $post->updated_at->getTimestamp(),
        ];
    }

    /**
     * Include custom fields.
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeFields(Post $post)
    {
        $fields = $post->fields;

        return $this->collection($fields, new FieldTransformer());
    }

    /**
     * Include Category
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Item
     */
    public function includeCategory(Post $post)
    {
        $category = $post->category;

        return $this->item($category, new CategoryTransformer());
    }

    /**
     * Include revision history.
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeRevisions(Post $post)
    {
        $revisions = $post->revisionHistory;

        return $this->collection($revisions, new RevisionTransformer());
    }

    /**
     * Include meta.
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Item
     */
    public function includeMeta(Post $post)
    {
        $meta = $post->meta;

        return $this->item($meta, new MetaTagTransformer());
    }
}
