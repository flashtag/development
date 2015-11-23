<?php

namespace Flashtag\Api\Http\Requests\Posts;

use Flashtag\Api\Http\Requests\Request;

class PublishRequest extends Request
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'is_published' => 'bool',
            'user_id' => 'int',
        ];
    }
}
