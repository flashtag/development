<?php

namespace Scribbl\Api\Http;

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Scribbl\Api\Transformers\TransformerManager;

class Response
{
    const CODE_WRONG_ARGS = 'GEN-INVALID-ARGS';
    const CODE_NOT_FOUND = 'GEN-NOTHING-HERE';
    const CODE_INTERNAL_ERROR = 'GEN-SERVER-ERROR';
    const CODE_UNAUTHORIZED = 'GEN-UNAUTHORIZED';
    const CODE_FORBIDDEN = 'GEN-FORBIDDEN';

    /**
     * @var int
     */
    protected $statusCode = 200;

    /**
     * @var string
     */
    protected $contentType;

    /**
     * @var array
     */
    protected $supportedTypes = [
        'JSON' => 'application/json',
        'YAML' => 'application/x-yaml',
    ];

    /**
     * @var \Illuminate\Contracts\Routing\ResponseFactory
     */
    private $response;

    /**
     * @var \Illuminate\Http\Request
     */
    private $request;

    /**
     * @var \League\Fractal\Manager
     */
    private $manager;

    /**
     * @param \Illuminate\Http\Request $request
     * @param \Illuminate\Contracts\Routing\ResponseFactory $response
     * @param \Scribbl\Api\Transformers\TransformerManager $manager
     */
    public function __construct(
        Request $request,
        ResponseFactory $response,
        TransformerManager $manager
    ) {
        $this->request = $request;
        $this->response = $response;
        $this->manager = $manager;
    }

    /**
     * @param  \Illuminate\Support\Collection $models
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function collection($models)
    {
        $data = $this->manager->collection($models);

        return $this->response->json($data, 200, []);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Model $model
     * @return \Illuminate\Http\JsonResponse
     */
    public function item($model)
    {
        $data = $this->manager->item($model);

        return $this->response->json($data);
    }
}
