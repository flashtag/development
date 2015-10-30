<?php

$factory->define(Flashtag\Core\Category::class, function (Faker\Generator $faker) {
    $name = $faker->sentence(4);

    return [
        'name'        => $name,
        'slug'        => str_slug($name),
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Core\Tag::class, function (Faker\Generator $faker) {
    $name = $faker->sentence(4);

    return [
        'name'        => $name,
        'slug'        => str_slug($name),
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Core\Post::class, function (Faker\Generator $faker) {
    $title = $faker->sentence(4);

    return [
        'title'            => $title,
        'slug'             => str_slug($title),
        'subtitle'         => $faker->sentence(4),
        'body'             => $faker->paragraph(6),
        'order'            => $faker->unique()->numberBetween(1, 10000),
        'is_published'     => $faker->boolean(80),
        'start_showing_at' => $faker->dateTimeBetween('-1 year'),
        'stop_showing_at'  => $faker->dateTimeBetween('-1 week', '+1 year'),
    ];
});

$factory->define(Flashtag\Core\Field::class, function (Faker\Generator $faker) {
    $name = $faker->sentence(4);

    return [
        'name'        => $name,
        'slug'        => str_slug($name),
        'template'    => $faker->word,
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Cms\User::class, function (Faker\Generator $faker) {
    return [
        'name'           => $faker->name,
        'email'          => $faker->email,
        'password'       => bcrypt(str_random(10)),
        'remember_token' => str_random(10),
    ];
});
