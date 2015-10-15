<?php

namespace Scribbl\Api;

interface DataFormatter
{
    public function item($model, $includes = []);

    public function collection($models, $cursor = [], $includes = []);
}