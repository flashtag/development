<?php

namespace Flashtag\Core\Console\Commands\Install;

class WriteConnectionDetails extends InstallCommand
{
    public function execute()
    {
        $DBisGood = false;

        while (! $DBisGood) {
            $db = $this->getDBCredentialsFromUser();
            if ($this->artisan->confirm('Would you like to attempt a test connection now?', true)) {
                $DBisGood = $this->testDBConnection($db);
            } else {
                $DBisGood = true;
            }
            if ($this->artisan->confirm('Save this database connection information?', true)) {
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
            'DB_CONNECTION' => $this->artisan->choice('Select your database driver:', [
                'mysql',
                'pgsql',
                'sqlite',
                'sqlsrv'
            ], 0),
            'DB_HOST' => $this->artisan->ask('Database host?', 'localhost'),
            'DB_DATABASE' => $this->artisan->ask('Database name?', 'homestead'),
            'DB_USERNAME' => $this->artisan->ask('Database username?', 'homestead'),
            'DB_PASSWORD' => $this->artisan->ask('Database password?', 'secret'),
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

            $this->artisan->info('Connection successful.');

            return true;

        } catch (\PDOException $e) {
            $this->artisan->error('Connection failed.');
            $this->artisan->error($e->getMessage());

            return ! $this->artisan->confirm('Would you like to re-enter the database credentials?', true);
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
            $this->artisan->error('Error writing environment file.');
        } else {
            $this->artisan->comment('Wrote environment file.');
        }
    }
}