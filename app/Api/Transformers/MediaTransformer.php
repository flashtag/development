<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Media;

class MediaTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\Media $field
     * @return array
     */
    public function transform(Media $field)
    {
        return [
            'id' => (int) $field->id,
            'url' => $field->url,
            'type' => $field->type,
            'created_at' => $field->created_at->getTimeStamp(),
            'updated_at' => $field->updated_at->getTimeStamp(),
        ];
    }
}
