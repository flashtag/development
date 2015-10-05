<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Scribbl\Field;

class FieldsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();
        $this->seedFields();
        Model::reguard();
    }

    private function seedFields()
    {
        return new Collection([
            Field::create([
                'name'        => 'Pull quote',
                'slug'        => 'pull-quote',
                'description' => 'Pull quotes',
                'template'    => 'string',
            ]),
            Field::create([
                'name'        => 'Footnotes',
                'slug'        => 'footnotes',
                'description' => 'Footnotes',
                'template'    => 'rich_text',
            ]),
        ]);
    }
}
