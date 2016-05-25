<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class ImagesController extends Controller
{
    public function destroy($image)
    {
        Storage::delete('/public/images/media/'.$image);
    }
}