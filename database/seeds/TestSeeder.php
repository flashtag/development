<?php

use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class TestSeeder extends Seeder
{
    protected $faker;

    public function __construct(Faker $faker)
    {
        $this->faker = $faker::create();

        if (config('database.default') == 'pgsql') {
            $this->truncatePgsqlTables();
        } else {
            $this->truncateMysqlTables();
        }
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $tags = $this->createTags();
        $categories = $this->createCategories($tags);
        $fields = $this->createFields();
        $fieldValues = $this->setValuesToFields($fields);
        $authors = $this->createAuthors();

        $users = $this->createUsers();

        $posts = $this->createPosts($categories, $tags, $authors, $users, $fieldValues);
    }

    /**
     * Truncate the database tables.
     */
    private function truncatePgsqlTables()
    {
        \DB::statement('TRUNCATE TABLE categories CASCADE;');
        \DB::statement('TRUNCATE TABLE tags CASCADE;');
        \DB::statement('TRUNCATE TABLE posts CASCADE;');
        \DB::statement('TRUNCATE TABLE fields CASCADE;');
        \DB::statement('TRUNCATE TABLE users CASCADE;');
    }

    /**
     * Truncate the database tables.
     */
    private function truncateMysqlTables()
    {
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \DB::table('categories')->truncate();
        \DB::table('tags')->truncate();
        \DB::table('posts')->truncate();
        \DB::table('fields')->truncate();
        \DB::table('users')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    private function createCategories($tags)
    {
        $categories = new Collection([
            factory(\Flashtag\Data\Category::class)->create(['name' => 'Hardware', 'slug' => 'hardware']),
            factory(\Flashtag\Data\Category::class)->create(['name' => 'Software', 'slug' => 'software']),
            factory(\Flashtag\Data\Category::class)->create(['name' => 'Gaming', 'slug' => 'gaming']),
            factory(\Flashtag\Data\Category::class)->create(['name' => 'Peripherals', 'slug' => 'peripherals']),
            factory(\Flashtag\Data\Category::class)->create(['name' => 'Accessories', 'slug' => 'accessories']),
            factory(\Flashtag\Data\Category::class)->create(['name' => 'Miscellaneous', 'slug' => 'miscellaneous']),
        ]);

        $categories->each(function ($category) use ($tags) {
            $category->tags()->sync($this->faker->randomElements($tags->lists('id')->toArray(), 2));
        });

        return $categories;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    private function createTags()
    {
        return new Collection([
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'html', 'slug' => 'html']),
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'php', 'slug' => 'php']),
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'haskell', 'slug' => 'haskell']),
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'javascript', 'slug' => 'javascript']),
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'ruby', 'slug' => 'ruby']),
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'python', 'slug' => 'python']),
            factory(\Flashtag\Data\Tag::class)->create(['name' => 'scala', 'slug' => 'scala']),
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    private function createFields()
    {
        return new Collection([
            \Flashtag\Data\Field::create([
                'name'        => 'pull_quote',
                'label'       => 'Pull quote',
                'description' => 'Pull quotes',
                'template'    => 'string',
            ]),
            \Flashtag\Data\Field::create([
                'name'        => 'copyright',
                'label'       => 'Copyright',
                'description' => 'Copyright',
                'template'    => 'string',
            ]),
            \Flashtag\Data\Field::create([
                'name'        => 'footnotes',
                'label'       => 'Footnotes',
                'description' => 'Footnotes',
                'template'    => 'rich_text',
            ]),
            \Flashtag\Data\Field::create([
                'name'        => 'disclaimer',
                'label'       => 'Disclaimer',
                'description' => 'Disclaimer',
                'template'    => 'string',
            ]),
            \Flashtag\Data\Field::create([
                'name'        => 'teaser',
                'label'       => 'Teaser',
                'description' => 'Teaser',
                'template'    => 'rich_text',
            ]),
        ]);
    }

    /**
     * Make an array of field values to sync to posts.
     *
     * @param \Illuminate\Support\Collection $fields
     * @return array
     */
    private function setValuesToFields(Collection $fields)
    {
        return $fields->reduce(function($carry, $field) {
            $carry[$field->name] = $this->faker->word;
            return $carry;
        }, []);
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    private function createAuthors()
    {
        return factory(\Flashtag\Data\Author::class, 5)->create();
    }

    /**
     * @param Collection $categories
     * @param Collection $tags
     * @param Collection $authors
     * @param Collection $users
     * @param array $fieldValues
     * @return Collection
     */
    private function createPosts(Collection $categories, Collection $tags, Collection $authors, Collection $users, array $fieldValues)
    {
        $ipsum = <<<IPSUM
    <p>Never in all their history have men been able truly to conceive of the world as one: a single sphere, a globe, having the qualities of a globe, a round earth in which all the directions eventually meet, in which there is no center because every point, or none, is center — an equal earth which all men occupy as equals. The airman's earth, if free men make it, will be truly round: a globe in practice, not in theory.</p>
    <p>Science cuts two ways, of course; its products can be used for both good and evil. But there's no turning back from science. The early warnings about technological dangers also come from science.</p>
    <p>What was most significant about the lunar voyage was not that man set foot on the Moon but that they set eye on the earth.</p>
    <p>A Chinese tale tells of some men sent to harm a young girl who, upon seeing her beauty, become her protectors rather than her violators. That's how I felt seeing the Earth for the first time. I could not help but love and cherish her.</p>
    <p>For those who have seen the Earth from space, and for the hundreds and perhaps thousands more who will, the experience most certainly changes your perspective. The things that we share in our world are far more valuable than those which divide us.</p>
    <h2 class="section-heading">The Final Frontier</h2>
    <p>There can be no thought of finishing for ‘aiming for the stars.’ Both figuratively and literally, it is a task to occupy the generations. And no matter how much progress one makes, there is always the thrill of just beginning.</p>
    <p>There can be no thought of finishing for ‘aiming for the stars.’ Both figuratively and literally, it is a task to occupy the generations. And no matter how much progress one makes, there is always the thrill of just beginning.</p>
    <blockquote>The dreams of yesterday are the hopes of today and the reality of tomorrow. Science has not yet mastered prophecy. We predict too much for the next year and yet far too little for the next ten.</blockquote>
    <p>Spaceflights cannot be stopped. This is not the work of any one man or even a group of men. It is a historical process which mankind is carrying out in accordance with the natural laws of human development.</p>
    <h2 class="section-heading">Reaching for the Stars</h2>
    <p>As we got further and further away, it [the Earth] diminished in size. Finally it shrank to the size of a marble, the most beautiful you can imagine. That beautiful, warm, living object looked so fragile, so delicate, that if you touched it with a finger it would crumble and fall apart. Seeing this has to change a man.</p>
    <a href="#"><img class="img-responsive" src="/assets/front/clean-blog/img/post-sample-image.jpg" alt=""></a>
    <span class="caption text-muted">To go places and do things that have never been done before – that’s what living is all about.</span>
    <p>Space, the final frontier. These are the voyages of the Starship Enterprise. Its five-year mission: to explore strange new worlds, to seek out new life and new civilizations, to boldly go where no man has gone before.</p>
    <p>As I stand out here in the wonders of the unknown at Hadley, I sort of realize there’s a fundamental truth to our nature, Man must explore, and this is exploration at its greatest.</p>
    <p>Placeholder text by <a href="http://spaceipsum.com/">Space Ipsum</a>. Photographs by <a href="https://www.flickr.com/photos/nasacommons/">NASA on The Commons</a>.</p>
IPSUM;

        $posts = factory(\Flashtag\Data\Post::class, 100)->create([
            'body' => $ipsum
        ]);

        return $posts->map(function ($post) use ($categories, $tags, $authors, $users, $fieldValues) {
            $post->disableRevisionField(['category_id', 'author_id', 'show_author', 'order']);
            $post->changeCategoryTo($categories->random());
            $post->addTags($this->faker->randomElements($tags->all(), 2));
            $post->saveFields($fieldValues);
            $post->author_id = $this->faker->randomElement($authors->lists('id')->toArray());
            $post->show_author = $this->faker->boolean();
            if ($this->faker->boolean()) {
                $post->is_locked = true;
                $post->locked_by_id = $this->faker->randomElement($users->lists('id')->toArray());
            }
            $post->save();

            // Additional Relationships
            $this->addRatingsTo($post);

            event(new \Flashtag\Data\Events\PostWasCreated($post));

            return $post;
        });
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     */
    private function addRatingsTo($model)
    {
        $ratings = factory(\Flashtag\Data\PostRating::class, $this->faker->numberBetween(2, 10))->create();

        $ratings->map(function($rating) use ($model) {
            $model->ratings()->save($rating);
        });
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    private function createUsers()
    {
        return new Collection([
            \Flashtag\Data\User::create([
                'email' => 'test@test.com',
                'name' => $this->faker->name,
                'password' => \Hash::make('password'),
            ]),
            factory(\Flashtag\Data\User::class)->create()
        ]);
    }
}
