<?php

// Standalone MariaDB concurrency check. Each run keeps its synthetic booking history in ueis_test.
use App\Models\Event;
use App\Models\EventType;
use App\Models\Faculty;
use App\Models\Organization;
use App\Models\User;
use App\Services\AcademicRegistrationService;
use App\Services\RoleAssignmentService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Process\Process;

$root = dirname(__DIR__, 2);
chdir($root);
putenv('APP_ENV=testing');
$_ENV['APP_ENV'] = $_SERVER['APP_ENV'] = 'testing';
require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('testing') || DB::getDriverName() !== 'mysql' ||
    DB::selectOne('SELECT DATABASE() AS db')->db !== 'ueis_test' || config('database.connections.mysql.database') !== 'ueis_test') {
    throw new RuntimeException('This check requires a disposable MariaDB ueis_test database.');
}

if (($argv[1] ?? '') === 'attempt') {
    $student = User::findOrFail($argv[2]);
    $event = Event::findOrFail($argv[3]);
    echo "ready\n";
    flush();
    try {
        app(AcademicRegistrationService::class)->register($student, $event);
        echo "accepted\n";
    } catch (HttpExceptionInterface $error) {
        if ($error->getStatusCode() !== 409) {
            throw $error;
        }
        echo "conflict\n";
    }
    exit;
}

(new Database\Seeders\RoleSeeder)->run();
(new Database\Seeders\EventCategorySeeder)->run();
(new Database\Seeders\EventTypeSeeder)->run();
$tag = Str::random(10);
$faculty = Faculty::create(['code'=>$tag,'name'=>'QA '.$tag]);
$program = $faculty->departments()->create(['code'=>$tag,'name'=>'QA '.$tag])
    ->studyPrograms()->create(['code'=>$tag,'name'=>'QA '.$tag]);
$organization = Organization::create(['name'=>'QA '.$tag,'slug'=>'qa-'.strtolower($tag),'organization_type'=>'campus_unit','is_active'=>true]);
$students = [];
foreach ([1, 2] as $number) {
    $student = User::create(['name'=>'QA '.$number,'email'=>"$tag.$number@example.test",'password'=>Str::random(32),'account_status'=>'active']);
    $student->markEmailAsVerified();
    $student->studentProfile()->create(['nim'=>"R$tag$number",'study_program_id'=>$program->id,'verification_status'=>'verified']);
    app(RoleAssignmentService::class)->assign($student,'student');
    $students[] = $student;
}
$event = Event::create(['organization_id'=>$organization->id,'event_type_id'=>EventType::where('slug','national-seminar')->firstOrFail()->id,
    'created_by'=>$students[0]->id,'title'=>'Last seat '.$tag,'slug'=>'last-seat-'.strtolower($tag),'description'=>'Concurrency test',
    'start_at'=>now()->addDay(),'end_at'=>now()->addDays(2),'location_mode'=>'onsite','venue_name'=>'QA',
    'publication_status'=>'published','registration_opens_at'=>now()->subHour(),'registration_closes_at'=>now()->addHour(),'capacity'=>1]);

$workers = [];
try {
    DB::transaction(function () use ($event, $students, &$workers) {
        Event::lockForUpdate()->findOrFail($event->id);
        foreach ($students as $student) {
            $process = new Process([PHP_BINARY, __FILE__, 'attempt', $student->id, $event->id]);
            $process->setTimeout(20);
            $process->start();
            $workers[] = $process;
        }
        foreach ($workers as $worker) {
            if (! $worker->waitUntil(fn ($type,$output) => str_contains($output, 'ready'))) {
                throw new RuntimeException('Could not start both contenders. '.$worker->getErrorOutput());
            }
        }
    });
    $outcomes = [];
    foreach ($workers as $worker) {
        if ($worker->wait() !== 0) {
            throw new RuntimeException('Contender failed. '.$worker->getOutput().$worker->getErrorOutput());
        }
        $outcomes[] = trim(substr($worker->getOutput(), strlen("ready\n")));
    }
    sort($outcomes);
    if ($outcomes !== ['accepted','conflict'] || $event->registrations()->where('status','active')->count() !== 1) {
        throw new RuntimeException('Expected exactly one committed booking and a conflict.');
    }
    echo "PASS Two independent Laravel processes, one seat, one active booking and one HTTP 409 outcome.\n";
} finally {
    foreach ($workers as $worker) {
        if ($worker->isRunning()) $worker->stop();
    }
}
