<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DevelopmentOrganizationSeeder extends Seeder
{
    use DevelopmentSeedGuard;

    public function run(): void
    {
        $this->assertDevelopmentSeedTarget();

        $faculty = Faculty::query()->where('code', 'FAC-TEST')->first();
        if (! $faculty || ! $faculty->is_active) {
            throw new RuntimeException('Expected existing active faculty FAC-TEST was not found. No faculty or study program will be invented.');
        }

        $now = now('UTC');
        $organizations = [
            [
                'slug' => 'hmj-teknik-informatika',
                'name' => 'HMJ Teknik Informatika',
                'organization_type' => 'Himpunan Mahasiswa',
                'faculty_id' => $faculty->id,
            ],
            [
                'slug' => 'fakultas-teknik-dan-kejuruan',
                'name' => 'Fakultas Teknik dan Kejuruan',
                'organization_type' => 'Unit Fakultas',
                'faculty_id' => $faculty->id,
            ],
            [
                'slug' => 'bem-rema-undiksha',
                'name' => 'BEM REMA Undiksha',
                'organization_type' => 'Organisasi Mahasiswa',
                'faculty_id' => null,
            ],
            [
                'slug' => 'ukm-penalaran-riset-mahasiswa',
                'name' => 'UKM Penalaran & Riset Mahasiswa',
                'organization_type' => 'UKM',
                'faculty_id' => null,
            ],
        ];

        DB::transaction(function () use ($organizations, $now): void {
            foreach ($organizations as $data) {
                $organization = Organization::query()->where('slug', $data['slug'])->first();

                if ($organization) {
                    $matches = $organization->name === $data['name']
                        && $organization->organization_type === $data['organization_type']
                        && $organization->parent_id === null
                        && (bool) $organization->is_active === true
                        && (int) ($organization->faculty_id ?? 0) === (int) ($data['faculty_id'] ?? 0);

                    if (! $matches) {
                        throw new RuntimeException("Organization slug '{$data['slug']}' already exists with different data. It was not modified.");
                    }

                    continue;
                }

                Organization::query()->create($data + [
                    'parent_id' => null,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }
}
