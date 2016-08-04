<?php

namespace Flashtag\Settings\Listeners;

use Flashtag\Settings\Setting;
use Flashtag\Settings\Events\SettingsSaved;
use Illuminate\Contracts\Cache\Repository as Cache;

class SettingsEventListener
{
    protected $cache;

    public function __construct(Cache $cache)
    {
        $this->cache = $cache;
    }

    /**
     * Handle the post creation events.
     *
     * @param $event
     */
    public function handle(SettingsSaved $event)
    {
        $this->cache->forget('settings');
    }
}
