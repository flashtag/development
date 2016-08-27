<?php

namespace Flashtag\Posts;

use Illuminate\Support\Facades\DB;

/**
 * Class PostList
 *
 * @property int $id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Collection $posts
 */
class PostList extends Model
{
    protected $guarded = ['id', 'updated_at', 'created_at'];

    /**
     * @param string $slug
     * @return mixed
     */
    public static function getBySlug($slug)
    {
        return static::with('posts')->where('slug', $slug)->first();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_post_list')->withPivot('order');
    }

    /**
     * @param Post|int $post
     * @return bool
     */
    public function hasPost($post)
    {
        $post_id = is_numeric($post) ? $post : $post->id;

        try {
            return ! empty($this->getPost($post_id));
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @param int $post_id
     * @return mixed
     * @throws \Exception
     */
    public function getPost($post_id)
    {
        $post = $this->posts->filter(function($post) use ($post_id) {
            return $post->id == $post_id;
        })->first();

        if (empty($post)) {
            throw new \Exception("Post is not in list.");
        }

        return $post;
    }

    /**
     * @param int $post_id
     * @param int $position
     */
    public function addPost($post_id, $position = 1)
    {
        // Add a new post to the end of the list.
        $this->posts()->sync([
            $post_id => ['order' => $this->posts->count() + 1],
        ], false);

        $this->load('posts');

        // Reorder the post to the position.
        $this->reorder($post_id, $position);
    }

    /**
     * Remove a post from the list.
     *
     * @param int $post_id
     */
    public function removePost($post_id)
    {
        $post = $this->getPost($post_id);
        $this->reorder($post->id, $this->posts()->count() + 1);

        $this->posts()->detach($post->id);
    }

    /**
     * Reorder a post within this list.
     *
     * @param int $post_id
     * @param int $newPosition
     */
    public function reorder($post_id, $newPosition)
    {
        $post = $this->getPost($post_id);
        $oldPosition = $post->pivot->order;

        if ($newPosition === $oldPosition) {
            return;
        }

        static::incrementOrderBetween($this->id, $oldPosition, $newPosition);

        $this->posts()->sync([
            $post_id => ['order' => $newPosition],
        ], false);
    }

    /**
     * Increment all the posts in a list between an old and new order.
     *
     * @param int $id
     * @param int $old
     * @param int $new
     */
    public static function incrementOrderBetween($id, $old, $new)
    {
        if ($new < $old) {
            $increment = +1;
            $whereBetween = [$new, $old];
        } else {
            $increment = -1;
            $whereBetween = [$old, $new];
        }

        $query = DB::table('post_post_list')->where('post_list_id', $id)
            ->whereBetween('order', $whereBetween);

        $increment > 0 ? $query->increment('order') : $query->decrement('order');
    }
}
