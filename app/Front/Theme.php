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

    public function vendorPath()
    {
        return $this->config['path'];
    }

    public function publishes()
    {
        return [
            $this->vendorPath().'/resources/views' => base_path($this->views()),
            $this->vendorPath().'/public/assets' => public_path($this->assets()),
        ];
    }
}
