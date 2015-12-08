<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateListingPostTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('listing_post', function (Blueprint $table) {
            $table->integer('listing_id')->unsigned();
            $table->integer('post_id')->unsigned();
            $table->text('value')->nullable();

            $table->foreign('listing_id')->references('id')->on('listings')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->index(['listing_id', 'post_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('listing_post');
    }
}
