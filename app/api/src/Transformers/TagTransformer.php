<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Posts\Tag;

class TagTransformer extends Transformer
{
    /**
     * @param \Flashtag\Posts\Tag $tag
     * @return array
     */
    public function transform(Tag $tag)
    {
        return [
            'id' => (int) $tag->id,
            'name' => $tag->name,
            'slug' => $tag->slug,
            'description' => $tag->description,
            'created_at' => $tag->created_at->getTimestamp(),
            'updated_at' => $tag->updated_at->getTimestamp(),
        ];
    }
}
