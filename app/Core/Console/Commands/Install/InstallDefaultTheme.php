<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

class InstallDefaultTheme extends Command
{
    protected $signature = 'flashtag:install-default-theme';
    protected $description = 'Install the default theme';

    public function handle()
    {
        if ($this->confirm("Install default theme now?", true)) {
            $this->call("flashtag:install-theme", [
                "theme" => "flashtag-themes/clean-creative"
            ]);
        }
    }
}