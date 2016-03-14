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

    public static function viewLocations()
    {
        try {
            $theme = settings('theme');
        } catch (\PDOException $e) {
            $theme = 'clean-creative';
        }

        return [
            base_path('resources/views/theme-overrides/'.$theme),
            base_path('resources/views/themes/'.$theme),
            base_path('resources/views/themes/clean-creative'),
        ];
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
        return sprintf('resources/views/themes/%s', $this->name);
    }

    /**
     * Get the path to the asset files relative to public.
     * @return string
     */
    public function assets()
    {
        return sprintf('assets/themes/%s', $this->name);
    }

    /**
     * Get the full path to the view files to publish.
     * @return string
     */
    public function viewPath()
    {
        return $this->views;
    }

    /**
     * Get the full path to the asset files to publish.
     * @return string
     */
    public function assetPath()
    {
        return $this->assets;
    }
}
