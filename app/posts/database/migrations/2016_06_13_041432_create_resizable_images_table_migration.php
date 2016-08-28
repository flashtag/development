<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResizableImagesTableMigration extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resizables', function (Blueprint $table) {
            $table->increments('id');

            $table->morphs('resizable');

            $table->string('original');
            $table->string('lg')->nullable();
            $table->string('md')->nullable();
            $table->string('sm')->nullable();
            $table->string('xs')->nullable();

            $table->timestamps();
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('resizables');

        Schema::table('posts', function (Blueprint $table) {
            $table->string('image')->nullable();
        });
    }
}
