<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid as UuidGenerator;

trait Uuid
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function (Model $model) {
            $key = $model->getKeyName();
            if (empty($model->{$key})) {
                $model->{$key} = UuidGenerator::uuid4()->toString();
            }
        });
    }
}
