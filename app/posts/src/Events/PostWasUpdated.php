<?php

namespace Flashtag\Posts\Events;

use Flashtag\Posts\Post;
use Flashtag\Auth\User;
use Illuminate\Queue\SerializesModels;

class PostWasUpdated extends Event
{
    use SerializesModels;

    /**
     * @var Post
     */
    public $post;

    /**
     * @var User
     */
    public $user;

    /**
     * Create a new event instance.
     *
     * @param Post $post
     * @param User $user
     */
    public function __construct(Post $post, $user = null)
    {
        $this->post = $post;
        $this->user = $user;
    }
}
