<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseDoctor extends Command
{
    protected $signature = 'ganespace:database-check';
    protected $description = 'Check the configured GaneSpace database and session storage using read-only queries';

    public function handle(): int
    {
        $connection = DB::connection();
        $this->line('Configuration cache: '.(app()->configurationIsCached() ? 'active' : 'off'));
        $this->line(sprintf('%s %s:%s / %s', $connection->getDriverName(), $connection->getConfig('host'),
            $connection->getConfig('port'), $connection->getDatabaseName()));
        $this->line('Session driver: '.config('session.driver'));
        try {
            $server = $connection->selectOne('SELECT DATABASE() AS db, VERSION() AS version');
            $this->info("Connected to {$server->db} ({$server->version})");
            $migrator = app('migrator');
            if (! $migrator->repositoryExists()) {
                $this->error('Migration history table is missing.');
                return self::FAILURE;
            }
            $pending = array_diff(array_keys($migrator->getMigrationFiles(database_path('migrations'))),
                $migrator->getRepository()->getRan());
            foreach ($pending as $name) $this->warn("Pending: {$name}");
            $connection->table('events')->select('id', 'slug', 'publication_status')->limit(1)->get();
            if (config('session.driver') !== 'database') {
                $this->warn('Expected a database session driver.');
                return self::FAILURE;
            }
            $session = DB::connection(config('session.connection'));
            $table = config('session.table');
            $session->table($table)->select('id', 'user_id', 'ip_address', 'user_agent', 'payload', 'last_activity')->limit(1)->get();
            $this->info('Event and session columns are readable.');
            $this->line('Profile photo column: '.(Schema::hasColumn('student_profiles', 'profile_photo_path') ? 'present' : 'pending'));
            if ($pending) {
                $this->warn('Connection is healthy. Review pending migrations before applying any schema changes.');
                return 2;
            }
            return self::SUCCESS;
        } catch (QueryException $error) {
            $code = (int) ($error->errorInfo[1] ?? 0);
            $this->error(match ($code) {
                2002, 2003 => 'Connection failed. Check the XAMPP listener and the effective host and port.',
                1045, 1044 => 'MariaDB rejected the configured account or its database privileges.',
                1049 => 'The configured database does not exist on this MariaDB server.',
                1146, 1054 => 'Required table or column is missing. Compare the migration history before changing data.',
                default => "Database check failed (driver code {$code}).",
            });
            return self::FAILURE;
        }
    }
}
