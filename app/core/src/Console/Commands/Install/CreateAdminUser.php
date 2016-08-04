<?php

namespace Flashtag\Core\Console\Commands\Install;

use Flashtag\Data\User;

class CreateAdminUser extends InstallCommand
{
    public function execute()
    {
        if ($this->artisan->confirm("Create Admin user now? (requires working db connection)", true)) {
            $this->artisan->info("Create an Admin user");
            $user['name'] = $this->artisan->ask("Administrator's name");
            $user['email'] = $this->artisan->ask("Administrator email address");

            $matches = false;
            while (! $matches) {
                $user['password'] = $this->artisan->secret("Administrator password");
                $user['password_confirmation'] = $this->artisan->secret("Confirm password");
                $matches = $user['password'] === $user['password_confirmation'];
            }
            $user['password'] = bcrypt($user['password']);
            unset($user['password_confirmation']);

            // Persist the user
            $admin = User::create($user);
            $admin->admin = true;
            $admin->save();

            $this->artisan->comment("Created admin user {$admin->email}");
        }
    }
}