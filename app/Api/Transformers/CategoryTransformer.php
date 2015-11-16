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
    protected $availableIncludes = ['tags', 'meta'];

    /**
     * @param \Flashtag\Data\Category $category
     * @return array
     */
    public function transform(Category $category)
    {
        return [
            'id' => (int) $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'created_at' => $category->created_at->getTimestamp(),
            'updated_at' => $category->updated_at->getTimestamp(),
        ];
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
