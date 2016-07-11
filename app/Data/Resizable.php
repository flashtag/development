<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;

class Resizable extends Model
{
    protected $fillable = [
        'original', 'lg', 'md', 'sm', 'xs'
    ];

    public function resizeable()
    {
        return $this->morphTo();
    }
}
