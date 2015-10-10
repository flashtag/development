<?php

namespace Scribbl\Forms;

use Scribbl\Presenters\PostFormPresenter;

class PostForm implements HasPresenter
{
    protected $posts;

    protected $fields;

    public function __construct(Post $posts, PostField $fields)
    {
        $this->post = $posts;
        $this->field = $fields;
    }

    /**
     * @return string
     */
    public function getPresenterClass()
    {
        return PostFormPresenter::class;
    }

    public function update($postId, $attributes = [])
    {
        $this->syncFieldAttributes(null, $attributes);

        // save
    }

    public function create($attributes = [])
    {
        // create

        $this->syncFieldAttributes(null, $attributes);

        // save
    }

    /**
     * @param array $attributes
     * @return array
     */
    protected function syncFieldAttributes($post, $attributes = [])
    {
        $fields = $this->fields->all();

        $sync = $fields->reduce(function ($carry, $field) use ($attributes) {
            $name = $field->name;
            $attribute = isset($attributes[$name]) ? $attributes[$name] : $post->$name;
            $carry[$field->id] = ['value' => $attribute];
            unset($attributes[$name], $post->$name);
            return $carry;
        }, []);

        return $post->fields()->sync($sync);
    }
}
