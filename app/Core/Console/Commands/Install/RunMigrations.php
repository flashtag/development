<?php

namespace Flashtag\Core\Console\Commands\Install;

class RunMigrations extends InstallCommand
{
    public function execute()
    {
        if ($this->artisan->confirm("Run database migrations now? (requires working db connection)", true)) {
            $this->artisan->call('migrate');
        }
    }
}