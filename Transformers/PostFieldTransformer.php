<?php

namespace Flashtag\Api\Transformers;

use Flashtag\PostField;

class PostFieldTransformer extends Transformer
{
    /**
     * @param \Flashtag\PostField $field
     * @return array
     */
    public function transform(PostField $field)
    {
        return [
            'label' => $field->label,
            'name'  => $field->name,
            'value' => $field->pivot->value,
        ];
    }
}
