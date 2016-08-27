<?php

namespace Flashtag\Posts;

use Illuminate\Database\Eloquent\Model as BaseModel;

abstract class Model extends BaseModel
{
    use Revisionable;

    /**
     * Whether or not to use UUIDs as the model ID.
     *
     * @var bool
     */
    public $uuids = false;

    /**
     * Whether or not to store revisions for this model.
     *
     * @var bool
     */
    public $revisionEnabled = false;

    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function (Model $model) {
            if ($model->uuids) {
                $key = $model->getKeyName();
                if (empty($model->{$key})) {
                    $model->{$key} = UuidGenerator::uuid4()->toString();
                }
            }
        });

        if (!method_exists(get_called_class(), 'bootTraits')) {
            static::bootRevisionable();
        }
    }
}