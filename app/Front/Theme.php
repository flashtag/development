<?php

namespace Flashtag\Front;

use Illuminate\Support\Facades\Storage;

class Theme
{
    /**
     * @var array
     */
    protected $config;

    /**
     * Theme constructor.
     * @param array $config
     */
    public function __construct($config)
    {
        $this->config = $config;
    }

    public static function lists()
    {
        $themes = Storage::directories('resources/views/vendor/themes');

        return array_map(function ($theme) {
            return basename($theme);
        }, $themes);
    }

    public function publishes()
    {
        return [
            $this->viewPath() => base_path($this->views()),
            $this->assetPath() => public_path($this->assets()),
        ];
    }

    public function views()
    {
        return sprintf(
            'resources/views/vendor/themes/%s/%s',
            $this->config['name'],
            $this->config['version']
        );
    }

    public function assets()
    {
        return sprintf('assets/themes/%s', $this->config['name']);
    }

    public function viewPath()
    {
        return $this->config['views'];
    }

    public function assetPath()
    {
        return $this->config['assets'];
    }
}
