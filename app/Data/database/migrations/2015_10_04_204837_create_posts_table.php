<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->string('slug');
            $table->string('subtitle')->nullable();
            $table->unsignedInteger('category_id')->nullable();
            $table->text('body')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('start_showing_at')->nullable();
            $table->timestamp('stop_showing_at')->nullable();
            $table->unsignedInteger('author_id')->nullable();
            $table->boolean('show_author')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->unsignedInteger('locked_by_id')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('image')->nullable();
            $table->string('meta_description')->nullable();
            $table->string('meta_canonical')->nullable();
            $table->integer('views')->unsigned()->default(1);
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
        Schema::drop('posts');
    }
}
