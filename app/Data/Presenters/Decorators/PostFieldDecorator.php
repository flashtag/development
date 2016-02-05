<?php

namespace Flashtag\Data\Presenters\Decorators;

use Flashtag\Data\Post;
use Flashtag\Data\Presenters\PostPresenter;
use McCool\LaravelAutoPresenter\Decorators\DecoratorInterface;
use McCool\LaravelAutoPresenter\Exceptions\PresenterNotFoundException;

class PostFieldDecorator implements DecoratorInterface
{
    /**
     * Can the subject be decorated?
     *
     * @param mixed $subject
     * @return bool
     */
    public function canDecorate($subject)
    {
        return $subject instanceof PostPresenter || $subject instanceof Post;
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
        if (is_object($subject)) {
            $subject = clone $subject;
        }

        if ($subject instanceof PostPresenter) {
            $subject = $subject->getWrappedObject();
        }

        $subject->fields->each(function ($field) use ($subject) {
            $subject->{$field->name} = $field->pivot->value;
        });

        if (! class_exists($presenterClass = $subject->getPresenterClass())) {
            throw new PresenterNotFoundException($presenterClass);
        }

        return app($presenterClass, ['resource' => $subject]);
    }
}