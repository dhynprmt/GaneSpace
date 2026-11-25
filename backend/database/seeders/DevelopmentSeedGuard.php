<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use RuntimeException;

trait DevelopmentSeedGuard
{
    protected function assertDevelopmentSeedTarget(): void
    {
        if (! app()->environment('local')) {
            throw new RuntimeException('Development seeders are restricted to APP_ENV=local.');
        }

        $database = DB::connection()->getDatabaseName();
        if ($database !== 'ganespace') {
            throw new RuntimeException("Development seeders are restricted to database 'ganespace'; current database is '{$database}'.");
        }
    }
}
