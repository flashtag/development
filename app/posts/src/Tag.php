<?php

namespace Flashtag\Posts;

use Illuminate\Support\Facades\Storage;

/**
 * Class Tag
 * @package Flashtag\Posts
 *
 * @property \Flashtag\Posts\Media $media
 */
class Tag extends Model
{
    use AttachesMedia;

    /**
     * Properties guarded from mass assignment.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function categories()
    {
        return $this->morphedByMany(Category::class, 'taggable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function posts()
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    public static function getBySlug($tag_slug)
    {
        return static::where('slug', $tag_slug)
            ->firstOrFail();
    }

    public function getShowingPosts()
    {
        return $this->posts->filter(function ($post) {
            return $post->isShowing();
        });
    }

    /**
     * Add a cover image to the post.
     *
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    public function addCoverImage($image)
    {
        $this->removeCoverImage();
        $name = 'tag-'.$this->id.'__cover__'.$this->slug.'.'.$this->imageExtension($image);
        $image->move(public_path('images/media'), $name);
        $this->cover_image = $name;

        $this->save();
    }

    /**
     * Remove an image from a post and delete it.
     */
    public function removeCoverImage()
    {
        if (! is_null($this->cover_image)) {
            $img = '/public/images/media/' . $this->cover_image;

            if (is_file(base_path($img))) {
                Storage::delete($img);
            }

            $this->cover_image = null;
            $this->save();
        }
    }
}
