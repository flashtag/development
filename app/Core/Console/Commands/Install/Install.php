<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

class Install extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'flashtag:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install Flashtag';

    /**
     * Installation steps.
     *
     * @var array
     */
    private $steps = [
        PublishAssets::class,
        WriteDbConfig::class,
        RunMigrations::class,
        SeedDb::class,
        CreateAdminUser::class,
        InstallDefaultTheme::class,
    ];

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        foreach ($this->steps as $step) {
            (new $step($this))->execute();
        }
    }
}
