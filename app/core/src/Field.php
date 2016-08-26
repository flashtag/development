<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Field
 * @package Flashtag\Core
 *
 * @property string $id
 * @property string $field_type_id
 * @property \Flashtag\Core\FieldType $type
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Field extends Model
{
    use Uuid;

    protected $table = 'fields';
    public $incrementing = false;

    public function type()
    {
        return $this->belongsTo(FieldType::class);
    }
}
