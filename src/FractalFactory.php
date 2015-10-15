<?php

namespace Scribbl\Api;

use League\Fractal\Pagination\Cursor;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;

class FractalFactory
{
    public function item($model, $transformer)
    {
        return new Item($model, $transformer);
    }

    public function collection($models, $transformer)
    {
        return new Collection($models, $transformer);
    }

    public function cursor($current = null, $previous = null, $next = null, $count = null)
    {
        return new Cursor($current, $previous, $next, $count);
    }
}