<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    /**
     * Properties guarded from mass assignment.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

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

    public static function getBySlug($tag_slug)
    {
        return static::where('slug', $tag_slug)
            ->firstOrFail();
    }

    public function getShowingPosts()
    {
        return $this->posts->filter(function ($post) {
            return $post->isShowing();
        });
    }
}