<?php

$factory->define(Flashtag\Auth\User::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->firstName.' '.$faker->lastName,
        'email' => $faker->email,
        'password' => bcrypt(str_random(10)),
        'remember_token' => str_random(10),
    ];
});

$factory->defineAs(Flashtag\Auth\User::class, 'admin', function ($faker) use ($factory) {
    $user = $factory->raw(Flashtag\Auth\User::class);

    return array_merge($user, ['admin' => true]);
});
