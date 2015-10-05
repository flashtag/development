<?php

namespace Scribbl;

use Illuminate\Database\Eloquent\Model;

/**
 * Class FieldType
 *
 * @property int $id
 * @property string $title
 * @property string $name
 * @property string $description
 * @property string $template
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Collection $fields
 */
class FieldType extends Model
{
    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function fields()
    {
        return $this->hasMany(Field::class);
    }
}
