<?php

namespace Scribbl\Api\Transformers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use League\Fractal\Manager;
use Scribbl\Api\Exceptions\TransformerClassNotDefined;

class TransformerManager
{
    /**
     * @var \League\Fractal\Manager
     */
    protected $fractal;

    /**
     * @var \Illuminate\Http\Request
     */
    private $request;

    /**
     * @param \League\Fractal\Manager $fractal
     * @param \Illuminate\Http\Request $request
     */
    public function __construct(Manager $fractal, Request $request)
    {
        $this->fractal = $fractal;
        $this->request = $request;
    }

    public function collection($models)
    {
        $transformer = $this->getTransformer($models->first());

        $this->getResource($models, $transformer);
    }

    public function item($model)
    {
        $transformer = $this->getTransformer($model);

        $this->getResource($model, $transformer);
    }

    private function getResource($data, $transformer)
    {
        $this->fractal->parseIncludes($this->request->get('include'));

        // TODO: do something with the data and the transformer.
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return \Scribbl\Api\Transformers\Transformer
     * @throws \Scribbl\Api\Exceptions\TransformerClassNotDefined
     */
    private function getTransformer(Model $model)
    {
        if (! method_exists($model, 'getTransformerClass')) {
            throw new TransformerClassNotDefined("No getTransformerClass method found on {$model}");
        }
        $transformer = $model->getTransformerClass();

        return new $transformer();
    }
}