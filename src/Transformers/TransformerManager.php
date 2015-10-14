<?php

namespace Scribbl\Api\Transformers;

use League\Fractal\Manager;
use League\Fractal\Resource\Collection;
use League\Fractal\Resource\Item;
use League\Fractal\Serializer\ArraySerializer;
use Scribbl\Api\Exceptions\TransformerNotFound;

class TransformerManager
{
    /**
     * The default serializer.
     *
     * @var string
     */
    protected $serializer = ArraySerializer::class;

    /**
     * @var \League\Fractal\Manager
     */
    protected $fractal;

    /**
     * @param \League\Fractal\Manager $fractal
     */
    public function __construct(Manager $fractal)
    {
        $this->fractal = $fractal;
    }

    /**
     * @param \Illuminate\Support\Collection $models
     * @param array $includes
     * @return \League\Fractal\Resource\Collection
     * @throws \Scribbl\Api\Exceptions\TransformerNotFound
     */
    public function collection($models, $includes = [])
    {
        $this->fractal->parseIncludes($includes);
        $this->fractal->setSerializer(new $this->serializer());
        $transformer = $this->getTransformer($models->first());

        return new Collection($models, $transformer);
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param array $includes
     * @return \League\Fractal\Resource\Item
     * @throws \Scribbl\Api\Exceptions\TransformerNotFound
     */
    public function item($model, $includes = [])
    {
        $this->fractal->parseIncludes($includes);
        $this->fractal->setSerializer(new $this->serializer());
        $transformer = $this->getTransformer($model);

        return new Item($model, $transformer);
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return \Scribbl\Api\Transformers\Transformer
     * @throws \Scribbl\Api\Exceptions\TransformerNotFound
     */
    private function getTransformer($model)
    {
        if (method_exists($model, 'getTransformerClass')) {
            $transformer = $model->getTransformerClass();
        } else {
            $transformer = $this->makeTransformerClassFromModelClass(get_class($model));
        }

        if (! class_exists($transformer)) {
            throw new TransformerNotFound(sprintf(
                '%s does not exist. Have you tried implementing %s::getTransformerClass?',
                $transformer,
                get_class($model)
            ));
        }

        return new $transformer();
    }

    /**
     * @param string $modelClass
     * @return string
     */
    private function makeTransformerClassFromModelClass($modelClass)
    {
        $class = basename(str_replace('\\', '/', $modelClass));

        return sprintf('\Scribbl\Api\Transformers\%sTransformer', $class);
    }
}