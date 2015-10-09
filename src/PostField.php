<?php

namespace Scribbl;

/**
 * Class PostField
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $template
 * @property \Illuminate\Database\Eloquent\Collection $posts
 * @property \Illuminate\Database\Eloquent\Collection $categories
 */
class PostField extends Field
{
    /**
     * The database table name.
     *
     * @var string
     */
    protected $table = 'post_fields';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'fieldable');
    }
}
