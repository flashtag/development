<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Tag;

class TagTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\Tag $tag
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
