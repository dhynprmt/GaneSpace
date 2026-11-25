<?php

namespace App\Http\Controllers\Api\Me;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->notifications()->orderByDesc('id')->paginate(50)->through(fn ($notice) => [
            'id' => $notice->id, 'type' => $notice->type, 'is_read' => $notice->read_at !== null,
            'created_at' => $notice->created_at, 'title' => $notice->data['title'] ?? '',
            'message' => $notice->data['message'] ?? '', 'link' => $notice->data['link'] ?? null,
        ]);
    }

    public function count(Request $request)
    {
        return ['unread_count' => $request->user()->unreadNotifications()->count()];
    }

    public function read(Request $request, string $id)
    {
        $request->user()->notifications()->findOrFail($id)->markAsRead();
        return response()->noContent();
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->noContent();
    }
}
