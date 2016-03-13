<?php

namespace Flashtag\Front\Console\Commands;

use Flashtag\Front\Theme;
use Illuminate\Console\Command;
use Symfony\Component\Filesystem\Filesystem;
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
     * @var \Symfony\Component\Filesystem\Filesystem
     */
    private $filesystem;

    /**
     * Create command instance.
     *
     * @param \Symfony\Component\Filesystem\Filesystem $filesystem
     */
    public function __construct(Filesystem $filesystem)
    {
        parent::__construct();
        $this->filesystem = $filesystem;
    }

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

        $this->info("Done!");
    }

    /**
     * @return array|string
     */
    private function getTheme()
    {
        if ($this->option('tag')) {
            return $this->argument('theme').':'.$this->option('tag');
        }

        return $this->argument('theme');
    }

    /**
     * @param string $theme
     */
    private function install($theme)
    {
        $this->info(sprintf("Installing theme %s", $theme));

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

    /**
     * @param string $theme
     */
    private function publish($theme)
    {
        $this->info("Publishing Assets...");

        $config = require base_path('vendor/'.$theme.'/theme.php');
        $theme = new Theme($config);

        foreach ($theme->publishes() as $from => $to) {
            $this->filesystem->mirror($from, $to);
        }
    }
}
