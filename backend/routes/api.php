<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==========================================================
// AUTHENTICATION CONTROLLERS
// ==========================================================

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\PasswordController;
use App\Http\Controllers\Api\Auth\RegistrationController;
use App\Http\Controllers\Api\Auth\SessionController;

use App\Http\Controllers\Api\Me\ProfileController;
use App\Http\Controllers\Api\Me\StudentPhotoController;

use App\Http\Controllers\Api\Master\RoleAssignmentController;
use App\Http\Controllers\Api\Master\StudentVerificationController;

// ==========================================================
// PUBLIC CONTROLLERS
// ==========================================================

use App\Http\Controllers\Api\Public\EventController as PublicEventController;
use App\Http\Controllers\Api\Public\EventTaxonomyController as PublicEventTaxonomyController;
use App\Http\Controllers\Api\Public\CampusDirectoryController as PublicCampusDirectoryController;

// ==========================================================
// EVENT ADMIN CONTROLLERS
// ==========================================================

use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\EventMediaController;
use App\Http\Controllers\Api\Admin\OrganizationController as AdminOrganizationController;

// ==========================================================
// MASTER ADMIN CONTROLLERS
// ==========================================================

use App\Http\Controllers\Api\Master\OrganizationController as MasterOrganizationController;
use App\Http\Controllers\Api\Master\EventModerationController;
use App\Http\Controllers\Api\Master\EventTaxonomyController as MasterEventTaxonomyController;
use App\Http\Controllers\Api\Master\CampusDirectoryController as MasterCampusDirectoryController;

// ==========================================================
// PRIVATE MEETING LINK CONTROLLER
// ==========================================================

use App\Http\Controllers\Api\Events\MeetingLinkController;


// ==========================================================
// 1. DEFAULT LARAVEL API ROUTE
// ==========================================================

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', 'account.active']);


// ==========================================================
// 2. PUBLIC AUTHENTICATION ROUTES
// ==========================================================

Route::prefix('auth')->group(function () {

    // Student registration
    Route::post('/register', [
        RegistrationController::class,
        'store'
    ])->middleware('throttle:5,1');

    // Login
    Route::post('/login', [
        SessionController::class,
        'login'
    ])->middleware('throttle:8,1');

    // Forgot password
    Route::post('/forgot-password', [
        PasswordController::class,
        'forgot'
    ])->middleware('throttle:3,1');

    // Reset password
    Route::post('/reset-password', [
        PasswordController::class,
        'reset'
    ])->middleware('throttle:5,1');

    // Resend email verification
    Route::post('/email/resend', [
        EmailVerificationController::class,
        'resend'
    ])->middleware('throttle:3,1');

    // Verify email
    Route::get('/email/verify/{id}/{hash}', [
        EmailVerificationController::class,
        'verify'
    ])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

});


// ==========================================================
// 3. PUBLIC EVENT ROUTES
// ==========================================================

// Public event listing
Route::get('/events', [
    PublicEventController::class,
    'index'
]);

// Public event details
Route::get('/events/{slug}', [
    PublicEventController::class,
    'show'
]);

// Event categories
Route::get('/event-categories', [
    PublicEventTaxonomyController::class,
    'categories'
]);

// Event types
Route::get('/event-types', [
    PublicEventTaxonomyController::class,
    'types'
]);


// ==========================================================
// 4. PUBLIC CAMPUS DIRECTORY
// ==========================================================

// Faculties
Route::get('/faculties', [
    PublicCampusDirectoryController::class,
    'faculties'
]);

// Departments by faculty
Route::get('/faculties/{faculty}/departments', [
    PublicCampusDirectoryController::class,
    'departments'
]);

// Study programs by department
Route::get('/departments/{department}/study-programs', [
    PublicCampusDirectoryController::class,
    'studyPrograms'
]);


// ==========================================================
// 5. AUTHENTICATED ROUTES
// ==========================================================

