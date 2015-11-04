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
            $table->string('url')->nullable();
            $table->string('description', 155)->nullable();
            $table->string('image')->nullable();
            $table->string('twitter_card')->nullable();
            $table->string('twitter_site')->nullable();
            $table->string('twitter_creator')->nullable();
            $table->string('facebook_admins')->nullable();
            $table->string('facebook_app_id')->nullable();
            $table->string('facebook_page_id')->nullable();
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
