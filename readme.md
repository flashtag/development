## Flashtag
 [![Build Status](https://travis-ci.org/flashtag/flashtag.svg?branch=master)](https://travis-ci.org/flashtag/flashtag)
 [![Code Climate](https://codeclimate.com/github/flashtag/flashtag/badges/gpa.svg)](https://codeclimate.com/github/flashtag/flashtag)
 [![Test Coverage](https://codeclimate.com/github/flashtag/flashtag/badges/coverage.svg)](https://codeclimate.com/github/flashtag/flashtag/coverage)

### Development

Follow the progress or vote on features on [our trello board](https://trello.com/b/KWzDShYs/flashtag).

#### dev instructions

 - clone the flashtag repo
 
 - composer install
 
 - copy `.env.example` to `.env`
 
 - `php artisan key:generate`

 - `vendor/bin/homestead make`

 - set up your `Homestead.yaml` to look similar to the example.

 - `vagrant up && vagrant ssh`
 
 - `cd flashtag`

 - `php artisan migrate --seed`

 . . .
 
test
