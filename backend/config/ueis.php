<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'receipt_python' => env('RECEIPT_PYTHON', PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3'),
    'turnstile' => [
        'https_proxy' => env('TURNSTILE_HTTPS_PROXY'),
        'secret' => env('TURNSTILE_SECRET_KEY'),
        // Optional: e.g., example.com, for an extra validation layer in production.
        'expected_hostname' => env('TURNSTILE_EXPECTED_HOSTNAME'),
    ],
];
