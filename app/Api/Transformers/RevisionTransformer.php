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
            'id' => (int) $revision->id,
            'key' => $revision->key,
            'user_id' => $revision->user_id,
            'old_value' => $revision->old_value,
            'new_value' => $revision->new_value,
            'created_at' => $revision->created_at->getTimestamp(),
            'updated_at' => $revision->updated_at->getTimestamp(),
        ];
    }
}
