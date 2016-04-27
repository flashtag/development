<?php

namespace Flashtag\Core\Providers;

use Flashtag\Core\Console\Commands\Install;
use Illuminate\Support\ServiceProvider;

class InstallServiceProvider extends ServiceProvider
{
    /**
     * Register the service provider.
     */
    public function register()
    {
        $this->commands([
            Install\Install::class,
            Install\PublishAssets::class,
            Install\WriteDbConfig::class,
            Install\RunMigrations::class,
            Install\SeedDb::class,
            Install\CreateAdminUser::class,
            Install\InstallDefaultTheme::class,
        ]);
    }
}
