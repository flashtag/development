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
            $table->integer('priority')->unsigned();
            $table->integer('category_id')->unsigned();
            $table->text('body')->nullable();
            $table->boolean('is_published')->default(false);
            $table->dateTime('start_showing_at')->nullable();
            $table->dateTime('stop_showing_at')->nullable();
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
