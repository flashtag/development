## Flashtag - Development repository

 [![Code Climate](https://codeclimate.com/github/flashtag/flashtag/badges/gpa.svg)](https://codeclimate.com/github/flashtag/flashtag)
 [![Build Status](https://travis-ci.org/flashtag/flashtag.svg?branch=master)](https://travis-ci.org/flashtag/flashtag)

**Do NOT use this repo in production**, this is for development purposes where we can work on and test all of the flashtag repositories in one place.

### About

Flashtag is a simple CMS that you can include in any existing Laravel app. You can pick and choose what components you want.

- **flashtag/data** contains all of the persisted stuff. You'll need this one or nothing else will work.
- **flashtag/admin** contains the administration dashboard where you can manage all the persisted stuff in flashtag/data
- **flashtag/api** contains a RESTful api for managing all the persisted stuff in flashtag/data. it uses laravel session auth or JWT
- **flashtag/front** contains the routes and views (templates) for the public-facing side of your CMS (i.e. displays all your persisted stuff from flashtag/data)

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
 
 - Visit the admin page on the domain you set in `Homestead.yaml` (in my case that would be **http://app.test/admin**) and enter the seeded test users' credentials:
    - `test@test.com`/`password` : normal user
    - `admin@test.com`/`password` : admin user

