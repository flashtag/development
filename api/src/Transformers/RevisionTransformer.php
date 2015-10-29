<?php

namespace Flashtag\Api\Transformers;

use Venturecraft\Revisionable\Revision;

class RevisionTransformer extends Transformer
{
    /**
     * @param \Venturecraft\Revisionable\Revision $revision
     * @return array
     */
    public function transform(Revision $revision)
    {
        return [
            'key'       => $revision->key,
            'old_value' => $revision->old_value,
            'new_value' => $revision->new_value,
        ];
    }
}
