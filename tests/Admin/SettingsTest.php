<?php

namespace Tests\Admin;

use Flashtag\Auth\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    /** @test */
    public function show()
    {
        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit("/admin/settings")
            ->seePageIs("/admin/settings");
    }

    /** @test */
    public function show_fails_when_not_admin()
    {
        $this->actingAs(factory(User::class)->create())
            ->visit("/admin")
            ->dontSeeLink("Settings")
            ->get("/admin/settings")
            ->seeStatusCode(403);
    }

    /** @test */
    public function edit_all_fields()
    {
        $settings = [
            'name' => 'Test Site Name',
            'tagline' => 'Test Site Tagline',
            'keywords' => 'testing,one,two',
            'description' => 'This is a test site.',
            'post_route' => 'test_posts',
            'category_route' => 'test_categories',
            'tag_route' => 'test_tags',
            'author_route' => 'test_authors',
            'search_route' => 'test_search',
            'twitter_account' => '@tester',
            'facebook_page' => 'testbook',
            'facebook_app_id' => '1234567890test',
            'ga_id' => 'UA-1234',
        ];

        $this->actingAs(factory(User::class, 'admin')->create())
            ->visit("/admin/settings")
            ->seePageIs("/admin/settings")
            ->type($settings['name'], "name")
            ->type($settings['tagline'], "tagline")
            ->type($settings['keywords'], "keywords")
            ->type($settings['description'], "description")
            ->type($settings['post_route'], "post_route")
            ->type($settings['category_route'], "category_route")
            ->type($settings['tag_route'], "tag_route")
            ->type($settings['author_route'], "author_route")
            ->type($settings['search_route'], "search_route")
            ->type($settings['twitter_account'], "twitter_account")
            ->type($settings['facebook_page'], "facebook_page")
            ->type($settings['facebook_app_id'], "facebook_app_id")
            ->type($settings['ga_id'], "ga_id")
            ->press("Save")
            ->seePageIs("/admin/settings")
            ->see("Test Site Name")
            ->seeInDatabase('settings', [
                'name' => 'name', 'value' => $settings['name'],
                'name' => 'tagline', 'value' => $settings['tagline'],
                'name' => 'keywords', 'value' => $settings['keywords'],
                'name' => 'description', 'value' => $settings['description'],
                'name' => 'post_route', 'value' => $settings['post_route'],
                'name' => 'category_route', 'value' => $settings['category_route'],
                'name' => 'tag_route', 'value' => $settings['tag_route'],
                'name' => 'author_route', 'value' => $settings['author_route'],
                'name' => 'search_route', 'value' => $settings['search_route'],
                'name' => 'twitter_account', 'value' => $settings['twitter_account'],
                'name' => 'facebook_page', 'value' => $settings['facebook_page'],
                'name' => 'facebook_app_id', 'value' => $settings['facebook_app_id'],
                'name' => 'ga_id', 'value' => $settings['ga_id'],
            ]);
    }
}
