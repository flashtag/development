<?php

namespace Scribbl;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function categories()
    {
        return $this->morphedByMany(Category::class, 'taggable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }
}