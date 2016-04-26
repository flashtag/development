<?php

namespace Flashtag\Core\Console\Commands\Install;

use Flashtag\Data\User;
use Illuminate\Console\Command;

class CreateAdminUser extends Command
{
    protected $signature = 'flashtag:initial-admin-user';
    protected $description = 'Create Flashtag Admin user';

    public function handle()
    {
        if ($this->confirm("Create Admin user now? (requires working db connection)", true)) {
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
    }
}