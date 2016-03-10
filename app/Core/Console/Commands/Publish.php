<?php

namespace Flashtag\Core\Console\Commands;

use Illuminate\Console\Command;

class Publish extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'flashtag:publish
                            {--packages=all : Publish only specific packages in a comma-separated list.}
                            {--force : Whether or not existing files should be overwritten.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish Flashtag resources';

    /**
     * Flashtag service provider classes.
     *
     * @var array
     */
    private $providers = [
        'admin' => 'Flashtag\Admin\Providers\AdminServiceProvider',
        'api' => 'Flashtag\Api\Providers\ApiServiceProvider',
        'data' => 'Flashtag\Data\Providers\DataServiceProvider',
        'front' => 'Flashtag\Front\Providers\FrontServiceProvider',
    ];

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        foreach ($this->packagesToPublish() as $package) {
            if (isset($this->providers[$package])) {
                $this->publishFromProvider($this->providers[$package]);
            } else {
                $this->comment("Package flashtag/{$package} was not found in the list of providers. Ignoring.");
            }
        }
    }

    /**
     * Figure out and return which packages should be published.
     *
     * @return array
     */
    private function packagesToPublish()
    {
        if ($this->option('packages') !== 'all') {
            return explode(',', $this->option('packages'));
        }

        return array_keys($this->providers);
    }

    /**
     * @param string $providerClass
     */
    private function publishFromProvider($providerClass)
    {
        if (class_exists($providerClass)) {
            $this->call('vendor:publish', [
                '--provider' => $providerClass,
                '--force' => $this->option('force'),
            ]);
        } else {
            $this->comment("Provider {$providerClass} does not exist. Ignoring.");
        }
    }
}
