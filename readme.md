![Flashtag](https://s3-us-west-2.amazonaws.com/flashtag/images/flashtag-logo-banner.png)

## Flashtag - Development repository

 [![Code Climate](https://codeclimate.com/github/flashtag/development/badges/gpa.svg)](https://codeclimate.com/github/flashtag/development)
 [![Build Status](https://travis-ci.org/flashtag/development.svg?branch=master)](https://travis-ci.org/flashtag/development)

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

### Contributing

##### 1. Clone the repo

- Fork the repo
- `git clone git@github.com:YOUR_FORK_HERE/development.git flashtag-dev` then go to that directory

##### 2. Development Install:

 - `composer install`
 
 - `cp .env.example .env`
 
 - `php artisan key:generate`
 
##### 3. Development VM and database seeding:

 - `vendor/bin/homestead make`

 - set up your `Homestead.yaml` to look similar to the example.

 - `vagrant up && vagrant ssh`
 
 - `cd flashtag`

 - `php artisan migrate --seed`
 
##### 4. Running tests:

 - `vendor/bin/phpunit`

##### 5. Admin login:
 
 - Visit the admin page on the domain you set in `Homestead.yaml` (in my case that would be **http://app.test/admin**) and enter the seeded test users' credentials:
    - `test@test.com`/`password` : normal user
    - `admin@test.com`/`password` : admin user

