## Flashtag - Development repository

 [![Code Climate](https://codeclimate.com/github/flashtag/flashtag/badges/gpa.svg)](https://codeclimate.com/github/flashtag/flashtag)
 [![Test Coverage](https://codeclimate.com/github/flashtag/flashtag/badges/coverage.svg)](https://codeclimate.com/github/flashtag/flashtag/coverage)
 [![Build Status](https://travis-ci.org/flashtag/flashtag.svg?branch=master)](https://travis-ci.org/flashtag/flashtag)

### Progress 

Follow the progress or vote on features on [our trello board](https://trello.com/b/KWzDShYs/flashtag).

Look at our [existing issues](https://github.com/flashtag/flashtag/issues), and feel free to contribute!

#### Development Install:

 - `git clone git@github.com:flashtag/flashtag.git` then go to that directory
 
 - `composer install`
 
 - `cp .env.example .env`
 
 - `php artisan key:generate`
 
#### Development VM and database seeding:

 - `vendor/bin/homestead make`

 - set up your `Homestead.yaml` to look similar to the example.

 - `vagrant up && vagrant ssh`
 
 - `cd flashtag`

 - `php artisan migrate --seed`
 
#### Running tests:

 - `vendor/bin/phpunit`

#### Admin login:
 
 - Visit the admin page on the domain you set in `Homestead.yaml` (in my case that would be **http://app.test/admin**) and enter the seeded test user's credentials: `test@test.com`/`password`

