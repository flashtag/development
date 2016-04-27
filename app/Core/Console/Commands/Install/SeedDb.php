<?php

namespace Flashtag\Core\Console\Commands\Install;

class SeedDb extends InstallCommand
{
    public function execute()
    {
        if ($this->artisan->confirm("Add example post and category?", true)) {
            $this->artisan->call('db:seed', [
                '--class' => 'InstallSeeder',
            ]);
        }
    }
}