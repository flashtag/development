## Flashtag
 [![Build Status](https://travis-ci.org/flashtag/flashtag.svg?branch=master)](https://travis-ci.org/flashtag/flashtag)
 [![Code Climate](https://codeclimate.com/github/flashtag/flashtag/badges/gpa.svg)](https://codeclimate.com/github/flashtag/flashtag)
 [![Test Coverage](https://codeclimate.com/github/flashtag/flashtag/badges/coverage.svg)](https://codeclimate.com/github/flashtag/flashtag/coverage)

### Development

Follow the progress or vote on features on [our trello board](https://trello.com/b/KWzDShYs/flashtag).

#### Install:

 - `git clone git@github.com:flashtag/flashtag.git` then go to that directory
 
 - `composer install`
 
 - `cp .env.example .env`
 
 - `php artisan key:generate`
 
#### Set up VM and seed the database:

 - `vendor/bin/homestead make`

 - set up your `Homestead.yaml` to look similar to the example.

 - `vagrant up && vagrant ssh`
 
 - `cd flashtag`

 - `php artisan migrate --seed`

#### Admin login:
 
 - Visit the admin page on the domain you set in `Homestead.yaml` (in my case that would be **http://app.test/admin**) and enter the seeded test user's credentials: `test@test.com`/`password`
 
