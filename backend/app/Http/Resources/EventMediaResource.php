<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EventMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = null;
        if ($this->storage_disk === 'public') {
            $url = Storage::disk('public')->url($this->file_path);
        }

        return [
            'id' => $this->id,
            'kind' => $this->media_kind,
            'url' => $url,
            'alt_text' => $this->alt_text,
            'mime_type' => $this->mime_type,
            'file_size_bytes' => (int) $this->file_size_bytes,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
