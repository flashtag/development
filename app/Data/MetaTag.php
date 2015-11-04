<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;

/**
 * Class MetaTag
 *
 * @property int $id
 * @property string $url
 * @property string $description
 * @property string $image
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class MetaTag extends Model
{
    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function metaTaggable()
    {
        return $this->morphTo();
    }
}
