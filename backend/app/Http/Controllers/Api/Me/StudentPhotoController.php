<?php

namespace App\Http\Controllers\Api\Me;

use App\Http\Controllers\Controller;
use App\Services\StudentPhotoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentPhotoController extends Controller
{
    public function update(Request $request, StudentPhotoService $photos)
    {
        $request->validate(['profile_photo' => ['required', ...StudentPhotoService::rules()]]);
        $photos->replace($request->user()->id, $request->file('profile_photo'));
        return response()->noContent();
    }

    public function show(Request $request)
    {
        $path = $request->user()->studentProfile()->first()?->profile_photo_path;
        $disk = Storage::disk('local');
        abort_unless($path && $disk->exists($path), 404);
        return $disk->response($path, 'profile.jpg', [
            'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff',
            'Content-Type' => 'image/jpeg',
        ]);
    }
}
