<?php

namespace Flashtag\Front\Console\Commands;

use Flashtag\Front\Theme;
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
        $theme = $this->getTheme();

        $this->install($theme);
        $this->publish($theme);
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

    private function publish($theme)
    {
        // TODO: just publish the files...
        $this->info("TODO: publish the assets...");

        $config = require base_path('vendor/'.$theme.'/theme.php');
        $theme = new Theme($config);

        dd($theme->publishes());
    }
}
