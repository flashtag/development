<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Category;

class CategoryTransformer extends Transformer
{
    /**
     * List of resources possible to include
     *
     * @var array
     */
    protected $availableIncludes = ['posts', 'tags', 'meta'];

    /**
     * @param \Flashtag\Data\Category $category
     * @return array
     */
    public function transform(Category $category)
    {
        return [
            'id' => (int) $category->id,
            'parent_id' => $category->parent_id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'order_by' => $category->order_by,
            'order_dir' => $category->order_dir,
            'created_at' => $category->created_at->getTimestamp(),
            'updated_at' => $category->updated_at->getTimestamp(),
        ];
    }

    /**
     * Include posts.
     *
     * @param \Flashtag\Data\Category $category
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includePosts(Category $category)
    {
        return $this->collection($category->posts, new PostTransformer());
    }

    /**
     * Include tags.
     *
     * @param \Flashtag\Data\Category $category
     * @return \League\Fractal\Resource\Collection
     * @throws \Exception
     */
    public function includeTags(Category $category)
    {
        return $this->collection($category->tags, new TagTransformer());
    }

    /**
     * Include meta.
     *
     * @param \Flashtag\Data\Category $category
     * @return \League\Fractal\Resource\Item
     */
    public function includeMeta(Category $category)
    {
        return $this->item($category->meta, new MetaTagTransformer());
    }
}
