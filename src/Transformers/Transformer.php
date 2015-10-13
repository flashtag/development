<?php

namespace Scribbl\Api\Transformers;

use League\Fractal\Pagination\Cursor;
use League\Fractal\TransformerAbstract;

abstract class Transformer extends TransformerAbstract
{
    /**
     * @param mixed $data
     * @param Transformer $transformer
     * @param int $cursor
     * @param string $resourceKey
     * @return \League\Fractal\Scope
     */
    public function cursorCollection($data, $transformer = null, $cursor = null, $resourceKey = null)
    {
        $resource = $this->collection($data, $transformer, $resourceKey);

        return $resource->setCursor($this->makeCursor($cursor, $data));
    }

    /**
     * @param mixed $cursor
     * @param \Illuminate\Support\Collection $data
     * @return Cursor
     */
    protected function makeCursor($cursor, $data)
    {
        if ($cursor instanceof Cursor) {
            return $cursor;
        }

        if (is_array($cursor) && ! $data->isEmpty()) {
            $current = (int) ($data->first()->id - 1);
            $next    = (int)  $data->last()->id;
            $count   = (int)  $data->count();
            $prev    = ! empty($cursor['prev']) ? (int) $cursor['prev'] : null;

            return new Cursor($current, $prev, $next, $count);
        }

        return new Cursor();
    }
}
