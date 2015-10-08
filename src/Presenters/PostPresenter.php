<?php

namespace Scribbl\Presenters;

use Carbon\Carbon;
use McCool\LaravelAutoPresenter\BasePresenter;
use Scribbl\Post;

class PostPresenter extends BasePresenter
{
    /**
     * @param \Scribbl\Post $resource
     */
    public function __construct(Post $resource)
    {
        $this->wrappedObject = $resource;
    }

    /**
     * @return bool
     */
    public function isShowing()
    {
        if (! $this->wrappedObject->is_published) {
            return false;
        }

        $startShowing = $this->wrappedObject->start_showing_at ?: new Carbon('1999-01-01');
        $stopShowing = $this->wrappedObject->stop_showing_at ?: new Carbon('2038-01-01');

        return ($startShowing->isPast() && $stopShowing->isFuture());
    }
}
