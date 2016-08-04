<?php

namespace Flashtag\Posts\Listeners;

class PostEventListener
{
    /**
     * Handle the post creation events.
     *
     * @param $event
     */
    public function onPostCreated($event)
    {
        //
    }

    /**
     * Register the listeners.
     *
     * @param \Illuminate\Events\Dispatcher $events
     * @return array
     */
    public function subscribe($events)
    {
        $events->listen(
            'Flashtag\Posts\Events\PostWasCreated',
            self::class .'@onPostCreated'
        );
    }
}
