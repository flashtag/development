<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Content
 * @package Flashtag\Core
 *
 * @property string $id
 * @property string $content_type_id
 * @property \Flashtag\Core\ContentType $type
 * @property \Illuminate\Database\Eloquent\Collection $fields
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Content extends Model
{
    use Uuid;

    protected $table = 'content';
    public $incrementing = false;

    public function type()
    {
        return $this->belongsTo(ContentType::class);
    }

    public function fields()
    {
        return $this->hasMany(ContentField::class);
    }
}
