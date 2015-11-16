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
            'id' => (int) $field->id,
            'label' => $field->label,
            'name' => $field->name,
            'value' => isset($field->pivot) ? $field->pivot->value : null,
            'description' => $field->description,
            'template' => $field->template,
        ];
    }
}
