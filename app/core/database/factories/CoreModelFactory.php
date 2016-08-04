<?php

$factory->define(Flashtag\Posts\Page::class, function (Faker\Generator $faker) {
    $title = $faker->catchPhrase;

    return [
        'title' => $title,
        'subtitle' => $faker->sentence(4),
        'slug' => str_slug($title),
        'body' => $faker->paragraph(6),
        'is_published' => $faker->boolean(80),
        'start_showing_at' => $faker->dateTimeBetween('-1 year')->getTimestamp(),
        'stop_showing_at' => $faker->dateTimeBetween('-1 week', '+1 year')->getTimestamp(),
        'template' => 'flashtag::page-templates.default',
        'meta_description' => $faker->sentence(6),
        'meta_canonical' => $faker->url,
    ];
});
