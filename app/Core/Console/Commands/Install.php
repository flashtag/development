<?php

namespace Flashtag\Core\Console\Commands;

use Flashtag\Data\User;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class Install extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'flashtag:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install Flashtag';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $continue = true;
        while ($continue) {
            $db = $this->getDBCredentialsFromUser();
            $this->testDBCOnnection($db);

            if ($this->confirm('Save this database connection information?')) {
                $this->writeDBConfig($db);
                $continue = false;
            } else {
                $continue = $this->confirm('Would you like to re-enter the database credentials?', false);
            }
        }

        if ($this->confirm("Create administration user now? (requires working db connection)", true)) {
            $this->createAdminUser();
        }
    }

    private function getDBCredentialsFromUser()
    {
        return [
            'DB_CONNECTION' => $this->choice('Select your database driver:', [
                'mysql',
                'pgsql',
                'sqlite',
                'sqlsrv'
            ], 0),
            'DB_HOST' => $this->ask('Database host?', 'localhost'),
            'DB_DATABASE' => $this->ask('Database name?', 'homestead'),
            'DB_USERNAME' => $this->ask('Database username?', 'homestead'),
            'DB_PASSWORD' => $this->ask('Database password?', 'secret'),
        ];
    }

    private function testDBCOnnection($db)
    {
        if ($this->confirm('Would you like to attempt a test connection now?', true)) {
            foreach ($db as $key => $value) {
                putenv($key.'='.$value);
            }
            try {
                \DB::connection($db['DB_CONNECTION'])->getPdo();
                $this->info('Connection successful.');
            } catch (\PDOException $e) {
                $this->error('Connection failed.');
            }
        }
    }

    private function writeDBConfig($db)
    {
        $env = file_get_contents(base_path('.env'));
        if ($env === false) {
            $env = file_get_contents(base_path('.env.example'));
        }

        foreach ($db as $key => $value) {
            $pattern = '/^('.$key.'=)(.*)$/m';
            $replacement = '$1'.$value;
            $env = preg_replace($pattern, $replacement, $env);
        }

        if (file_put_contents('.env', $env) === false) {
            $this->error('Error writing environment file.');
        } else {
            $this->comment('Wrote environment file.');
        }
    }

    private function createAdminUser()
    {
        $this->info("Create an Admin user");
        $user['name'] = $this->ask("Administrator's name");
        $user['email'] = $this->ask("Administrator email address");

        $matches = false;
        while (! $matches) {
            $user['password'] = $this->secret("Administrator password");
            $user['password_confirmation'] = $this->secret("Confirm password");
            $matches = $user['password'] === $user['password_confirmation'];
        }
        $user['password'] = bcrypt($user['password']);
        unset($user['password_confirmation']);

        // Persist the user
        $admin = User::create($user);
        $admin->admin = true;
        $admin->save();

        dump($admin);
    }
}
