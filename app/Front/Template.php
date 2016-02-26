<?php

namespace Flashtag\Front;

use Illuminate\Support\Facades\Storage;

class Template
{
    public static function lists()
    {
        $templates = Storage::directories('resources/views/vendor/front');

        return array_map(function ($template) {
            return basename($template);
        }, $templates);
    }
}
