<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class ContentType
 * @package Flashtag\Core
 *
 * @property string $id
 * @property string $name
 * @property string $route
 * @property \Illuminate\Database\Eloquent\Collection $fields
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class ContentType extends Model
{
    use Uuid;

    protected $table = 'content_types';
    public $incrementing = false;

    public function fields()
    {
        return $this->belongsToMany(Field::class);
    }
}
