<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->string('slug');
            $table->string('template')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('body')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('start_showing_at')->nullable();
            $table->timestamp('stop_showing_at')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->unsignedInteger('locked_by_id')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('image')->nullable();
            $table->string('meta_description')->nullable();
            $table->string('meta_canonical')->nullable();
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
        Schema::drop('pages');
    }
}
