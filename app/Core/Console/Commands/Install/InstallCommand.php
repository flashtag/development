<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

abstract class InstallCommand
{
    protected $artisan;

    function __construct(Command $artisan)
    {
        $this->artisan = $artisan;
    }

    abstract public function execute();
}