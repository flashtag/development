<?php

namespace Flashtag\Posts\Presenters;

use McCool\LaravelAutoPresenter\BasePresenter;
use Flashtag\Forms\PostForm;

class PostFormPresenter extends BasePresenter
{
    /**
     * @param \Flashtag\Post $resource
     */
    public function __construct(PostForm $resource)
    {
        $this->wrappedObject = $resource;
    }

}
