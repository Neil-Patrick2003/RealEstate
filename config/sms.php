<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Active SMS Provider
    |--------------------------------------------------------------------------
    | Supported: 'infotxt', 'semaphore'
    */
    'provider' => env('SMS_PROVIDER', 'infotxt'),

    /*
    |--------------------------------------------------------------------------
    | Default Sender Name (when supported)
    |--------------------------------------------------------------------------
    */
    'from' => env('SMS_FROM', 'MyBrand'),

    /*
    |--------------------------------------------------------------------------
    | HTTP Request Settings
    |--------------------------------------------------------------------------
    */
    'timeout' => env('SMS_TIMEOUT', 15),

    /*
    |--------------------------------------------------------------------------
    | InfoTXT API Config
    |--------------------------------------------------------------------------
    */
    'infotxt' => [
        // InfoTXT uses GET with params: SMS, ApiKey, Mobile, UserID
        'url'     => env('INFOTXT_URL', 'https://api.myinfotxt.com/v2/send.php'),
        'key'     => env('INFOTXT_API_KEY'),
        'user_id' => env('INFOTXT_USER_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Semaphore API Config
    |--------------------------------------------------------------------------
    */
    'semaphore' => [
        // Semaphore uses POST form: apikey, number, message, sendername?
        'url'    => env('SEMAPHORE_URL', 'https://api.semaphore.co/api/v4/messages'),
        'key'    => env('SEMAPHORE_API_KEY'),
        'sender' => env('SEMAPHORE_SENDERNAME', env('SMS_FROM', 'MyBrand')),
    ],
];
