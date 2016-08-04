<?php

namespace Flashtag\Core\Providers;

use Flashtag\Core\Events;
use Flashtag\Core\Listeners;
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
        //
    ];
}
