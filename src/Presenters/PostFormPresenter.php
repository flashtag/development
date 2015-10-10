<?php

namespace Scribbl\Presenters;

use McCool\LaravelAutoPresenter\BasePresenter;
use Scribbl\Forms\PostForm;

class PostFormPresenter extends BasePresenter
{
    /**
     * @param \Scribbl\Post $resource
     */
    public function __construct(PostForm $resource)
    {
        $this->wrappedObject = $resource;
    }

}
