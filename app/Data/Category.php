<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Class Category
 * @package Flashtag\Data
 *
 * @property int $id
 * @property \Illuminate\Database\Eloquent\Collection $tags
 * @property \Flashtag\Data\Media $media
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
