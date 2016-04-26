<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

class SeedDb extends Command
{
    protected $signature = 'flashtag:initial-seed';
    protected $description = 'Seed example data';

    public function handle()
    {
        if ($this->confirm("Add example post and category?", true)) {
            $this->call('db:seed', [
                '--class' => 'InstallSeeder',
            ]);
        }
    }
}