<?php

namespace Flashtag\Data\Presenters\Decorators;

use Flashtag\Data\Post;
use Flashtag\Data\Presenters\PostPresenter;
use McCool\LaravelAutoPresenter\Decorators\DecoratorInterface;

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
     */
    public function decorate($subject)
    {
        if (is_object($subject)) {
            $subject = clone $subject;
        }

        $subject->fields->each(function ($field) use ($subject) {
            $subject->{$field->name} = $field->pivot->value;
        });

        return $subject;
    }
}