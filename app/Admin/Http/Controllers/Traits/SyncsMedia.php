<?php

namespace Flashtag\Admin\Http\Controllers\Traits;

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

        if ($type == 'video' && $url) {
            $model->updateMedia($type, $url);
        }
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param \Illuminate\Http\Request $request $request
     */
    protected function handleImageUploadsFromRequest(Model $model, $request)
    {
        if (! empty($request->file('image'))) {
            $model->addImage($request->file('image'));
        }

        if (! empty($request->file('cover_image'))) {
            $model->addCoverImage($request->file('cover_image'));
        }
    }
}
