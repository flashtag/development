<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFieldPostTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('field_post', function (Blueprint $table) {
            $table->integer('field_id')->unsigned();
            $table->integer('post_id')->unsigned();
            $table->text('value')->nullable();

            $table->index(['field_id', 'post_id']);
            $table->foreign('field_id')->references('id')->on('fields')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('field_post');
    }
}
