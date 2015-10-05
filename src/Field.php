<?php

namespace Scribbl;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Field
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $template
 * @property \Illuminate\Database\Eloquent\Collection $posts
 * @property \Illuminate\Database\Eloquent\Collection $categories
 */
class Field extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['value', 'value_type'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'fieldable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function categories()
    {
        return $this->morphedByMany(Category::class, 'fieldable');
    }
}
