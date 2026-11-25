<?php

namespace App\Services;

use App\Models\Registration;
use Carbon\Carbon;
use Symfony\Component\Process\Process;

class RegistrationReceiptService
{
    public function verificationUrl(Registration $record): string
    {
        return rtrim(config('ueis.frontend_url'), '/').'/verify/receipts/'.$record->public_uuid;
    }

    public function render(Registration $record, string $format): string
    {
        $data = ['url' => $this->verificationUrl($record)];
        if ($format === 'pdf') {
            $event = $record->event_snapshot;
            $student = $record->participant_snapshot;
            $data['fields'] = [
                'Kode pendaftaran' => $record->registration_code,
                'Status' => $record->status === 'active' ? 'Terdaftar' : 'Dibatalkan',
                'Mahasiswa' => $student['name'] ?? null, 'NIM' => $student['nim'] ?? null,
                'Acara' => $event['title'] ?? null, 'Penyelenggara' => $event['organizer'] ?? null,
                'Mulai' => $this->schedule($event['start_at'] ?? null),
                'Selesai' => $this->schedule($event['end_at'] ?? null), 'Lokasi' => $event['location'] ?? null,
            ];
        }
        $process = new Process([config('ueis.receipt_python'), resource_path('receipts/render.py'), $format]);
        $process->setTimeout(15);
        $process->setInput(json_encode($data, JSON_THROW_ON_ERROR));
        if ($process->run() === 0 && $process->getOutput() !== '') {
            return $process->getOutput();
        }
        report(new \RuntimeException('GaneSpace receipt renderer exited with code '.$process->getExitCode()));
        abort(503, 'Bukti pendaftaran belum dapat dibuat.');
    }

    private function schedule(?string $date): ?string
    {
        return $date ? Carbon::parse($date)->timezone('Asia/Makassar')->format('d/m/Y H:i').' WITA' : null;
    }
}
