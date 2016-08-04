<?php

namespace Flashtag\Core\Console\Commands\Install;

class SeedExamples extends InstallCommand
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