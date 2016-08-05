<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Core\Setting;

class SettingTransformer extends Transformer
{
    /**
     * @param \Flashtag\Core\Setting $setting
     * @return array
     */
    public function transform(Setting $setting)
    {
        return [
            'id' => (int) $setting->id,
            'name' => $setting->name,
            'value' => $setting->value,
            'created_at' => $setting->created_at->getTimestamp(),
            'updated_at' => $setting->updated_at->getTimestamp(),
        ];
    }
}
