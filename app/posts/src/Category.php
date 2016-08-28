<?php

namespace Flashtag\Posts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Class Category
 * @package Flashtag\Posts
 *
 * @property int $id
 * @property \Illuminate\Database\Eloquent\Collection $tags
 * @property \Flashtag\Posts\Media $media
 */
class Category extends Model
{
    use AttachesMedia;

    /**
     * Fields protected from mass-assignment.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function fields()
    {
        return $this->morphToMany(Field::class, 'fieldable')
            ->withPivot('value');
    }

    /**
     * @param string $category_slug
     * @return Category
     */
    public static function getBySlug($category_slug)
    {
        return static::where('slug', $category_slug)->firstOrFail();
    }

    /**
     * Add a cover image to the category.
     *
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    public function addCoverImage($image)
    {
        $this->removeCoverImage();

        $name = 'category-'.$this->id.'__cover__'.$this->slug.'.'.$this->imageExtension($image);

        $defaults = config('site.images.storage');

        Storage::disk($defaults['disk'])->put(
            $defaults['path'] .'/'. $name,
            file_get_contents($image->getRealPath())
        );

        $this->cover_image = $name;

        $this->save();
    }

    /**
     * Remove an image from a post and delete it.
     */
    public function removeCoverImage()
    {
        if (! is_null($this->cover_image)) {

            $defaults = config('site.images.storage');

            $storage = Storage::disk($defaults['disk']);

            $img = $defaults['path'] .'/'. $this->cover_image;

            if ($storage->has($img)) {
                $storage->delete($img);
            }

            $this->cover_image = null;
            $this->save();
        }
    }
}
