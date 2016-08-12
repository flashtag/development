<?php

namespace Tests\Admin;

use Flashtag\Posts\Field;
use Flashtag\Auth\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PostFieldsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    private function createField()
    {
        return factory(Field::class)->create();
    }

    /** @test */
    public function show()
    {
        $field = $this->createField();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/post-fields/{$field->id}")
            ->seePageIs("/admin/post-fields/{$field->id}/edit")
            ->see($field->name)
            ->see($field->label)
            ->see($field->description);
    }

    /** @test */
    public function create_with_only_name_and_description()
    {
        $field = [
            'name' => 'super_duper',
            'description' => '<p>My Description.</p>',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/post-fields/create')
            ->type($field['name'], 'name')
            ->type($field['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/post-fields')
            ->seeInDatabase('fields', $field);
    }

    /** @test */
    public function create_with_all_fields()
    {
        $field = factory(Field::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/post-fields/create')
            ->type($field['name'], 'name')
            ->type($field['label'], 'label')
            ->type($field['description'], 'description')
            ->select($field['template'], 'template')
            ->press('Save')
            ->seePageIs('/admin/post-fields')
            ->seeInDatabase('fields', $field);
    }

    /** @test */
    public function create_fails_without_name()
    {
        $field = [
            'description' => '<p>My Bio.</p>',
        ];

        $this->actingAs(factory(User::class)->create())
            ->visit('/admin/post-fields/create')
            ->type($field['description'], 'description')
            ->press('Save')
            ->seePageIs('/admin/post-fields/create')
            ->see($field['description'])
            ->dontSeeInDatabase('fields', $field);
    }

    /** @test */
    public function edit_all_fields()
    {
        $field = factory(Field::class)->make()->toArray();

        $this->actingAs(factory(User::class)->create())
            ->visit("/admin/post-fields/{$this->createField()->id}/edit")
            ->type($field['name'], 'name')
            ->type($field['label'], 'label')
            ->type($field['description'], 'description')
            ->select($field['template'], 'template')
            ->press('Save')
            ->seePageIs('/admin/post-fields')
            ->seeInDatabase('fields', $field);
    }

    /** @test */
    public function edit_fails_without_name()
    {
        $field = $this->createField();
        $page = "/admin/post-fields/{$field->id}/edit";

        $this->actingAs(factory(User::class)->create())
            ->visit($page)
            ->type('', 'name')
            ->type('<p>My description.</p>', 'description')
            ->press('Save')
            ->seePageIs($page)
            ->see($field->name)
            ->see($field->description)
            ->dontSeeInDatabase('fields', ['description' => '<p>My description.</p>']);
    }

    /** @test */
    public function delete_through_route()
    {
        $this->withoutMiddleware();

        $field = $this->createField();

        $this->actingAs(factory(User::class)->create())
            ->delete("/admin/post-fields/{$field->id}")
            ->dontSeeInDatabase('fields', ['id' => $field->id]);
    }

    /** @test */
    public function delete_fails_when_not_authorized()
    {
        $this->withoutMiddleware();

        $field = $this->createField();

        $this->delete("/admin/post-fields/{$field->id}")
            ->seeInDatabase('fields', ['id' => $field->id]);
    }
}
