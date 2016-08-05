<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Posts\MetaTag;

class MetaTagTransformer extends Transformer
{
    /**
     * @param \Flashtag\Posts\MetaTag $meta
     * @return array
     */
    public function transform(MetaTag $meta)
    {
        return [
            'id' => (int) $meta->id,
            'url' => $meta->url,
            'description' => $meta->description,
            'image' => $meta->image,
            'created_at' => $meta->created_at->getTimestamp(),
            'updated_at' => $meta->updated_at->getTimestamp(),
        ];
    }
}
