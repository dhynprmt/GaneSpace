<?php

namespace App\Services;

use App\Models\StudentProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class StudentPhotoService
{
    public static function rules(): array
    {
        return ['image', 'mimes:jpg,jpeg', 'max:2048', 'dimensions:max_width=2048,max_height=2048'];
    }

    public function store(UploadedFile $photo, int $userId): string
    {
        abort_unless(Schema::hasColumn('student_profiles', 'profile_photo_path'), 503,
            'Penyimpanan foto profil belum diaktifkan.');
        $path = $photo->store("student-photos/{$userId}", 'local');
        if (! $path) throw new \RuntimeException('Could not store profile photo.');
        return $path;
    }

    public function replace(int $userId, UploadedFile $photo): void
    {
        $newPath = $this->store($photo, $userId);
        try {
            $oldPath = DB::transaction(function () use ($userId, $newPath) {
                $profile = StudentProfile::where('user_id', $userId)->lockForUpdate()->firstOrFail();
                $oldPath = $profile->profile_photo_path;
                $profile->update(['profile_photo_path' => $newPath]);
                return $oldPath;
            }, 3);
        } catch (\Throwable $error) {
            Storage::disk('local')->delete($newPath);
            throw $error;
        }
        if ($oldPath) Storage::disk('local')->delete($oldPath);
    }
}
