<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Illuminate\Http\Request;
use Flashtag\Api\Transformers\SettingTransformer;
use Flashtag\Core\Setting;

class SettingsController extends Controller
{
    /**
     * @var \Flashtag\Core\Setting
     */
    private $setting;

    /**
     * @param \Flashtag\Core\Setting $setting
     */
    public function __construct(Setting $setting)
    {
        $this->setting = $setting;
    }

    /**
     * Display a listing of the settings.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $settings = settings()->all(true);

        $data = [];
        foreach ($settings as $name => $value) {
            $data[] = [
                'name' => $name,
                'value' => $value,
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Display the specified setting.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $setting = $this->setting->findOrFail($id);

        return $this->response->item($setting, new SettingTransformer());
    }

    /**
     * Store a newly created setting in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $settingData = $this->buildSettingFromRequest($request);
        $setting = $this->setting->create($settingData);

        return $this->response->item($setting, new SettingTransformer());
    }

    /**
     * Update the specified setting in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $settingData = $this->buildSettingFromRequest($request);
        $setting = $this->setting->findOrFail($id);
        $setting->update($settingData);

        return $this->response->item($setting, new SettingTransformer());
    }

    /**
     * Build the setting data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildSettingFromRequest(Request $request)
    {
        return [
            'name' => $request->get('name'),
            'value' => $request->get('value'),
        ];
    }

    /**
     * Remove the specified setting from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $setting = $this->setting->findOrFail($id);
        $setting->delete();

        return $this->response->item($setting, new SettingTransformer());
    }
}
