<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

class PublishAssets extends Command
{
    protected $signature = 'flashtag:initial-publish';
    protected $description = 'Publish the assets';

    public function handle()
    {
        $this->call("flashtag:publish", [
            "--packages" => "all"
        ]);
    }
}