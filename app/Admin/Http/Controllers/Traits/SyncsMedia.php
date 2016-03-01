<?php

namespace Flashtag\Admin\Http\Controllers\Traits;

use Flashtag\Data\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

trait SyncsMedia
{
    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param \Illuminate\Http\Request $request
     */
    protected function syncMediaFromRequest(Model $model, Request $request)
    {
        $type = $request->get('media-type');
        $url = $request->get('media-link');

        if ($type == 'image') {
            $this->handleImageUpload($model, $request->file('image'));
        } elseif ($type && $url) {
            $model->updateMedia($type, $url);
        }
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    private function handleImageUpload(Model $model, $image)
    {
        if (! empty($image)) {
            $model->addImage($image);
        }
    }
}
