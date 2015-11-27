<?php

namespace Flashtag\Data;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
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
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne
     */
    public function meta()
    {
        return $this->morphOne(MetaTag::class, 'meta_taggable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne
     */
    public function media()
    {
        return $this->morphOne(Media::class, 'media_attachable');
    }

    /**
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    public function addImage($image)
    {
        $name = $image->getClientOriginalName();
        $image->move(public_path('img/uploads/categories'), $name);

        $media = $this->media;
        $media = $media ?: new Media();
        $media->type = 'image';
        $media->url = $name;

        $this->media()->save($media);

        $this->save();
    }

    public function removeImage()
    {
        // TODO
    }

    /**
     * @param string $type
     * @param string $url
     */
    public function updateMedia($type = null, $url = null)
    {
        $media = $this->media ?: new Media();

        $media->type = $type;
        $media->url = $url;

        $this->media()->save($media);
    }

    /**
     * @return bool
     */
    public function hasMedia()
    {
        return !empty($this->media) && !empty($this->media->type);
    }
}
