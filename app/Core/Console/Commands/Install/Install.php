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
        'flashtag:initial-publish',
        'flashtag:initial-db-config',
        'flashtag:initial-migrations',
        'flashtag:initial-seed',
        'flashtag:initial-admin',
        'flashtag:install-default-theme',
    ];

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        foreach ($this->steps as $step) {
            $this->call($step);
        }
    }
}
