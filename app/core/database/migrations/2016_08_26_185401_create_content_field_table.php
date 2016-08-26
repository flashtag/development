<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContentFieldTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('content_field', function (Blueprint $table) {
            $table->uuid('id');
            $table->uuid('content_id');
            $table->uuid('field_id');
            $table->json('value');
            $table->timestamps();

            $table->primary('id');
            $table->index(['content_id', 'field_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('content_field');
    }
}
