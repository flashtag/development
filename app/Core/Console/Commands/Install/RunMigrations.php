<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

class RunMigrations extends Command
{
    protected $signature = 'flashtag:initial-migrations';
    protected $description = 'Run initial migrations';

    public function handle()
    {
        if ($this->confirm("Run database migrations now? (requires working db connection)", true)) {
            $this->call('migrate');
        }
    }
}