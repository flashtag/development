<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostPostFieldTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('post_post_field', function (Blueprint $table) {
            $table->integer('post_id')->unsigned();
            $table->integer('post_field_id')->unsigned();
            $table->text('value')->nullable();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('post_field_id')->references('id')->on('post_fields')->onDelete('cascade');
            $table->index(['post_field_id', 'post_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('post_post_field');
    }
}
