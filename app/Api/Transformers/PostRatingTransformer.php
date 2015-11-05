<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\PostRating;

class PostRatingTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\PostRating $rating
     * @return array
     */
    public function transform(PostRating $rating)
    {
        return [
            'id' => (int) $rating->id,
            'value' => $rating->value,
            'ip' => $rating->ip,
            'created_at' => $rating->created_at->getTimestamp(),
            'updated_at' => $rating->updated_at->getTimestamp(),
        ];
    }
}
