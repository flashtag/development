<?php

namespace Flashtag\Posts\Presenters;

use Carbon\Carbon;
use McCool\LaravelAutoPresenter\BasePresenter;
use Flashtag\Posts\Post;

class PostPresenter extends BasePresenter
{
    /**
     * @param \Flashtag\Posts\Post $resource
     */
    public function __construct(Post $resource)
    {
        parent::__construct($resource);
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

    public function publishedOn()
    {
        $date = $this->wrappedObject->start_showing_at ?: $this->wrappedObject->created_at;

        return $date->format("F j, Y");
    }

    public function coverImageSrc()
    {
        if (! $this->wrappedObject->cover_image) {
            return settings('default_cover');
        }

        return "/images/media/".$this->wrappedObject->cover_image;
    }
}
