<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFieldablesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fieldables', function (Blueprint $table) {
            $table->integer('field_id')->unsigned();
            $table->integer('fieldable_id')->unsigned();
            $table->string('fieldable_type');

            $table->string('value_type');
            $table->text('value');

            $table->index(['fieldable_id', 'fieldable_type']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('fieldables');
    }
}
