<?php

namespace Flashtag\Front;

use Illuminate\Support\Facades\Storage;

class Theme
{
    private $name;
    private $version;
    private $views;
    private $assets;

    /**
     * Theme constructor.
     * @param array $config
     */
    public function __construct($config)
    {
        $this->name = $config['name'];
        $this->version = $config['version'];
        $this->views = $config['views'];
        $this->assets = $config['assets'];
    }

    /**
     * Get a list of the theme directories.
     * @return array
     */
    public static function lists()
    {
        $themes = Storage::directories('resources/views/themes');

        return array_map(function ($theme) {
            return basename($theme);
        }, $themes);
    }

    /**
     * Get an array of assets to publish.
     * @return array
     */
    public function publishes()
    {
        return [
            $this->viewPath() => base_path($this->views()),
            $this->assetPath() => public_path($this->assets()),
        ];
    }

    /**
     * Get the path to the views for this theme relative to the base_dir.
     * @return string
     */
    public function views()
    {
        return sprintf(
            'resources/views/themes/%s/%s',
            $this->config['name'],
            $this->config['version']
        );
    }

    /**
     * Get the path to the asset files relative to public.
     * @return string
     */
    public function assets()
    {
        return sprintf('assets/themes/%s', $this->config['name']);
    }

    /**
     * Get the full path to the view files to publish.
     * @return string
     */
    public function viewPath()
    {
        return $this->config['views'];
    }

    /**
     * Get the full path to the asset files to publish.
     * @return string
     */
    public function assetPath()
    {
        return $this->config['assets'];
    }
}