Route::middleware([
    'auth:sanctum',
    'account.active'
])->group(function () {

    // ======================================================
    // 5.1 AUTHENTICATION & PROFILE
    // ======================================================

    // Logout
    Route::post('/auth/logout', [
        SessionController::class,
        'logout'
    ]);

    // Current authenticated user
    Route::get('/me', [
        ProfileController::class,
        'show'
    ]);

    // Student verification status
    Route::get('/me/verification', [
        ProfileController::class,
        'verification'
    ]);

    // Update profile
    Route::patch('/me/profile', [
        ProfileController::class,
        'update'
    ]);

    // Resubmit student verification
    Route::post('/me/student-profile/resubmit', [
        ProfileController::class,
        'resubmit'
    ])->middleware([
        'role:student',
        'throttle:5,1'
    ]);

    Route::middleware('role:student')->group(function () {
        Route::get('/me/student-profile/photo', [StudentPhotoController::class, 'show']);
        Route::post('/me/student-profile/photo', [StudentPhotoController::class, 'update'])->middleware('throttle:10,1');
    });

    // Download own KTM
    Route::get('/me/student-profile/ktm', [
        ProfileController::class,
        'ktm'
    ])->middleware('role:student');


    // ======================================================
    // 5.2 EVENT ADMIN - ORGANIZATIONS
    // ======================================================

    // Get organizations assigned to Event Admin
    Route::get('/admin/organizations', [
        AdminOrganizationController::class,
        'index'
    ]);


    // ======================================================
    // 5.3 EVENT ADMIN - EVENT CRUD
    // ======================================================

    // List manageable events
    Route::get('/admin/events', [
        AdminEventController::class,
        'index'
    ]);

    // Create event
    Route::post('/admin/events', [
        AdminEventController::class,
        'store'
    ]);

    // Get event details
    Route::get('/admin/events/{event}', [
        AdminEventController::class,
        'show'
    ]);

    // Update event
    Route::put('/admin/events/{event}', [
        AdminEventController::class,
        'update'
    ]);

    // Archive event
    Route::delete('/admin/events/{event}', [
        AdminEventController::class,
        'destroy'
    ]);


    // ======================================================
    // 5.4 EVENT ADMIN - PUBLICATION
    // ======================================================

    // Publish event
    Route::patch('/admin/events/{event}/publish', [
        AdminEventController::class,
        'publish'
    ]);

    // Unpublish event
    Route::patch('/admin/events/{event}/unpublish', [
        AdminEventController::class,
        'unpublish'
    ]);


    // ======================================================
    // 5.5 EVENT ADMIN - EVENT MEDIA
    // ======================================================

    // Upload poster or gallery image
    Route::post('/admin/events/{event}/media', [
        EventMediaController::class,
        'store'
    ]);

    // Delete event media
    Route::delete('/admin/events/{event}/media/{media}', [
        EventMediaController::class,
        'destroy'
    ]);


    // ======================================================
    // 5.6 PRIVATE MEETING LINK
    // ======================================================

    Route::get('/events/{event}/meeting-link', [
        MeetingLinkController::class,
        'show'
    ]);


    // ======================================================
    // 6. SUPER ADMIN / UPA TIK ROUTES
    // ======================================================

    Route::prefix('master')
        ->middleware('role:super_admin')
        ->group(function () {

        // ==================================================
        // 6.1 STUDENT VERIFICATION
        // ==================================================

        Route::get('/student-verifications', [
            StudentVerificationController::class,
            'index'
        ]);

        Route::get('/student-verifications/{studentProfile}', [
            StudentVerificationController::class,
            'show'
        ]);

        Route::patch('/student-verifications/{studentProfile}', [
            StudentVerificationController::class,
            'update'
        ]);

        Route::get('/student-verifications/{studentProfile}/ktm', [
            StudentVerificationController::class,
            'ktm'
        ]);


        // ==================================================
        // 6.2 USER ROLE MANAGEMENT
        // ==================================================

        Route::post('/user-roles', [
            RoleAssignmentController::class,
            'store'
        ]);

        Route::delete('/user-roles/{userRole}', [
            RoleAssignmentController::class,
            'destroy'
        ]);


        // ==================================================
        // 6.3 ORGANIZATION MANAGEMENT
        // ==================================================

        Route::apiResource(
            'organizations',
            MasterOrganizationController::class
        )->only([
            'index',
            'store',
            'show',
            'update',
            'destroy'
        ]);


        // ==================================================
        // 6.4 EVENT MODERATION
        // ==================================================

        // List all events
        Route::get('/events', [
            EventModerationController::class,
            'index'
        ]);

        // Moderate event
        Route::patch('/events/{event}/moderation', [
            EventModerationController::class,
            'moderate'
        ]);

        // Event moderation history
        Route::get('/events/{event}/moderation-logs', [
            EventModerationController::class,
            'logs'
        ]);


        // ==================================================
        // 6.5 EVENT CATEGORIES
        // ==================================================

        Route::get('/event-categories', [
            MasterEventTaxonomyController::class,
            'categories'
        ]);

        Route::patch('/event-categories/{eventCategory}', [
            MasterEventTaxonomyController::class,
            'updateCategory'
        ]);


        // ==================================================
        // 6.6 EVENT TYPES
        // ==================================================

        Route::get('/event-types', [
            MasterEventTaxonomyController::class,
            'types'
        ]);

        Route::post('/event-types', [
            MasterEventTaxonomyController::class,
            'storeType'
        ]);

        Route::patch('/event-types/{eventType}', [
            MasterEventTaxonomyController::class,
            'updateType'
        ]);

        Route::delete('/event-types/{eventType}', [
            MasterEventTaxonomyController::class,
            'destroyType'
        ]);


        // ==================================================
        // 6.7 FACULTY MANAGEMENT
        // ==================================================

        Route::get('/faculties', [
            MasterCampusDirectoryController::class,
            'faculties'
        ]);

        Route::post('/faculties', [
            MasterCampusDirectoryController::class,
            'storeFaculty'
        ]);

        Route::patch('/faculties/{faculty}', [
            MasterCampusDirectoryController::class,
            'updateFaculty'
        ]);


        // ==================================================
        // 6.8 DEPARTMENT MANAGEMENT
        // ==================================================

        Route::get('/departments', [
            MasterCampusDirectoryController::class,
            'departments'
        ]);

        Route::post('/departments', [
            MasterCampusDirectoryController::class,
            'storeDepartment'
        ]);

        Route::patch('/departments/{department}', [
            MasterCampusDirectoryController::class,
            'updateDepartment'
        ]);


        // ==================================================
        // 6.9 STUDY PROGRAM MANAGEMENT
        // ==================================================

        Route::get('/study-programs', [
            MasterCampusDirectoryController::class,
            'studyPrograms'
        ]);

        Route::post('/study-programs', [
            MasterCampusDirectoryController::class,
            'storeStudyProgram'
        ]);

        Route::patch('/study-programs/{studyProgram}', [
            MasterCampusDirectoryController::class,
            'updateStudyProgram'
        ]);

    });

});

Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
    $controller = \App\Http\Controllers\Api\Me\AcademicRegistrationController::class;
    Route::get('/admin/events/{event}/participants', [$controller, 'participants']);
    Route::middleware('role:student')->group(function () use ($controller) {
        Route::post('/events/{event}/registrations', [$controller, 'store']);
        Route::get('/me/registrations', [$controller, 'index']);
        Route::get('/me/registrations/{registration}', [$controller, 'show']);
        Route::post('/me/registrations/{registration}/cancel', [$controller, 'cancel']);
    });
});

Route::middleware(['auth:sanctum', 'account.active'])->prefix('me/notifications')->group(function () {
    $controller = \App\Http\Controllers\Api\Me\NotificationController::class;
    Route::get('/', [$controller, 'index']);
    Route::get('/unread-count', [$controller, 'count']);
    Route::patch('/read-all', [$controller, 'readAll']);
    Route::patch('/{id}/read', [$controller, 'read'])->whereUuid('id');
});

Route::middleware(['auth:sanctum', 'account.active', 'role:student'])->group(function () {
    $controller = \App\Http\Controllers\Api\Me\ReceiptController::class;
    Route::get('/me/registrations/{registration}/receipt', [$controller, 'download']);
    Route::get('/me/registrations/{registration}/qr', [$controller, 'qr']);
});
Route::get('/receipts/verify/{uuid}', [\App\Http\Controllers\Api\Me\ReceiptController::class, 'verify'])
    ->whereUuid('uuid')->middleware('throttle:60,1');