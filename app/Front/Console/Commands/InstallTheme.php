<?php

namespace Flashtag\Front\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class InstallTheme extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'flashtag:install-theme
                            {theme : The theme name on packagist}
                            {--tag= : Specify a version}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install a theme package from packagist.';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->install($this->getTheme());
        $this->addServiceProvider();
    }

    private function getTheme()
    {
        if ($this->option('tag')) {
            return $this->argument('theme').':'.$this->option('tag');
        }

        return $this->argument('theme');
    }

    private function install($theme)
    {
        $process = new Process(sprintf('composer require "%s"', $theme));
        $process->setTty(true);
        $process->run(function ($type, $buffer) {
            if ('err' === $type) {
                echo $buffer;
            } else {
                echo $buffer;
            }
        });
    }

    private function addServiceProvider()
    {
        // TODO: Add the service provider to some persisted collection
        $this->info("TODO: Persist service provider...");
    }
}
