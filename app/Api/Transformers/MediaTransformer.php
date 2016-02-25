<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Media;

class MediaTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\Media $media
     * @return array
     */
    public function transform(Media $media)
    {
        return [
            'id' => (int) $media->id,
            'url' => $media->url,
            'type' => $media->type,
            'created_at' => $media->created_at->getTimeStamp(),
            'updated_at' => $media->updated_at->getTimeStamp(),
        ];
    }
}
