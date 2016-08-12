<?php

namespace Tests\Settings;

use Tests\TestCase;
use Flashtag\Core\Setting;
use Illuminate\Support\Arr;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SettingsTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions;

    public function setUp()
    {
        parent::setUp();

        // Lets clear this so we dont have to worry about our config settings
        // ... which could be anything.
        $this->app['config']['settings'] = [];
    }

    public function testSetAndGetASetting()
    {
        $settings = $this();

        $name = 'test.1';
        $value = 'testing';

        $settings->set($name, $value);

        $this->assertEquals($value, $settings->get($name));
    }

    public function testSetMultipleSettings()
    {
        $settings = $this();

        $sts = [
            'image.max.width' => 300,
            'image.max.height' => 400,
        ];

        $settings->set($sts);

        $this->assertEquals($sts, $settings->all());
    }

    public function testDirtySettings()
    {
        $settings = $this();

        $sts = [
            'im' => 'a',
            'dirty' => 'setting',
        ];

        $settings->set($sts);

        $this->assertEquals(array_keys($sts), $settings->getDirty());
    }

    public function testForgetSettings()
    {
        $settings = $this();

        $sts = [
            'dont' => 'you',
            'forget' => 'about',
            'me' => 'dont'
        ];

        $settings->set($sts);

        $settings->forget(['forget']);

        $this->assertEquals(Arr::except($sts, 'forget'), $settings->all());
    }

    public function testWashDemClean()
    {
        $settings = $this();

        $sts = [
            'we' => 'gonna',
            'makem' => 'clean',
        ];

        $settings->set($sts);

        $this->assertTrue($settings->isDirty());

        $settings->wash();

        $this->assertFalse($settings->isDirty());

        $this->assertEmpty($settings->getDirty());

        // event has cleared the cache
        $this->assertNull(with($cache = $this->app['cache'])->get('settings'));


        // forget them locally
        $settings->forget(array_keys($sts));

        // we don't want to bring in the cache
        // making it think the cache has already been grabbed
        $settings->snagThatCache(false);

        // assert we cleared the previously set settings
        $this->assertEquals([], $settings->all());

        // force hit cache and merge
        $settings->snagThatCache();

        // assert with cache that our previously saved settings are there
        $this->assertEquals($sts, $settings->all());

        // see that it set the cache
        $this->assertEquals($sts, $cache->get('settings'));

        // see that the wash saved
        $setting = Setting::byName('we');
        $this->assertEquals($sts['we'], $setting);
    }

    public function testFallbacks()
    {
        $settings = $this();

        $this->assertEquals(null, $settings->get('bob'));
        $this->assertEquals('timmah', $settings->get('bob', 'timmah'));

        $this->assertNull($settings->get('taco'));

        $this->assertEquals('thursday', $settings->get('taco', 'thursday'));
        // hey that doesn't sound right

        // its taco tuesday silly
        $this->app['config']->set('settings.taco', 'tuesday');
        $this->assertEquals('tuesday', $settings->get('taco', 'thursday'));
        // much better
    }

    public function testViaInvocationOfTheWitches()
    {
        $settings = $this();

        $this->assertEquals([], $settings());
        $this->assertEquals('tom', $settings('bob', 'tom'));

        $sts = [
            'eye' => 'newt',
            'broom' => 'stick'
        ];

        $settings($sts);

        $this->assertEquals($sts, $settings());
    }

    public function __invoke()
    {
        return $this->app['settings'];
    }
}
