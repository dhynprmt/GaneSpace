<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendStudentNotice implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public readonly int $deliveryId) {}

    public function handle(): void
    {
        $query = DB::table('notification_delivery_logs')->where('id', $this->deliveryId);
        $delivery = $query->firstOrFail();
        $data = DatabaseNotification::findOrFail($delivery->notification_id)->data;
        $url = rtrim(config('ueis.frontend_url'), '/').$data['link'];
        $claimed = (clone $query)->where('delivery_status', 'queued')->update([
            'delivery_status' => 'sending', 'attempts' => DB::raw('attempts + 1'), 'updated_at' => now(),
        ]);
        if (! $claimed) {
            return;
        }
        try {
            $sent = Mail::raw($data['message']."\n\n".$url, function ($mail) use ($delivery, $data) {
                $mail->to($delivery->recipient_email)->subject('GaneSpace · '.$data['title']);
            });
            $transport = config('mail.mailers.'.config('mail.default').'.transport');
            $status = in_array($transport, ['log', 'array'], true) ? 'preview' : 'sent';
            $query->update(['delivery_status' => $status, 'provider_message_id' => $sent?->getMessageId(),
                'sent_at' => $status === 'sent' ? now() : null, 'updated_at' => now()]);
        } catch (\Throwable $error) {
            // SMTP may already have accepted the message. Reconcile before replay.
            $query->update(['delivery_status' => 'uncertain', 'last_error_redacted' => class_basename($error),
                'updated_at' => now()]);
            $this->fail(new \RuntimeException('Email GaneSpace memerlukan pemeriksaan log pengiriman #'.$this->deliveryId));
        }
    }
}
