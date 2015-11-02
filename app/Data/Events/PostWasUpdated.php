<?php

namespace Flashtag\Data\Events;

use Flashtag\Data\Post;
use Flashtag\Data\User;
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
