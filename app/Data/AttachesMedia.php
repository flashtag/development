<?php

namespace Flashtag\Data;

use Illuminate\Support\Facades\Storage;

trait AttachesMedia
{
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
        $this->removeImage();

        $className = class_basename($this);
        $name = strtolower($className).'-'.$this->id.'__'.$this->slug.'.'.$this->imageExtension($image);
        $image->move(public_path('images/media'), $name);

        // TODO: generate thumbnails

        $this->updateMedia('image', $name);
    }

    /**
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     * @return string|null
     */
    private function imageExtension($image)
    {
        $parts = explode('.', $image->getClientOriginalName());

        return array_pop($parts);
    }

    /**
     * Remove an image and delete it.
     */
    public function removeImage()
    {
        if ($this->media && $this->media->type == 'image' && $this->media->url) {
            $img = '/public/images/media/' . $this->media->url;

            if (is_file(base_path($img))) {
                Storage::delete($img);
            }
        }

        $this->updateMedia(null, null);
    }

    /**
     * @param string $type
     * @param string $url
     */
    public function updateMedia($type, $url)
    {
        $media = Media::firstOrNew([
            'media_attachable_id' => $this->id,
            'media_attachable_type' => static::class,
        ]);
        $media->type = $type;
        $media->url = $url;

        $this->media()->save($media);
    }

    /**
     * @return bool
     */
    public function hasMedia()
    {
        $this->media;

        return !empty($this->media) && !empty($this->media->type);
    }
}
