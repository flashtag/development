<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostPostListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('post_post_list', function (Blueprint $table) {
            $table->integer('post_id')->unsigned();
            $table->integer('post_list_id')->unsigned();

            $table->integer('order')->unsigned()->default(0);

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('post_list_id')->references('id')->on('post_lists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('post_post_list');
    }
}
