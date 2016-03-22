<?php

use Illuminate\Database\Seeder;

class InstallSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->createCategory();
    }

    public function createCategory()
    {
        return \Flashtag\Data\Category::create([
            'name' => 'Miscellaneous',
            'slug' => 'miscellaneous',
            'description' => 'This is an example category',
        ]);
    }

    public function createPost()
    {
        $body = <<<HTML

HTML;

        return \Flashtag\Data\Post::create([
            'title' => 'Welcome to Flashtag!',
            'subtitle' => 'It&rsquo;s great to have you.',
            'slug' => 'welcome-to-flashtag',
            'body' => $body,
        ]);
    }
}
