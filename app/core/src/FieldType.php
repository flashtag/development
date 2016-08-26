<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class FieldType
 * @package Flashtag\Core
 *
 * @property int $id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class FieldType extends Model
{
    protected $table = 'field_types';
}
