<?php

namespace Flashtag\Posts;

use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid as UuidGenerator;

trait Uuids
{
    public static function bootUuids()
    {
        static::creating(function (Model $model) {
            $key = $model->getKeyName();
            if (empty($model->{$key})) {
                $model->{$key} = UuidGenerator::uuid4()->toString();
            }
        });
    }
}
