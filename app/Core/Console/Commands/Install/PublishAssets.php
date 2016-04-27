<?php

namespace Flashtag\Core\Console\Commands\Install;

class PublishAssets extends InstallCommand
{
    public function execute()
    {
        $this->artisan->call("flashtag:publish", [
            "--packages" => "all"
        ]);
    }
}