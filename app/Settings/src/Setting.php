<?php

namespace Flashtag\Settings;

use Cache;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'name', 'value'
    ];

    public static function byName($name)
    {
        $vals = static::oldest('name')->name($name);

        return is_array($name)
            ? $vals->lists('value', 'name')->all()
            : $vals->value('value');
    }

    public static function destroyByName($names)
    {
        $ids = static::name($names)->lists('id')->all();

        return static::destroy($ids);
    }

    public function scopeName($query, $name)
    {
        return is_array($name)
            ? $query->whereIn('name', $name)
            : $query->where('name', $name);
    }
}
