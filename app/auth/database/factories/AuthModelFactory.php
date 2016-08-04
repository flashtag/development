<?php

$factory->define(Flashtag\Posts\User::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->firstName.' '.$faker->lastName,
        'email' => $faker->email,
        'password' => bcrypt(str_random(10)),
        'remember_token' => str_random(10),
    ];
});

$factory->defineAs(Flashtag\Posts\User::class, 'admin', function ($faker) use ($factory) {
    $user = $factory->raw(Flashtag\Posts\User::class);

    return array_merge($user, ['admin' => true]);
});
