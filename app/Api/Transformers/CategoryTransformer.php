<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Category;

class CategoryTransformer extends Transformer
{
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
}
