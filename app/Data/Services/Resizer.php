<?php

namespace Flashtag\Data\Services;

use Image;
use Flashtag\Data\Resizable;
use Illuminate\Config\Repository as Config;
use Illuminate\Contracts\Filesystem\Factory as Storage;

class Resizer
{
    protected $path;

    protected $disk;

    // closure
    protected $formatter;

    public static $sizes = [
        'lg' => 600,
        'md' => 400,
        'sm' => 200,
        'xs' => 80,
    ];

    /**
     *
     * @param  string|null $disk
     * @param  string|null $path
     * @return void
     */
    public function __construct(Config $config, Storage $storage)
    {
        $this->disk = $storage->disk(
            $config->get('site.images.storage.disk', 'local')
        );

        $this->path = $config->get('site.images.storage.path', 'public/images/media');

        $this->formatter = $config->get('site.images.format');

        if ($config->has('site.images.sizes')) {
            static::$sizes = $config->get('site.images.sizes');
        }
    }

    /**
     * Get or set the sizes
     *
     * @param  array|null $sizes
     * @return array
     */
    public static function sizes($sizes = null)
    {
        return $sizes ? static::$sizes = $sizes : static::$sizes;
    }

    /**
     * Do the resizing for the Resizable images sizes
     *
     * @param  \Flashtag\Data\Resizable $entity
     * @return void
     */
    public function doIt(Resizable $entity)
    {
        $file = $entity->original;

        $image = Image::make($this->disk->get($this->path .'/'. $file));

        $filename = $file;

        foreach ($this->formatSizes() as $size => $dems) {
            if ($this->resize($image, $dems)) {
                // get a new filename and save the resized image
                $filename = $this->formatFileName($file, $size);
                $this->save($image, $filename);
            }

            $entity->{$size} = $filename;
        }

        $entity->save();
    }

    /**
     * Resize our image to defined dimensions
     *
     * @param  \Intervention\Image\Image $img
     * @param  array $dems  the dimensions
     * @return bool
     */
    protected function resize($img, $dems)
    {
        // check if there is a need to resize based on dimensions passed
        if ($img->height() < $dems['height'] && $img->width() < $dems['width']) {
            return false;
        }

        // resize to dimensions
        $img->resize($dems['width'], $dems['height'], function ($con) {

            //  respect aspectRatio and never upsize
            $con->aspectRatio();
            $con->upsize();
        });

        return true;
    }

    /**
     * Save the Image to disk
     *
     * @param  \Intervention\Image\Image $img
     * @param  string $name
     * @param  string|null $path
     * @return void
     */
    protected function save($img, $name, $path = null)
    {
        $path = $path ?: $this->path;

        $this->disk->put($path .'/'. $name, $img->stream());
    }

    /**
     * Format the sizes to a standard format
     *
     * @return void
     */
    protected function formatSizes()
    {
        /*
        allow for multiple formats
            'lg' => 800
        or
            'lg' => [800, 600]
        or
            'lg' => ['width' => ..., 'height' => ...]
         */
        foreach (static::sizes() as $key => $size) {
            if (! is_array($size)) {
                $f[$key] = ['width' => $size, 'height' => $size];
            } elseif (! isset($size['width'])) {
                $f[$key] = ['width' => $size[0], 'height' => $size[1]];
            } else {
                $f[$key] = $size;
            }
        }

        return $f;
    }

    /**
     * Format the Filename for the entity and size
     *
     * @param  string $original Original filename
     * @param  string $size
     * @return string
     */
    protected function formatFileName($original, $size)
    {
        $extension = pathinfo($original, PATHINFO_EXTENSION);
        $filename = pathinfo($original, PATHINFO_FILENAME);

        if ($this->formatter) {
            return call_user_func_array($this->formatter, [$filename, $extension, $size]);
        }

        return "{$filename}__{$size}.{$extension}";
    }
}
