<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Flashtag\Api\Http\Requests\PublishRequest;
use Illuminate\Http\Request;
use Flashtag\Api\Transformers\FieldTransformer;
use Flashtag\Posts\Field;

class FieldsController extends Controller
{
    /**
     * @var \Flashtag\Posts\Field
     */
    private $field;

    /**
     * @param \Flashtag\Posts\Field $field
     */
    public function __construct(Field $field)
    {
        $this->field = $field;
    }

    /**
     * Display a listing of the fields.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $fields = $this->field->paginate($count);
        $this->appendPaginationLinks($fields, $request);

        return $this->response->paginator($fields, new FieldTransformer());
    }

    /**
     * Display the specified field.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $field = $this->field->findOrFail($id);

        return $this->response->item($field, new FieldTransformer());
    }

    /**
     * Store a newly created field in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $fieldData = $this->buildFieldFromRequest($request);
        $field = $this->field->create($fieldData);
        $this->syncRelationships($field, $request);

        return $this->response->item($field, new FieldTransformer());
    }

    /**
     * Update the specified field in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $fieldData = $this->buildFieldFromRequest($request);
        $field = $this->field->findOrFail($id);
        $field->update($fieldData);
        $this->syncRelationships($field, $request);

        return $this->response->item($field, new FieldTransformer());
    }

    /**
     * Build the field data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildFieldFromRequest(Request $request)
    {
        return [
            'label' => $request->get('label'),
            'name' => $request->get('name'),
            'template' => $request->get('template'),
            'description' => $request->get('description'),
        ];
    }

    /**
     * Remove the specified field from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $field = $this->field->findOrFail($id);
        $field->delete();

        return $this->response->item($field, new FieldTransformer());
    }

    private function syncRelationships($field, $request)
    {
        //
    }
}
