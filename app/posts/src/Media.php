<?php

namespace Flashtag\Posts;

/**
 * Class Media
 *
 * @property int $id
 * @property string $url
 * @property string $type
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Media extends Model
{
    /**
     * The name of the database table.
     *
     * @var string
     */
    protected $table = 'media';

    /**
     * The attributes that are protected from mass assignment.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * The available types.
     *
     * @var array
     */
    public static $types = ['image', 'video'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function mediaAttachable()
    {
        return $this->morphTo();
    }
}
