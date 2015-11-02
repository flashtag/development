<?php

namespace Flashtag\Data\Listeners;

use Flashtag\Data\Post;

class PostEventListener
{
    /**
     * Handle the post creation events.
     *
     * @param $event
     */
    public function onPostCreated($event)
    {
        $this->insertPostAsFirstInCategory($event->post);
    }

    /**
     * Insert a post as ordered first in it's category.
     *
     * @param Post $post
     */
    private function insertPostAsFirstInCategory(Post $post)
    {
        \DB::table('posts')
            ->where('category_id', $post->category_id)
            ->increment('order');

        $post->order = 1;
        $post->save();
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
            'Flashtag\Data\Events\PostWasCreated',
            'Flashtag\Data\Listeners\PostEventListener@onPostCreated'
        );
    }
}
