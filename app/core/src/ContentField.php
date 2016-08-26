<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ContentField
 * @package Flashtag\Core
 *
 * @property string $id
 * @property string $content_id
 * @property string $field_id
 * @property mixed $value
 * @property \Flashtag\Core\Content $content
 * @property \Flashtag\Core\Field $field
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class ContentField extends Model
{
    use Uuid;

    protected $table = 'content_field';

    public $incrementing = false;

    protected $casts = [
        'value' => 'array',
    ];

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

//    public function getValueAttribute($value)
//    {
//        return json_decode($value);
//    }
//
//    public function setValueAttribute($value)
//    {
//        $this->attributes['value'] = json_encode($value);
//    }
}
