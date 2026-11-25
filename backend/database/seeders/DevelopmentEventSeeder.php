<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventMedia;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DevelopmentEventSeeder extends Seeder
{
    use DevelopmentSeedGuard;

    /**
     * The source mock contains nine events. Mock registration counts and mock
     * publication states are intentionally not copied into the real database.
     */
    private const EVENTS = [
        [
            'slug' => 'sharing-session-ai-and-self-improvement-2026',
            'title' => 'Sharing Session: AI and Self Improvement as Twin Engines Driving Future Achievers',
            'short_description' => 'Diskusi inspiratif bersama Apsarendra Putra & Wahyu Ivan mengenai AI dan pengembangan diri mahasiswa.',
            'description' => 'Sharing Session terbuka untuk umum yang diselenggarakan oleh HMJ Teknik Informatika Undiksha dengan pemateri Apsarendra Putra dan Wahyu Ivan, dipandu moderator Dhyana Gayatri. Benefit: Poin SKP mahasiswa FTK, networking, pengetahuan & inspirasi, serta E-sertifikat (Gratis).',
            'domain' => 'academic',
            'event_type_slug' => 'sharing-session',
            'organization_slug' => 'hmj-teknik-informatika',
            'creator_email' => 'hmjti@example.test',
            'start_at' => '2026-10-11T07:30:00+08:00',
            'end_at' => '2026-10-11T12:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'GSU Balingkang Undiksha',
            'capacity' => 200,
            'registration_opens_at' => null,
            'registration_closes_at' => null,
            'external_registration_url' => null,
            'contact_name' => 'Wartika Putra (0831152071174) / Bella Satri (082247682399)',
            'requirements' => ['Terbuka untuk umum (Gratis)', 'Poin SKP khusus mahasiswa FTK'],
            'poster' => 'sharing-session.jpeg',
            'meeting_url' => null,
            'source_registration_period' => 'Terbuka (Slot Terbatas)',
        ],
        [
            'slug' => 'it-bootcamp-2026-connect-commit-create',
            'title' => 'IT Bootcamp 2026: Connect, Commit, Create — Empowering Ideas Through Technology',
            'short_description' => 'Bootcamp offline 3 hari: Git & GitHub, Web Dev + AI Coding, hingga Code Review & Intro Cloud/Docker.',
            'description' => 'Pelatihan intensif bersama Ngurah Manik Mahardika, S.Kom (Software Engineer at One Step Solution Bali) selama 3 hari sesi praktik langsung: Hari 1 Git & GitHub Foundations (17 Okt), Hari 2 Web Dev & AI Integration (18 Okt), Hari 3 Showcase, Code Review & Cloud/Docker (24 Okt).',
            'domain' => 'academic',
            'event_type_slug' => 'bootcamp',
            'organization_slug' => 'hmj-teknik-informatika',
            'creator_email' => 'hmjti@example.test',
            'start_at' => '2026-10-17T09:00:00+08:00',
            'end_at' => '2026-10-24T16:00:00+08:00',
            'location_mode' => 'hybrid',
            'venue_name' => 'Lab Komputer Prodi SI (Hybrid) FTK C, Lt. 2',
            'capacity' => 60,
            'registration_opens_at' => '2026-09-14T00:00:00+08:00',
            'registration_closes_at' => '2026-10-10T23:59:00+08:00',
            'external_registration_url' => null,
            'contact_name' => 'Nanda (+62 823-5941-0028) / Widia (+62 813-4453-8985)',
            'requirements' => ['Gratis & terbuka untuk umum', 'Membawa laptop pribadi'],
            'poster' => 'it-bootcamp.jpeg',
            // Source mock says Hybrid but provides no private meeting URL; leave NULL until an admin supplies the real URL.
            'meeting_url' => null,
            'source_registration_period' => '14 September – 10 Oktober 2026',
        ],
        [
            'slug' => 'seminar-teknologi-qos-monitoring-living-lab',
            'title' => 'Seminar Teknologi: Pengembangan Sistem QoS Monitoring pada Jaringan Multi Hop di Living Lab',
            'short_description' => 'Perancangan, pengukuran QoS, dan klasifikasi kualitas link pada jaringan ESP32 Multi-Hop.',
            'description' => 'Seminar teknologi ramah pemula bersama I Made Kristian Adinata yang membahas dasar jaringan komputer, konsep IoT, serta pengukuran Quality of Service (QoS) pada jaringan ESP32 Multi-Hop tanpa memerlukan pengalaman pemrograman tingkat lanjut.',
            'domain' => 'academic',
            'event_type_slug' => 'technology-seminar',
            'organization_slug' => 'fakultas-teknik-dan-kejuruan',
            'creator_email' => 'admin@example.test',
            'start_at' => '2026-11-20T09:00:00+08:00',
            'end_at' => '2026-11-20T11:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Living Lab Undiksha',
            'capacity' => 80,
            'registration_opens_at' => null,
            'registration_closes_at' => null,
            'external_registration_url' => null,
            'contact_name' => 'Nata (082266243660)',
            'requirements' => ['Materi ramah untuk pemula', 'Tidak memerlukan pengalaman pemrograman lanjut'],
            'poster' => 'seminar-qos.jpeg',
            'meeting_url' => null,
            'source_registration_period' => 'Terbuka hingga hari pelaksanaan',
        ],
        [
            'slug' => 'bootcamp-pkm-p2mw-sc-ftk-2026',
            'title' => 'Bootcamp PKM & P2MW SC FTK 2026',
            'short_description' => 'Pendampingan penyusunan proposal PKM & P2MW beserta review draf langsung oleh narasumber.',
            'description' => 'Program Kreativitas Mahasiswa & Program Pembinaan Mahasiswa Wirausaha SC FTK 2026. Gratis dengan fasilitas review draf proposal langsung, E-sertifikat, konsumsi, poin SKP, serta penghargaan Best Proposal untuk 10 tim PKM terbaik dan 5 tim P2MW terbaik.',
            'domain' => 'academic',
            'event_type_slug' => 'bootcamp',
            'organization_slug' => 'fakultas-teknik-dan-kejuruan',
            'creator_email' => 'admin@example.test',
            'start_at' => '2026-12-06T08:30:00+08:00',
            'end_at' => '2026-12-06T15:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Gedung Balingkang',
            'capacity' => 150,
            'registration_opens_at' => '2026-11-20T00:00:00+08:00',
            'registration_closes_at' => '2026-12-03T23:59:00+08:00',
            'external_registration_url' => null,
            'contact_name' => 'Gungade (+62 821-4559-0458) / Ila (+62 813-3476-5609)',
            'requirements' => ['Pendaftaran gratis', 'Mengumpulkan draf proposal 20 Nov – 3 Des 2026'],
            'poster' => 'bootcamp-pkm.jpeg',
            'meeting_url' => null,
            'source_registration_period' => '20 November – 3 Desember 2026',
        ],
        [
            'slug' => 'sempro-nlp-automated-grading-indobert',
            'title' => 'Seminar Proposal: Automated Short-Answer Grading Berbasis IndoBERT',
            'short_description' => 'Sesi Seminar Proposal terbuka Prodi Ilmu Komputer — memenuhi target kehadiran 10 seminar.',
            'description' => 'Pemaparan proposal penelitian mengenai pemanfaatan model bahasa Indonesia untuk evaluasi jawaban singkat otomatis pada sistem pembelajaran kampus. Pemapar: I Made Pratama Putra. Pembimbing yang tercantum pada data sumber merupakan data simulasi.',
            'domain' => 'academic',
            'event_type_slug' => 'proposal-seminar',
            'organization_slug' => 'fakultas-teknik-dan-kejuruan',
            'creator_email' => 'admin@example.test',
            'start_at' => '2026-11-27T09:30:00+08:00',
            'end_at' => '2026-11-27T11:30:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Ruang Seminar FTK 204',
            'venue_address' => 'Kampus Jinengdalem, Gedung FTK',
            'capacity' => 40,
            'registration_opens_at' => '2026-11-20T00:00:00+08:00',
            'registration_closes_at' => '2026-11-26T23:59:00+08:00',
            'external_registration_url' => null,
            'contact_name' => null,
            'requirements' => [],
            'poster' => null,
            'meeting_url' => null,
            'source_registration_period' => '20–26 November 2026',
        ],
        [
            'slug' => 'open-donation-for-action-hmj-ti-2026',
            'title' => 'Open Donation for ACTION: Bersama Bergerak, Bersama Berdampak',
            'short_description' => 'Aksi penggalangan donasi sembako, dana, alat tulis, dan pakaian layak pakai untuk Panti Asuhan Destawan.',
            'description' => 'Kegiatan sosial HMJ TI Undiksha periode donasi 28 September – 5 November 2026 (pengumpulan di Sekretariat HMJ TI pukul 14.00–18.00 WITA). Penyaluran dilaksanakan Minggu, 8 November 2026 di Panti Asuhan Destawan, Dusun Kanginan, Desa Sawan, Buleleng.',
            'domain' => 'non_academic',
            'event_type_slug' => 'student-organization-activity',
            'organization_slug' => 'hmj-teknik-informatika',
            'creator_email' => 'hmjti@example.test',
            'start_at' => '2026-11-08T09:00:00+08:00',
            'end_at' => '2026-11-08T15:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Panti Asuhan Destawan, Sawan, Buleleng',
            'capacity' => null,
            'registration_opens_at' => null,
            'registration_closes_at' => null,
            'external_registration_url' => 'https://wa.me/6287855714555',
            'contact_name' => 'Ossi (087855714555)',
            'requirements' => [],
            'poster' => 'open-donation.jpeg',
            'meeting_url' => null,
            'source_registration_period' => 'Donasi 28 September – 5 November 2026; penyaluran 8 November 2026',
        ],
        [
            'slug' => 'beauty-class-with-omg-ftk-2026',
            'title' => 'Beauty Class With OMG: Basic Makeup for Everyday Look',
            'short_description' => 'Kelas makeup interaktif terbuka untuk umum dengan free produk, voucher belanja OMG 90k, dan SKP FTK.',
            'description' => 'Beauty Class kolaborasi bersama OMG & Yeppa di Gedung FTK Undiksha. HTM 100K sudah termasuk free produk, voucher belanja OMG 90K, dessert, e-sertifikat, makeup experience, dan poin SKP khusus mahasiswa FTK.',
            'domain' => 'non_academic',
            'event_type_slug' => 'beauty-class',
            'organization_slug' => 'fakultas-teknik-dan-kejuruan',
            'creator_email' => 'admin@example.test',
            'start_at' => '2026-10-17T10:00:00+08:00',
            'end_at' => '2026-10-17T14:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Gedung FTK Undiksha',
            'capacity' => null,
            'registration_opens_at' => null,
            'registration_closes_at' => null,
            'external_registration_url' => 'https://wa.me/6289606091700',
            'contact_name' => 'Pramita (0896-0609-1700) / Angel (0815-4729-4973)',
            'requirements' => [],
            'poster' => 'beauty-class.jpeg',
            'meeting_url' => null,
            'source_registration_period' => null,
        ],
        [
            'slug' => 'open-recruitment-panitia-dies-natalis-xxxiv',
            'title' => 'Open Recruitment Panitia Dies Natalis XXXIV #3e4mazing',
            'short_description' => 'Rekrutmen panitia pelaksana Dies Natalis XXXIV Undiksha untuk 10 pilihan bidang kepanitiaan.',
            'description' => 'Kesempatan bergabung dalam kepanitiaan Dies Natalis XXXIV Undiksha (Sie Acara, Expo & Lomba, Humas & Guest Star, Logistik, Kesekretariatan, Design Creative & System, Konsumsi, Kerohanian, Penggalian Dana, Keamanan). Pendaftaran 29 Sep – 5 Okt 2026, wawancara 9 & 10 Okt 2026.',
            'domain' => 'non_academic',
            'event_type_slug' => 'committee-recruitment',
            'organization_slug' => 'bem-rema-undiksha',
            'creator_email' => 'admin@example.test',
            'start_at' => '2026-10-09T09:00:00+08:00',
            'end_at' => '2026-10-10T17:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Universitas Pendidikan Ganesha',
            'capacity' => null,
            'registration_opens_at' => null,
            'registration_closes_at' => null,
            'external_registration_url' => 'https://go.undiksha.ac.id/OPEN-RECRUITMENT-PANITIA-PELAKSANA-DIES-NATALIS-XXXIV-UNDIKSHA',
            'contact_name' => 'Pristine Holy (081939466104) / Krisna Devi (082340191143)',
            'requirements' => [],
            'poster' => 'oprec-dies-natalis.jpeg',
            'meeting_url' => null,
            'source_registration_period' => '29 September – 5 Oktober 2026; wawancara 9–10 Oktober 2026',
        ],
        [
            'slug' => 'i-love-monday-open-house-dan-musik-kampus',
            'title' => 'I Love Monday: Open House Robotik & Pentas Komunitas Musik',
            'short_description' => 'Kolaborasi Open House Robotik, Solo Vocal POKJA, Komunitas Musik TI, dan Tek-in Music Community.',
            'description' => 'Acara sore santai mahasiswa FTK yang menampilkan Open House Robotik serta penampilan langsung dari Solo Vocal POKJA, Komunitas Musik TI, dan Tek-in Music Community di Parkiran Gedung Mesin Undiksha.',
            'domain' => 'non_academic',
            'event_type_slug' => 'festival',
            'organization_slug' => 'fakultas-teknik-dan-kejuruan',
            'creator_email' => 'admin@example.test',
            'start_at' => '2026-09-07T16:30:00+08:00',
            'end_at' => '2026-09-07T21:00:00+08:00',
            'location_mode' => 'onsite',
            'venue_name' => 'Parkiran Gedung Mesin, Undiksha',
            'capacity' => null,
            'registration_opens_at' => null,
            'registration_closes_at' => null,
            'external_registration_url' => null,
            'contact_name' => 'Komunitas Musik TI & Robotik',
            'requirements' => [],
            'poster' => 'i-love-monday.jpeg',
            'meeting_url' => null,
            'source_registration_period' => null,
        ],
    ];

    public function run(): void
    {
        $this->assertDevelopmentSeedTarget();

        $superAdmin = User::query()->where('email', 'admin@example.test')->first();
        $eventAdmin = User::query()->where('email', 'hmjti@example.test')->first();

        if (! $superAdmin || $superAdmin->account_status !== 'active' || ! $superAdmin->isSuperAdmin()
            || ! $eventAdmin || $eventAdmin->account_status !== 'active' || ! $eventAdmin->hasActiveRole('event_admin')) {
            throw new RuntimeException('Run DevelopmentEventAdminSeeder first. Required Super Admin or Event Admin is missing.');
        }

        $this->assertPosterSourcesExist();

        foreach (self::EVENTS as $data) {
            $organization = Organization::query()->where('slug', $data['organization_slug'])->where('is_active', true)->first();
            $expectedCategory = $data['domain'] === 'academic' ? 'academic' : 'non-academic';
            $eventType = EventType::query()
                ->where('slug', $data['event_type_slug'])
                ->where('is_active', true)
                ->whereHas('category', fn ($query) => $query->where('slug', $expectedCategory))
                ->first();
            $creator = User::query()->where('email', $data['creator_email'])->first();

            if (! $organization || ! $eventType || ! $creator || $creator->account_status !== 'active'
                || ! $creator->managesOrganization((int) $organization->id)) {
                throw new RuntimeException("Missing active organization, active event type, or authorized active creator for event '{$data['slug']}'.");
            }

            $description = $data['short_description']."\n\n".$data['description'];
            if ($data['source_registration_period']) {
                $description .= "\n\nPeriode pendaftaran (data sumber): ".$data['source_registration_period'];
            }

            $attributes = [
                'organization_id' => $organization->id,
                'event_type_id' => $eventType->id,
                'created_by' => $creator->id,
                'updated_by' => null,
                'title' => $data['title'],
                'description' => $description,
                'objectives' => null,
                'topics' => null,
                'participant_requirements' => $data['requirements'] ? implode("\n", $data['requirements']) : null,
                'start_at' => Carbon::parse($data['start_at'])->utc(),
                'end_at' => Carbon::parse($data['end_at'])->utc(),
                'location_mode' => $data['location_mode'],
                'venue_name' => $data['venue_name'],
                'venue_address' => $data['venue_address'] ?? null,
                'meeting_url_encrypted' => $data['meeting_url'],
                'capacity' => $data['capacity'],
                'registration_opens_at' => $data['registration_opens_at'] ? Carbon::parse($data['registration_opens_at'])->utc() : null,
                'registration_closes_at' => $data['registration_closes_at'] ? Carbon::parse($data['registration_closes_at'])->utc() : null,
                'external_registration_url' => $data['external_registration_url'],
                'contact_name' => $data['contact_name'],
                'contact_email' => null,
                'contact_phone' => null,
                // All imported events stay private drafts until a human reviews them.
                'publication_status' => 'draft',
                'published_at' => null,
            ];

            $event = Event::withTrashed()->where('slug', $data['slug'])->first();
            if ($event?->trashed()) {
                throw new RuntimeException("Event slug '{$data['slug']}' belongs to a soft-deleted event. It was not recreated. Review the archived record manually.");
            }

            if ($event) {
                if ($event->publication_status !== 'draft' || $event->cancelled_at !== null) {
                    throw new RuntimeException("Event slug '{$data['slug']}' already exists but is not an active draft. It was not changed. Review the existing record manually.");
                }

                if ($event->title !== $data['title']
                    || (int) $event->organization_id !== (int) $organization->id
                    || (int) $event->event_type_id !== (int) $eventType->id) {
                    throw new RuntimeException("Event slug '{$data['slug']}' already exists with different identifying data. It was not modified.");
                }
            } else {
                $event = Event::query()->create($attributes + ['slug' => $data['slug']]);
            }

            if ($data['poster']) {
                $this->ensurePoster($event, $data['poster'], $data['title']);
            }
        }
    }

    private function assertPosterSourcesExist(): void
    {
        foreach (self::EVENTS as $data) {
            if (! $data['poster']) {
                continue;
            }

            $source = database_path('seed-assets/posters/'.$data['poster']);
            if (! is_file($source)) {
                throw new RuntimeException("Missing seed poster '{$source}'. Copy the package poster assets before running this seeder.");
            }
        }
    }

    private function ensurePoster(Event $event, string $filename, string $altText): void
    {
        $source = database_path('seed-assets/posters/'.$filename);
        $relativePath = 'event-posters/'.$event->slug.'/'.$filename;
        $disk = Storage::disk('public');

        if (! $disk->exists($relativePath)) {
            $contents = file_get_contents($source);
            if ($contents === false || ! $disk->put($relativePath, $contents)) {
                throw new RuntimeException("Unable to copy poster '{$filename}' to the public storage disk.");
            }
        }

        $existing = EventMedia::query()
            ->where('event_id', $event->id)
            ->where('media_kind', 'poster')
            ->first();

        if ($existing) {
            if ($existing->file_path !== $relativePath || $existing->storage_disk !== 'public') {
                throw new RuntimeException("Event '{$event->slug}' already has a different poster record. It was not replaced.");
            }

            return;
        }

        $mimeType = mime_content_type($source) ?: 'image/jpeg';
        EventMedia::query()->create([
            'event_id' => $event->id,
            'media_kind' => 'poster',
            'storage_disk' => 'public',
            'file_path' => $relativePath,
            'alt_text' => mb_substr($altText, 0, 220),
            'mime_type' => $mimeType,
            'file_size_bytes' => filesize($source),
            'sort_order' => 0,
        ]);
    }
}
