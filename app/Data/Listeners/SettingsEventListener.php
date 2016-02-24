<?php

namespace Flashtag\Data\Listeners;

use Flashtag\Data\Setting;
use Flashtag\Data\Events\SettingsSaved;
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
