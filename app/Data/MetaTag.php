<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Meta
 *
 * @property int $id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class MetaTag extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'meta_tags';

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
