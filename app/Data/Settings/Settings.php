<?php

namespace Flashtag\Data\Settings;

use Flashtag\Data\Setting;
use Flashtag\Data\Events\SettingsSaved;
use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Contracts\Events\Dispatcher as Event;
use Illuminate\Contracts\Config\Repository as Config;

class Settings
{
    /**
     * Cache repository
     * @var Illuminate\Contracts\Cache\Repository
     */
    protected $cache;

    /**
     * Config Repository
     * @var Illuminate\Contracts\Config\Repository
     */
    protected $config;

    /**
     * Event Dispatcher
     * @var Illuminate\Contracts\Events\Dispatcher
     */
    protected $event;

    /**
     * Setting model
     * @var Flashtag\Data\Setting
     */
    protected $setting;

    /**
     * The instance cache of settings
     * @var array
     */
    protected $settings = [];

    /**
     * Have we loaded the cached settings
     * @var boolean
     */
    protected $grabbedCache = false;

    /**
     * The dirty settings count
     * @var integer
     */
    protected $dirtyCount = 0;

    /**
     * The names of the dirty settings
     * @var array
     */
    protected $dirty = [];

    /**
     * Da construcdor
     *
     * @param Illuminate\Contracts\Cache\Repository   $cache
     * @param Illuminate\Contracts\Config\Repository  $config
     * @param Illuminate\Contracts\Events\Dispatcher $event
     * @param Flashtag\Data\Setting $setting
     */
    public function __construct(Cache $cache, Config $config, Event $event, Setting $setting)
    {
        $this->cache = $cache;
        $this->config = $config;
        $this->event = $event;
        $this->setting = $setting;
    }

    /**
     * Get all settings from local cache or cache repository/query.
     *
     * @return array
     */
    public function all($forceCached = false)
    {
        // If we have not yet grabbed the settings from the cache we will
        // do that now and merge it into any previously set settings
        if (! $this->grabbedCache || $forceCached) {
            $this->getCached();
        }

        return $this->settings;
    }

    /**
     * Get a setting by name with fallback default value.
     *
     * @param  string $key
     * @param  mixed $default
     * @return mixed
     */
    public function get($key, $default = null)
    {
        // Pull from the instance cached settings first.
        if (isset($this->settings[$key])) {
            return $this->settings[$key];
        }

        // if we have not yet grabbed le cache
        if (! $this->grabbedCache) {
            // Grab the settings from the cache, or query;
            $this->getCached();

            // If a setting exists in these cached/query settings return it.
            if (isset($this->settings[$key])) {
                return $this->settings[$key];
            }
        }

        // Fallback to using the config system and use its default for our fallback value.
        return $this->config->get('settings.'. $key, $default);
    }

    /**
     * Set a setting by name to a value.
     *
     * @param string|array $key
     * @param string $value
     * @param void
     */
    public function set($key, $value = '')
    {
        if (is_array($key)) {
            foreach ($key as $k => $v) {
                $this->set($k, $v);
            }
        } else {
            $this->cacheSetting(['name' => $key, 'value' => $value]);
        }
    }

    /**
     * Remove a setting by name
     *
     * @param  string $key
     * @return void
     */
    public function forget($key)
    {
        if (is_array($key)) {
            foreach ($key as $k) {
                $this->forget($k);
            }
        } else {
            $this->forgetSetting($key);
        }
    }

    /**
     * Pull the settings from the cache repository or query for it.
     *
     * @return array
     */
    protected function getCached()
    {
        $this->grabbedCache = true;

        $cached = $this->cache->rememberForever('settings', function () {
            return $this->setting->oldest('name')->lists('value', 'name')->all();
        });

        return $this->settings = array_merge($this->settings, $cached);
    }

    /**
     * Locally caches a setting for later use.
     *
     * @param  array  $setting
     * @return void
     */
    protected function cacheSetting(array $setting)
    {
        $this->settings[$setting['name']] = $setting['value'];
        $this->dirty($setting['name']);
    }

    /**
     * Forget a local cached setting by name
     *
     * @param  string $key
     * @return void
     */
    protected function forgetSetting($key)
    {
        if (isset($this->settings[$key])) {
            unset($this->settings[$key]);
        }

        $this->dirty($key);
    }

    /**
     * Roll a setting around in the dirt.
     *
     * @param  string $key
     * @return void
     */
    protected function dirty($key)
    {
        if (! in_array($key, $this->dirty)) {
            $this->dirty[] = $key;
        }

        $this->dirtyCount++;
    }

    /**
     * Do we have some dirty dirty settings
     *
     * @return boolean da dirt
     */
    public function isDirty()
    {
        return (bool) $this->dirtyCount;
    }

    /**
     * Get the name of dirty settings
     *
     * @return array
     */
    public function getDirty()
    {
        return $this->dirty;
    }

    /**
     * Persist our dirty dirty settings
     *
     * @return void
     */
    public function wash()
    {
        foreach ($this->getDirty() as $name) {
            if (isset($this->settings[$name])) {
                $this->setting->updateOrCreate(
                    ['name' => $name],
                    ['value' => $this->settings[$name]]
                );
            } else {
                $this->setting->destroyByName($name);
            }
        }

        if ($this->dirtyCount) {
            $this->event->fire(new SettingsSaved);
            $this->dirty = [];
        }

        $this->dirtyCount = 0;
    }

    /**
     * :}
     *
     * @param  mixed $key
     * @param  mixed $default
     * @return mixed
     */
    public function __invoke($key = null, $default = null)
    {
        if (is_null($key)) {
            return $this->settings;
        }

        if (is_array($key)) {
            return $this->set($key);
        }

        return $this->get($key, $default);
    }
}
