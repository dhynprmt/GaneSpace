<?php

namespace App\Http\Controllers\Api\Me;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Services\RegistrationReceiptService;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function download(Request $request, Registration $registration, RegistrationReceiptService $receipts)
    {
        abort_unless($request->user()->id === $registration->student_user_id, 404);
        return response($receipts->render($registration, 'pdf'), 200, [
            'Content-Type' => 'application/pdf', 'Cache-Control' => 'private, no-store',
            'Content-Disposition' => 'attachment; filename="GaneSpace-'.$registration->registration_code.'.pdf"',
        ]);
    }

    public function qr(Request $request, Registration $registration, RegistrationReceiptService $receipts)
    {
        abort_unless($request->user()->id === $registration->student_user_id, 404);
        return response($receipts->render($registration, 'qr'), 200, [
            'Content-Type' => 'image/png', 'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function verify(string $uuid)
    {
        $record = Registration::where('public_uuid', $uuid)->firstOrFail();
        return response()->json(['data' => ['event_title' => $record->event_snapshot['title'] ?? '',
            'status' => $record->status]], 200, ['Cache-Control' => 'no-store', 'X-Robots-Tag' => 'noindex, nofollow']);
    }
}
