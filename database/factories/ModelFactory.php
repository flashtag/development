<?php

$factory->define(Flashtag\Data\Category::class, function (Faker\Generator $faker) {
    $name = implode(' ', $faker->words(2));

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Data\Tag::class, function (Faker\Generator $faker) {
    $name = $faker->sentence(4);

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Data\Post::class, function (Faker\Generator $faker) {
    $title = $faker->sentence(4);

    return [
        'title' => $title,
        'subtitle' => $faker->sentence(4),
        'slug' => str_slug($title),
        'body' => $faker->paragraph(6),
        'is_published' => $faker->boolean(80),
        'start_showing_at' => $faker->dateTimeBetween('-1 year'),
        'stop_showing_at' => $faker->dateTimeBetween('-1 week', '+1 year'),
        'order' => 2,
    ];
});

$factory->define(Flashtag\Data\Field::class, function (Faker\Generator $faker) {
    $name = $faker->sentence(4);

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'template' => $faker->word,
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Data\Author::class, function (Faker\Generator $faker) {
    $name = $faker->name;

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'link' => $faker->url,
        'photo' => $faker->imageUrl(200),
        'bio' => $faker->paragraph(3),
    ];
});

$factory->define(Flashtag\Data\MetaTag::class, function (Faker\Generator $faker) {
    return [
        'url' => $faker->url,
        'description' => $faker->sentence(6),
        'image' => $faker->imageUrl(300),
    ];
});

$factory->define(Flashtag\Data\PostRating::class, function (Faker\Generator $faker) {
    return [
        'value' => $faker->numberBetween(0, 100),
        'ip' => $faker->ipv4,
    ];
});

$factory->define(Flashtag\Data\User::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->email,
        'password' => bcrypt(str_random(10)),
        'remember_token' => str_random(10),
    ];
});
