<?php

namespace Scribbl;

/**
 * Class CategoryField
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $template
 * @property \Illuminate\Database\Eloquent\Collection $posts
 * @property \Illuminate\Database\Eloquent\Collection $categories
 */
class CategoryField extends Field
{
    /**
     * The database table name.
     *
     * @var string
     */
    protected $table = 'category_fields';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function categories()
    {
        return $this->morphedByMany(Category::class, 'fieldable');
    }
}
