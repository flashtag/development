<?php

$factory->define(Flashtag\Posts\Category::class, function (Faker\Generator $faker) {
    $name = $faker->company;

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'description' => $faker->sentence(),
    ];
});

$factory->define(Flashtag\Posts\Tag::class, function (Faker\Generator $faker) {
    $name = $faker->company;

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Posts\Post::class, function (Faker\Generator $faker) {
    $title = $faker->catchPhrase;

    return [
        'title' => $title,
        'subtitle' => $faker->sentence(4),
        'slug' => str_slug($title),
        'body' => $faker->paragraph(6),
        'is_published' => $faker->boolean(80),
        'start_showing_at' => $faker->dateTimeBetween('-1 year')->getTimestamp(),
        'stop_showing_at' => $faker->dateTimeBetween('-1 week', '+1 year')->getTimestamp(),
        'meta_description' => $faker->sentence(6),
        'meta_canonical' => $faker->url,
    ];
});

$factory->define(Flashtag\Posts\Field::class, function (Faker\Generator $faker) {
    $fieldTemplates = [
        'string',
        'rich_text',
    ];
    $name = str_replace(' ', '_', $faker->sentence(2));

    return [
        'name' => $name,
        'label' => $faker->word,
        'template' => $faker->randomElement($fieldTemplates),
        'description' => $faker->paragraph(6),
    ];
});

$factory->define(Flashtag\Posts\PostList::class, function (Faker\Generator $faker) {
    $name = $faker->sentence(2);

    return [
        'name' => $name,
        'slug' => str_slug($name),
    ];
});

$factory->define(Flashtag\Posts\Author::class, function (Faker\Generator $faker) {
    $name = $faker->name;

    return [
        'name' => $name,
        'slug' => str_slug($name),
        'link' => $faker->url,
        'photo' => $faker->imageUrl(200),
        'bio' => $faker->paragraph(3),
    ];
});

$factory->define(Flashtag\Posts\PostRating::class, function (Faker\Generator $faker) {
    return [
        'value' => $faker->numberBetween(0, 100),
        'ip' => $faker->ipv4,
    ];
});
