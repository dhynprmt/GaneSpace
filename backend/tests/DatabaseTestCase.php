<?php

namespace Tests;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use LogicException;

abstract class DatabaseTestCase extends TestCase
{
    use DatabaseTransactions;

    public function createApplication()
    {
        $app = parent::createApplication();
        $connection = DB::connection();
        if (! $app->environment('testing') || $connection->getDriverName() !== 'mysql'
            || $connection->getDatabaseName() !== 'ueis_test'
            || $connection->selectOne('SELECT DATABASE() AS db')->db !== 'ueis_test') {
            throw new LogicException('GaneSpace tests require the disposable MariaDB database ueis_test.');
        }
        return $app;
    }
}
