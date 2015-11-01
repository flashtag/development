<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Field;

class FieldTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\Field $field
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
