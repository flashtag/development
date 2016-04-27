<?php

namespace Flashtag\Core\Console\Commands\Install;

class InstallDefaultTheme extends InstallCommand
{
    public function execute()
    {
        if ($this->artisan->confirm("Install default theme now?", true)) {
            $this->artisan->call("flashtag:install-theme", [
                "theme" => "flashtag-themes/clean-creative"
            ]);
        }
    }
}