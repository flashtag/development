<?php

namespace Scribbl;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use McCool\LaravelAutoPresenter\HasPresenter;
use PostPresenter;
use Venturecraft\Revisionable\RevisionableTrait;

/**
 * Class Post
 *
 * @property int $id
 * @property int $order
 * @property int $category_id
 * @property string $title
 * @property string $slug
 * @property string $subtitle
 * @property string $body
 * @property boolean $is_published
 * @property \Carbon\Carbon $start_showing_at
 * @property \Carbon\Carbon $stop_showing_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Model $category
 * @property \Illuminate\Database\Eloquent\Collection $fields
 * @property \Illuminate\Database\Eloquent\Collection $tags
 */
class Post extends Model implements HasPresenter
{
    use RevisionableTrait;

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['start_showing_at', 'stop_showing_at'];

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'id'           => 'integer',
        'is_published' => 'boolean'
    ];

    /**
     * Remove old revisions.
     *
     * @var bool
     */
    protected $revisionCleanup = true;

    /**
     * Maintain a maximum of 500 changes at any point of time, while cleaning up old revisions.
     *
     * @var int
     */
    protected $historyLimit = 500;

    /**
     * @return string
     */
    public function getPresenterClass()
    {
        return PostPresenter::class;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function fields()
    {
        return $this->morphToMany(Field::class, 'fieldable')
            ->withPivot('value_type', 'value');
    }

    /**
     * @param \Scribbl\Category $category
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function changeCategoryTo($category)
    {
        return $this->category()->associate($category);
    }

    /**
     * @param array $tags
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function addTags($tags)
    {
        return new Collection($this->tags()->saveMany($tags));
    }

    /**
     * Move the post to a new order.
     *
     * @param int $order
     * @return bool
     */
    public function reorder($order)
    {
        $current = $this->order;

        if ($order === $current) {
            return false;
        }

        static::incrementOrderBetween($current, $order);

        $this->order = $order;
        return $this->save();
    }

    /**
     * Increment all the posts between an old and new order.
     *
     * @param int $old
     * @param int $new
     * @return mixed
     */
    public static function incrementOrderBetween($old, $new)
    {
        if ($new < $old) {
            $increment = '+1';
            $whereBetween = [$new, $old];
        } else {
            $increment = '-1';
            $whereBetween = [$old, $new];
        }

        return \DB::update(
            \DB::raw(
                "UPDATE posts
                 SET order = order {$increment}
                 WHERE order BETWEEN ? AND ?"
            ),
            $whereBetween
        );
    }
}
