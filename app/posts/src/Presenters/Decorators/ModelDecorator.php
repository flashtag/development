<?php

namespace Flashtag\Posts\Presenters\Decorators;

use Flashtag\Posts\Post;
use Flashtag\Posts\Presenters\PostPresenter;
use Illuminate\Contracts\Container\Container;
use McCool\LaravelAutoPresenter\Decorators\DecoratorInterface;
use McCool\LaravelAutoPresenter\Exceptions\PresenterNotFoundException;
use McCool\LaravelAutoPresenter\HasPresenter;

class ModelDecorator implements DecoratorInterface
{
    /**
     * @var Container
     */
    protected $app;

    /**
     * @param Container $app
     */
    public function __construct(Container $app)
    {
        $this->app = $app;
    }

    /**
     * Can the subject be decorated?
     *
     * @param mixed $subject
     * @return bool
     */
    public function canDecorate($subject)
    {
        return $subject instanceof HasPresenter;
    }

    /**
     * Decorate a given subject.
     *
     * @param Post|PostPresenter $subject
     * @return Post|PostPresenter
     * @throws PresenterNotFoundException
     */
    public function decorate($subject)
    {
        if (method_exists($subject, 'getWrappedObject')) {
            $subject = $subject->getWrappedObject();
        }

        if ($subject instanceof Post) {
            $this->mapPostFields($subject);
        }

        if (! class_exists($presenterClass = $subject->getPresenterClass())) {
            throw new PresenterNotFoundException($presenterClass);
        }

        return $this->app->make($presenterClass, ['resource' => $subject]);
    }

    /**
     * Map the post field values to the post object.
     *
     * @param Post $post
     */
    private function mapPostFields($post)
    {
        $post->fields->each(function ($field) use (&$post) {
            $post->{$field->name} = $field->pivot->value;
        });
    }
}
