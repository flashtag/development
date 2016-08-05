<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'name', 'value'
    ];

    public static function byName($name)
    {
        $values = static::oldest('name')->name($name);

        return is_array($name)
            ? $values->pluck('value', 'name')->all()
            : $values->value('value');
    }

    public static function destroyByName($names)
    {
        $ids = static::name($names)->pluck('id')->all();

        return static::destroy($ids);
    }

    public function scopeName($query, $name)
    {
        return is_array($name)
            ? $query->whereIn('name', $name)
            : $query->where('name', $name);
    }
}
