<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMetaTagsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('meta_tags', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('meta_taggable_id');
            $table->string('meta_taggable_type');
            $table->string('title');
            $table->string('description');
            $table->string('image');
            $table->string('url');
            $table->string('site_name');
            $table->string('og_type');
            $table->string('section');
            $table->string('tag');
            $table->string('twitter_card');
            $table->string('twitter_site');
            $table->string('twitter_creator');
            $table->string('facebook_admins');
            $table->string('facebook_app_id');
            $table->timestamp('published_time');
            $table->timestamp('modified_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('meta_tags');
    }
}
