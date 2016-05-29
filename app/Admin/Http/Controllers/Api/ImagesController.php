<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\Media;
use Flashtag\Data\Post;
use Illuminate\Support\Facades\Storage;

class ImagesController extends Controller
{
    /**
     * TODO: We really need ot look at rethinking the way we do the image/media stuff
     *
     * @param string $image
     */
    public function destroy($image)
    {
        if (str_contains($image, '__cover__')) {
            $type = explode('-', $image)[0];
            $typeClass = '\\Flashtag\\Data\\'.ucfirst($type);
            $model = $typeClass::where('cover_image', $image)->first();
            $model->update(['cover_image' => null]);
        } elseif (substr($image, 0, 5) === "post-") {
            $post = Post::where('image', $image)->first();
            $post->update(['image' => null]);
        } else {
            $media = Media::where('url', $image)->first();
            $media->delete();
        }

        Storage::delete('/public/images/media/'.$image);
    }
}