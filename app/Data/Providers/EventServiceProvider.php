<?php

namespace Flashtag\Data\Providers;

use Flashtag\Data\Events;
use Flashtag\Data\Listeners;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Events\SettingsSaved::class => [
            Listeners\SettingsEventListener::class,
        ],
    ];

    /**
     * The subscriber classes to register.
     *
     * @var array
     */
    protected $subscribe = [
        Listeners\PostEventListener::class,
        Listeners\ResizableImageSubscriber::class,
    ];
}
