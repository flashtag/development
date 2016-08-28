<?php

namespace Flashtag\Data\Listeners;

use Flashtag\Data\Resizable;
use Flashtag\Data\Services\Resizer;
use Illuminate\Support\Facades\Storage;

class ResizableImageSubscriber
{
    /**
     * \Flashtag\Data\Services\Resizer
     */
    protected $resizer;

    /**
     * @param  \Flashtag\Data\Services\Resizer $resizer
     * @return void
     */
    public function __construct(Resizer $resizer)
    {
        $this->resizer = $resizer;
    }

    public function onCreate(Resizable $model)
    {
        $this->resizer->doIt($model);
    }

    public function onDelete(Resizable $model)
    {
        $defaults = config('site.images.storage');

        $storage = Storage::disk($defaults['disk']);

        $path = $defaults['path'];

        // get sizes and add original to it

        $sizes = array_keys($this->resizer->sizes());

        array_unshift($sizes, 'original');

        foreach ($sizes as $size) {
            $file = $model->{$size};

            if (! $file) { continue; }

            $img = $path .'/'. $file;

            if ($storage->has($img)) {
                $storage->delete($img);
            }
        }
    }

    public function subscribe($events)
    {
        $events->listen(
            'eloquent.deleted: '. Resizable::class,
            self::class .'@onDelete'
        );

        $events->listen(
            'eloquent.created: '. Resizable::class,
            self::class .'@onCreate'
        );
    }
}
