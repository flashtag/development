<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostRatingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('post_ratings', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('post_id')->nullable();
            $table->unsignedInteger('rater_id')->nullable();
            $table->unsignedSmallInteger('value');
            $table->bigInteger('ip')->nullable();
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
        Schema::drop('post_ratings');
    }
}
