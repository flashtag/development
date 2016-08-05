<?php

namespace Flashtag\Core\Settings;

use Closure;

class SettingsMiddleware
{
    public function __construct(Settings $settings)
    {
        $this->settings = $settings;
    }

    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if ($this->settings->isDirty()) {
            $this->settings->wash();
        }

        return $response;
    }
}
