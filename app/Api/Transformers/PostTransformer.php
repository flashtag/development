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
    protected $availableIncludes = ['category', 'tags', 'fields', 'revisions', 'meta', 'ratings', 'author'];

    /**
     * @param \Flashtag\Data\Post $post
     * @return array
     */
    public function transform(Post $post)
    {
        return [
            'id' => (int) $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'subtitle' => $post->subtitle,
            'category_id' => (int) $post->category_id,
            'author_id' => (int) $post->author_id,
            'order' => (int) $post->order,
            'body' => $post->body,
            'is_published' => (bool) $post->is_published,
            'start_showing_at' => $post->start_showing_at->getTimestamp(),
            'stop_showing_at' => $post->stop_showing_at->getTimestamp(),
            'is_locked' => (bool) $post->is_locked,
            'locked_by_id' => (int) $post->locked_by_id,
            'created_at' => $post->created_at->getTimestamp(),
            'updated_at' => $post->updated_at->getTimestamp(),
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
        return $this->collection($post->fields, new FieldTransformer());
    }

    /**
     * Include Category
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Item
     */
    public function includeCategory(Post $post)
    {
        return $this->item($post->category, new CategoryTransformer());
    }

    /**
     * Include tags.
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeTags(Post $post)
    {
        return $this->collection($post->tags, new TagTransformer());
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
        return $this->collection($post->revisionHistory, new RevisionTransformer());
    }

    /**
     * Include meta.
     *
     * @param \Flashtag\Data\Post $post
     * @return \League\Fractal\Resource\Item
     */
    public function includeMeta(Post $post)
    {
        return $this->item($post->meta, new MetaTagTransformer());
    }

    /**
     * Include ratings.
     *
     * @param Post $post
     * @return \League\Fractal\Resource\Collection
     */
    public function includeRatings(Post $post)
    {
        return $this->collection($post->ratings, new PostRatingTransformer());
    }

    /**
     * Include author.
     *
     * @param Post $post
     * @return \League\Fractal\Resource\Item
     */
    public function includeAuthor(Post $post)
    {
        return $this->item($post->author, new AuthorTransformer());
    }
}
