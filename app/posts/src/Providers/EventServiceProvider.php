<?php

namespace Flashtag\Posts\Providers;

use Flashtag\Posts\Events;
use Flashtag\Posts\Listeners;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        //
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
