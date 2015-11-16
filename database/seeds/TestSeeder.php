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
        \DB::statement('TRUNCATE TABLE meta_tags CASCADE;');
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
        \DB::table('meta_tags')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    private function createCategories($tags)
    {
        $categories = new Collection([
            factory(\Flashtag\Data\Category::class)->create([
                'name' => 'Hardware'
            ]),
            factory(\Flashtag\Data\Category::class)->create([
                'name' => 'Software'
            ]),
            factory(\Flashtag\Data\Category::class)->create([
                'name' => 'Gaming'
            ]),
            factory(\Flashtag\Data\Category::class)->create([
                'name' => 'Peripherals'
            ]),
            factory(\Flashtag\Data\Category::class)->create([
                'name' => 'Miscellaneous'
            ]),
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
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'html'
            ]),
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'php'
            ]),
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'haskell'
            ]),
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'javascript'
            ]),
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'ruby'
            ]),
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'python'
            ]),
            factory(\Flashtag\Data\Tag::class)->create([
                'name' => 'scala'
            ]),
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
                'template'    => 'rich_text',
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
<p>Pancetta strip steak deserunt swine pig commodo andouille ut drumstick.  Eiusmod andouille shoulder proident quis sint occaecat eu ut.  Eu qui bresaola, brisket in nulla mollit quis.  Proident qui tenderloin strip steak cupim velit.  Nostrud alcatra tail sunt, shoulder tempor exercitation duis bacon tri-tip picanha sausage sed meatloaf pancetta.</p>
<p>Anim kevin sunt pancetta, velit tenderloin sirloin adipisicing in in consequat short loin sed.  Ball tip landjaeger prosciutto, bresaola tri-tip swine t-bone turducken cupidatat tempor.  Veniam quis magna ullamco.  Nulla doner eiusmod shoulder landjaeger commodo dolore tri-tip eu andouille pastrami in id.  Tri-tip shoulder flank in ham.  Sausage hamburger aute jerky esse.  Nostrud aliquip sunt exercitation, irure flank do brisket tri-tip shoulder ground round ball tip.</p>
<p>Tenderloin short ribs tongue prosciutto leberkas biltong, reprehenderit capicola est sunt enim fugiat dolore nisi.  Picanha tenderloin pig ut.  In kielbasa pariatur id short loin et do.  Kielbasa proident meatloaf aliquip, swine short ribs sed id beef short loin veniam.  Proident frankfurter pancetta, ham hock adipisicing cupidatat nisi et pork chop strip steak kevin.  Fatback tail est in ground round.</p>
IPSUM;

        $posts = factory(\Flashtag\Data\Post::class, 100)->create([
            'body' => $ipsum
        ]);

        return $posts->map(function ($post) use ($categories, $tags, $authors, $users, $fieldValues) {
            $post->changeCategoryTo($categories->random());
            $post->addTags($this->faker->randomElements($tags->all(), 2));
            $post->saveFields($fieldValues);
            $post->author_id = $this->faker->randomElement($authors->lists('id')->toArray());
            if ($this->faker->boolean()) {
                $post->is_locked = true;
                $post->locked_by_id = $this->faker->randomElement($users->lists('id')->toArray());
            }
            $post->save();

            // Additional Relationships
            $this->addMetaTo($post);
            $this->addRatingsTo($post);

            event(new \Flashtag\Data\Events\PostWasCreated($post));

            return $post;
        });
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     */
    private function addMetaTo($model)
    {
        $model->meta()->save(factory(\Flashtag\Data\MetaTag::class)->create());
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
