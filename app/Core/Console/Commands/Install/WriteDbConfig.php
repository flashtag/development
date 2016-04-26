<?php

namespace Flashtag\Core\Console\Commands\Install;

use Illuminate\Console\Command;

class WriteDbConfig extends Command
{
    protected $signature = 'flashtag:initial-db-config';
    protected $description = 'Configure database connection';

    public function handle()
    {
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

            return ! $this->confirm('Would you like to re-enter the database credentials?', true);
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
}