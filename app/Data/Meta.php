<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Meta
 *
 * @property int $id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Model $post
 * @property \Illuminate\Database\Eloquent\Model $category
 */
class Meta extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'meta';

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function post()
    {
        return $this->morphTo(Post::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphTo
     */
    public function category()
    {
        return $this->morphTo(Category::class);
    }
}
