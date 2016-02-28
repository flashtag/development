<?php

namespace Flashtag\Data\Settings;

use Closure;

class SettingsMiddleware
{
    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
    }

    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    public function terminate($request, $response)
    {
        if ($this->settings->isDirty()) {
            $this->settings->wash();
        }
    }
}
