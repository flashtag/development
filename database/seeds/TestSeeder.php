<?php

use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class TestTableSeeder extends Seeder
{
    protected $faker;

    public function __construct(Faker $faker)
    {
        $this->faker = $faker::create();
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \DB::table('categories')->truncate();
        \DB::table('tags')->truncate();
        \DB::table('posts')->truncate();
        \DB::table('fields')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = factory(\Scribbl\Category::class, 5)->create();

        $tags = factory(\Scribbl\Tag::class, 5)->create();

        $posts = factory(\Scribbl\Post::class, 10)->create([
            'category_id' => $this->faker->randomElement($categories->lists('id')->toArray())
        ]);
        $posts->each(function ($post) use ($categories, $tags) {
            $post->changeCategoryTo($categories->random());
            $post->addTags($this->faker->randomElements($tags->all(), 2));
        });

        $this->call(FieldsTableSeeder::class);
    }
}
