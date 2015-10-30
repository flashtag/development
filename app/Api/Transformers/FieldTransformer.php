<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Core\Field;

class PostFieldTransformer extends Transformer
{
    /**
     * @param \Flashtag\Core\Field $field
     * @return array
     */
    public function transform(Field $field)
    {
        return [
            'label' => $field->label,
            'name'  => $field->name,
            'value' => $field->pivot->value,
        ];
    }
}
