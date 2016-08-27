<?php

namespace Flashtag\Posts;

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
     * The attributes that are protected from mass assignment.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];
}
