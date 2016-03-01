<?php

namespace Flashtag\Core\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class Update extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'flashtag:update
                            {--publish=none : All package resources published by default, "none" for none, or specify with a comma-separated list.}
                            {--force : Whether or not existing published resources should be overwritten.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Flashtag to the latest version';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->composerUpdate();

        if ($this->option('publish') !== 'none') {
            $this->publish();
        }
    }

    private function composerUpdate()
    {
        $process = new Process('composer update "flashtag/*"');
        $process->setTty(true);
        $process->run(function ($type, $buffer) {
            if ('err' === $type) {
                echo $buffer;
            } else {
                echo $buffer;
            }
        });
    }

    private function publish()
    {
        $this->call('flashtag:publish', [
            '--packages' => $this->option('publish'),
            '--force' => $this->option('force'),
        ]);
    }
}
