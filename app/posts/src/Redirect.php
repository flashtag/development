<?php

namespace Flashtag\Posts;

use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    /**
     * Properties guarded from mass assignment.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];
}
