<?php

namespace Scribbl\Api;

use League\Fractal\Manager;
use League\Fractal\Serializer\ArraySerializer;
use Scribbl\Api\Exceptions\TransformerNotFound;

class FractalDataFormatter implements DataFormatter
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
     * @var \Scribbl\Api\FractalFactory
     */
    private $fractalFactory;

    /**
     * @param \League\Fractal\Manager $fractal
     * @param \Scribbl\Api\FractalFactory $fractalFactory
     */
    public function __construct(Manager $fractal, FractalFactory $fractalFactory)
    {
        $this->fractal = $fractal;
        $this->fractalFactory = $fractalFactory;
    }

    /**
     * @param \Illuminate\Support\Collection $models
     * @param array $cursor
     * @param array $includes
     * @return array
     * @throws \Scribbl\Api\Exceptions\TransformerNotFound
     */
    public function collection($models, $cursor = [], $includes = [])
    {
        $this->configureTransformer($includes);
        $transformer = $this->getTransformer($models->first());

        $resource = $this->fractalFactory->collection($models, $transformer);
        $resource->setCursor($this->fractalFactory->cursor(
            $cursor['current'],
            $cursor['previous'],
            $cursor['next'],
            $cursor['count']
        ));

        return $this->fractal->createData($resource)->toArray();
    }

    /**
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param array $includes
     * @return array
     * @throws \Scribbl\Api\Exceptions\TransformerNotFound
     */
    public function item($model, $includes = [])
    {
        $this->configureTransformer($includes);
        $transformer = $this->getTransformer($model);

        $resource = $this->fractalFactory->item($model, $transformer);

        return $this->fractal->createData($resource)->toArray();
    }

    private function configureTransformer($includes)
    {
        $this->fractal->parseIncludes($includes);
        $this->fractal->setSerializer(new $this->serializer());
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