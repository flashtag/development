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
        $this->publishFlashtag();

        $DBisGood = false;
        while (! $DBisGood) {
            $db = $this->getDBCredentialsFromUser();
            if ($this->confirm('Would you like to attempt a test connection now?', true)) {
                $DBisGood = $this->testDBConnection($db);
            } else {
                $DBisGood = true;
            }
            if ($this->confirm('Save this database connection information?', true)) {
                $this->writeDBConfig($db);
            }
        }

        if ($this->confirm("Run database migrations now? (requires working db connection)", true)) {
            $this->runMigrations();
            $this->seedDB();
            $this->createAdminUser();
        }

        $this->installDefaultTheme();
    }

    /**
     * Get the database credentials from the user.
     * @return array
     */
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

    /**
     * Test the database connection.
     * @param array $db
     * @return bool
     */
    private function testDBConnection($db)
    {
        if ($db['DB_CONNECTION'] == 'sqlite') {
            $connection = sprintf(
                "%s:%s",
                $db['DB_CONNECTION'],
                $db['DB_DATABASE']
            );
        } else {
            $connection = sprintf(
                "%s:host=%s;dbname=%s",
                $db['DB_CONNECTION'],
                $db['DB_HOST'],
                $db['DB_DATABASE']
            );
        }

        try {
            $dbh = new \PDO(
                $connection,
                $db['DB_USERNAME'],
                $db['DB_PASSWORD'],
                [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
            );

            $this->info('Connection successful.');

            return true;

        } catch (\PDOException $e) {
            $this->error('Connection failed.');
            $this->error($e->getMessage());

            return ! $this->confirm('Would you like to re-enter the database credentials?', false);
        }
    }

    /**
     * Write the configuration to the .env file
     * @param array $db
     */
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

    /**
     * Run the migrations.
     */
    private function runMigrations()
    {
        $this->call('migrate');
    }

    /**
     * Run the Install seeder.
     */
    private function seedDB()
    {
        if ($this->confirm("Add example post and category?", true)) {
            $this->call('db:seed', [
                '--class' => 'InstallSeeder',
            ]);
        }
    }

    /**
     * Create the Admin user.
     */
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

        $this->comment("Created admin user {$admin->email}");
    }

    /**
     * Publish the needed flashtag files.
     */
    private function publishFlashtag()
    {
        $this->call("flashtag:publish", [
            "--packages" => "all"
        ]);
    }

    /**
     * Install the default flashtag theme.
     */
    private function installDefaultTheme()
    {
        $this->call("flashtag:install-theme", [
            "theme" => "flashtag-themes/clean-creative"
        ]);
    }
}
