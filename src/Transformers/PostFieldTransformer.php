<?php

namespace Scribbl\Api\Transformers;

use Scribbl\PostField;

class PostFieldTransformer extends Transformer
{
    /**
     * @param \Scribbl\PostField $field
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
