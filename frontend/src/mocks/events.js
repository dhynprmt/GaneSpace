export const MOCK_CATEGORIES = [
  { id: "c1", name: "Seminar Proposal", slug: "seminar-proposal", domain: "academic" },
  { id: "c2", name: "Seminar & Sharing", slug: "seminar-sharing", domain: "academic" },
  { id: "c3", name: "Workshop & Bootcamp", slug: "workshop-bootcamp", domain: "academic" },
  { id: "c4", name: "Sosial & Ormawa", slug: "sosial-ormawa", domain: "non_academic" },
  { id: "c5", name: "Minat & Lifestyle", slug: "minat-lifestyle", domain: "non_academic" },
  { id: "c6", name: "Kepanitiaan & UKM", slug: "kepanitiaan-ukm", domain: "non_academic" },
  { id: "c7", name: "Festival & Hiburan", slug: "festival-hiburan", domain: "non_academic" },
];

export const MOCK_EVENTS = [
  // === ACADEMIC ===
  {
    id: "evt-sharing-2026",
    slug: "sharing-session-ai-and-self-improvement-2026",
    title: "Sharing Session: AI and Self Improvement as Twin Engines Driving Future Achievers",
    short_description:
      "Diskusi inspiratif bersama Apsarendra Putra & Wahyu Ivan mengenai AI dan pengembangan diri mahasiswa.",
    description:
      "Sharing Session terbuka untuk umum yang diselenggarakan oleh HMJ Teknik Informatika Undiksha dengan pemateri Apsarendra Putra dan Wahyu Ivan, dipandu moderator Dhyana Gayatri. Benefit: Poin SKP mahasiswa FTK, networking, pengetahuan & inspirasi, serta E-sertifikat (Gratis).",
    translations: {
      en: {
        title: "Sharing Session: AI and Self Improvement as Twin Engines Driving Future Achievers",
        short_description:
          "Inspiring session with Apsarendra Putra & Wahyu Ivan on leveraging AI and personal growth.",
        description:
          "Open sharing session hosted by HMJ TI Undiksha featuring speakers Apsarendra Putra and Wahyu Ivan, moderated by Dhyana Gayatri. Free admission with FTK SKP points, networking, and e-certificate.",
      },
    },
    domain: "academic",
    category: "Seminar & Sharing",
    category_slug: "seminar-sharing",
    event_type: "Sharing Session",
    organizer: "HMJ Teknik Informatika",
    start_datetime: "2026-10-11T07:30:00+08:00",
    end_datetime: "2026-10-11T12:00:00+08:00",
    registration_period: "Terbuka (Slot Terbatas)",
    location: "GSU Balingkang Undiksha",
    capacity: 200,
    active_registrations: 142,
    status: "open",
    poster_url: "/assets/posters/sharing-session.jpeg",
    contact_person: "Wartika Putra (0831152071174) / Bella Satri (082247682399)",
    requirements: ["Terbuka untuk umum (Gratis)", "Poin SKP khusus mahasiswa FTK"],
    is_featured: true,
  },
  {
    id: "evt-it-bootcamp-2026",
    slug: "it-bootcamp-2026-connect-commit-create",
    title: "IT Bootcamp 2026: Connect, Commit, Create — Empowering Ideas Through Technology",
    short_description:
      "Bootcamp offline 3 hari: Git & GitHub, Web Dev + AI Coding, hingga Code Review & Intro Cloud/Docker.",
    description:
      "Pelatihan intensif bersama Ngurah Manik Mahardika, S.Kom (Software Engineer at One Step Solution Bali) selama 3 hari sesi praktik langsung: Hari 1 Git & GitHub Foundations (17 Okt), Hari 2 Web Dev & AI Integration (18 Okt), Hari 3 Showcase, Code Review & Cloud/Docker (24 Okt).",
    translations: {
      en: {
        title: "IT Bootcamp 2026: Connect, Commit, Create — Empowering Ideas Through Technology",
        short_description:
          "3-day hands-on bootcamp covering Git & GitHub, Web Dev + AI Coding, and Cloud/Docker basics.",
        description:
          "Free offline bootcamp led by Ngurah Manik Mahardika, S.Kom across three practical sessions: Git & GitHub Foundations, Web Development & AI Integration, and Project Showcase with Cloud/Docker introduction.",
      },
    },
    domain: "academic",
    category: "Workshop & Bootcamp",
    category_slug: "workshop-bootcamp",
    event_type: "Bootcamp",
    organizer: "HMJ Teknik Informatika",
    start_datetime: "2026-10-17T09:00:00+08:00",
    end_datetime: "2026-10-24T16:00:00+08:00",
    registration_period: "14 September – 10 Oktober 2026",
    location: "Lab Komputer Prodi SI (Hybrid) FTK C, Lt. 2",
    capacity: 60,
    active_registrations: 48,
    status: "open",
    poster_url: "/assets/posters/it-bootcamp.jpeg",
    contact_person: "Nanda (+62 823-5941-0028) / Widia (+62 813-4453-8985)",
    requirements: ["Gratis & terbuka untuk umum", "Membawa laptop pribadi"],
    is_featured: true,
  },
  {
    id: "evt-seminar-qos-2026",
    slug: "seminar-teknologi-qos-monitoring-living-lab",
    title: "Seminar Teknologi: Pengembangan Sistem QoS Monitoring pada Jaringan Multi Hop di Living Lab",
    short_description:
      "Perancangan, pengukuran QoS, dan klasifikasi kualitas link pada jaringan ESP32 Multi-Hop.",
    description:
      "Seminar teknologi ramah pemula bersama I Made Kristian Adinata yang membahas dasar jaringan komputer, konsep IoT, serta pengukuran Quality of Service (QoS) pada jaringan ESP32 Multi-Hop tanpa memerlukan pengalaman pemrograman tingkat lanjut.",
    translations: {
      en: {
        title: "Tech Seminar: QoS Monitoring System on Multi-Hop Networks at Living Lab",
        short_description:
          "Beginner-friendly session on QoS measurement and link quality classification using ESP32 Multi-Hop.",
        description:
          "Technology seminar presented by I Made Kristian Adinata introducing computer networking fundamentals, IoT concepts, and real-time QoS monitoring at Living Lab Undiksha.",
      },
    },
    domain: "academic",
    category: "Seminar & Sharing",
    category_slug: "seminar-sharing",
    event_type: "Seminar",
    organizer: "Living Lab Undiksha & Griya Academy",
    start_datetime: "2026-11-20T09:00:00+08:00",
    end_datetime: "2026-11-20T11:00:00+08:00",
    registration_period: "Terbuka hingga hari pelaksanaan",
    location: "Living Lab Undiksha",
    capacity: 80,
    active_registrations: 54,
    status: "open",
    poster_url: "/assets/posters/seminar-qos.jpeg",
    contact_person: "Nata (082266243660)",
    requirements: ["Materi ramah untuk pemula", "Tidak memerlukan pengalaman pemrograman lanjut"],
    is_featured: true,
  },
  {
    id: "evt-bootcamp-pkm-2026",
    slug: "bootcamp-pkm-p2mw-sc-ftk-2026",
    title: "Bootcamp PKM & P2MW SC FTK 2026",
    short_description:
      "Pendampingan penyusunan proposal PKM & P2MW beserta review draf langsung oleh narasumber.",
    description:
      "Program Kreativitas Mahasiswa & Program Pembinaan Mahasiswa Wirausaha SC FTK 2026. Gratis dengan fasilitas review draf proposal langsung, E-sertifikat, konsumsi, poin SKP, serta penghargaan Best Proposal untuk 10 tim PKM terbaik dan 5 tim P2MW terbaik.",
    translations: {
      en: {
        title: "PKM & P2MW SC FTK Bootcamp 2026",
        short_description:
          "Proposal drafting and live review bootcamp for Student Creativity (PKM) and Entrepreneurship (P2MW) programs.",
        description:
          "Free proposal bootcamp at Gedung Balingkang featuring direct mentor review, e-certificate, SKP points, and Best Proposal awards.",
      },
    },
    domain: "academic",
    category: "Workshop & Bootcamp",
    category_slug: "workshop-bootcamp",
    event_type: "Bootcamp",
    organizer: "Student Center FTK Undiksha",
    start_datetime: "2026-12-06T08:30:00+08:00",
    end_datetime: "2026-12-06T15:00:00+08:00",
    registration_period: "20 November – 3 Desember 2026",
    location: "Gedung Balingkang",
    capacity: 150,
    active_registrations: 91,
    status: "open",
    poster_url: "/assets/posters/bootcamp-pkm.jpeg",
    contact_person: "Gungade (+62 821-4559-0458) / Ila (+62 813-3476-5609)",
    requirements: ["Pendaftaran gratis", "Mengumpulkan draf proposal 20 Nov – 3 Des 2026"],
    is_featured: false,
  },
  {
    id: "evt-sempro-indobert",
    slug: "sempro-nlp-automated-grading-indobert",
    title: "Seminar Proposal: Automated Short-Answer Grading Berbasis IndoBERT",
    short_description:
      "Sesi Seminar Proposal terbuka Prodi Ilmu Komputer — memenuhi target kehadiran 10 seminar.",
    description:
      "Pemaparan proposal penelitian mengenai pemanfaatan model bahasa Indonesia untuk evaluasi jawaban singkat otomatis pada sistem pembelajaran kampus.",
    translations: {
      en: {
        title: "Proposal Seminar: Automated Short-Answer Grading Using IndoBERT",
        short_description:
          "Open Computer Science proposal seminar eligible for the 10-seminar student attendance requirement.",
        description:
          "Undergraduate thesis proposal presentation exploring Indonesian language models for automated short-answer assessment.",
      },
    },
    domain: "academic",
    category: "Seminar Proposal",
    category_slug: "seminar-proposal",
    event_type: "Sempro",
    organizer: "Prodi Ilmu Komputer",
    student_presenter: "I Made Pratama Putra",
    study_program: "Ilmu Komputer",
    faculty: "Fakultas Teknik dan Kejuruan",
    supervisors: ["Pembimbing I (Simulasi)", "Pembimbing II (Simulasi)"],
    room: "Ruang Seminar FTK 204",
    start_datetime: "2026-11-27T09:30:00+08:00",
    end_datetime: "2026-11-27T11:30:00+08:00",
    registration_period: "20 Nov – 26 Nov 2026",
    location: "Kampus Jinengdalem, Gedung FTK",
    capacity: 40,
    active_registrations: 28,
    status: "open",
    is_sempro: true,
    is_featured: false,
  },

  // === NON-ACADEMIC ===
  {
    id: "evt-open-donation-2026",
    slug: "open-donation-for-action-hmj-ti-2026",
    title: "Open Donation for ACTION: Bersama Bergerak, Bersama Berdampak",
    short_description:
      "Aksi penggalangan donasi sembako, dana, alat tulis, dan pakaian layak pakai untuk Panti Asuhan Destawan.",
    description:
      "Kegiatan sosial HMJ TI Undiksha periode donasi 28 September – 5 November 2026 (pengumpulan di Sekretariat HMJ TI pukul 14.00–18.00 WITA). Penyaluran dilaksanakan Minggu, 8 November 2026 di Panti Asuhan Destawan, Dusun Kanginan, Desa Sawan, Buleleng.",
    translations: {
      en: {
        title: "Open Donation for ACTION: Moving Together, Creating Impact",
        short_description:
          "Charity drive collecting groceries, funds, stationery, and wearable clothes for Destawan Orphanage.",
        description:
          "Social impact campaign by HMJ TI Undiksha accepting donations from Sep 28 to Nov 5, 2026, with distribution on Sunday, Nov 8, 2026 at Destawan Orphanage, Sawan, Buleleng.",
      },
    },
    domain: "non_academic",
    category: "Sosial & Ormawa",
    category_slug: "sosial-ormawa",
    event_type: "Sosial",
    organizer: "HMJ Teknik Informatika",
    start_datetime: "2026-11-08T09:00:00+08:00",
    end_datetime: "2026-11-08T15:00:00+08:00",
    location: "Panti Asuhan Destawan, Sawan, Buleleng",
    status: "open",
    poster_url: "/assets/posters/open-donation.jpeg",
    external_registration_url: "https://wa.me/6287855714555",
    contact_person: "Ossi (087855714555)",
    is_featured: true,
  },
  {
    id: "evt-beauty-class-omg-2026",
    slug: "beauty-class-with-omg-ftk-2026",
    title: "Beauty Class With OMG: Basic Makeup for Everyday Look",
    short_description:
      "Kelas makeup interaktif terbuka untuk umum dengan free produk, voucher belanja OMG 90k, dan SKP FTK.",
    description:
      "Beauty Class kolaborasi bersama OMG & Yeppa di Gedung FTK Undiksha. HTM 100K sudah termasuk free produk, voucher belanja OMG 90K, dessert, e-sertifikat, makeup experience, dan poin SKP khusus mahasiswa FTK.",
    translations: {
      en: {
        title: "Beauty Class With OMG: Basic Makeup for Everyday Look",
        short_description:
          "Interactive everyday makeup class including free products, 90K shopping voucher, dessert, and FTK SKP.",
        description:
          "Open beauty workshop held at FTK Undiksha Building (HTM 100K) featuring hands-on makeup practice, free products, e-certificate, and SKP points for FTK students.",
      },
    },
    domain: "non_academic",
    category: "Minat & Lifestyle",
    category_slug: "minat-lifestyle",
    event_type: "Beauty Class",
    organizer: "FTK Undiksha x OMG",
    start_datetime: "2026-10-17T10:00:00+08:00",
    end_datetime: "2026-10-17T14:00:00+08:00",
    location: "Gedung FTK Undiksha",
    status: "open",
    poster_url: "/assets/posters/beauty-class.jpeg",
    external_registration_url: "https://wa.me/6289606091700",
    contact_person: "Pramita (0896-0609-1700) / Angel (0815-4729-4973)",
    is_featured: false,
  },
  {
    id: "evt-oprec-dies-natalis-34",
    slug: "open-recruitment-panitia-dies-natalis-xxxiv",
    title: "Open Recruitment Panitia Dies Natalis XXXIV #3e4mazing",
    short_description:
      "Rekrutmen panitia pelaksana Dies Natalis XXXIV Undiksha untuk 10 pilihan bidang kepanitiaan.",
    description:
      "Kesempatan bergabung dalam kepanitiaan Dies Natalis XXXIV Undiksha (Sie Acara, Expo & Lomba, Humas & Guest Star, Logistik, Kesekretariatan, Design Creative & System, Konsumsi, Kerohanian, Penggalian Dana, Keamanan). Pendaftaran 29 Sep – 5 Okt 2026, wawancara 9 & 10 Okt 2026.",
    translations: {
      en: {
        title: "Committee Open Recruitment: Dies Natalis XXXIV #3e4mazing",
        short_description:
          "Join the organizing committee of Undiksha's 34th Dies Natalis across 10 specialized divisions.",
        description:
          "Registration open Sep 29 – Oct 5, 2026 with interviews on Oct 9–10, 2026 across 10 committee divisions.",
      },
    },
    domain: "non_academic",
    category: "Kepanitiaan & UKM",
    category_slug: "kepanitiaan-ukm",
    event_type: "Open Recruitment",
    organizer: "Panitia Dies Natalis XXXIV Undiksha",
    start_datetime: "2026-10-09T09:00:00+08:00",
    end_datetime: "2026-10-10T17:00:00+08:00",
    location: "Universitas Pendidikan Ganesha",
    status: "open",
    poster_url: "/assets/posters/oprec-dies-natalis.jpeg",
    external_registration_url:
      "https://go.undiksha.ac.id/OPEN-RECRUITMENT-PANITIA-PELAKSANA-DIES-NATALIS-XXXIV-UNDIKSHA",
    contact_person: "Pristine Holy (081939466104) / Krisna Devi (082340191143)",
    is_featured: false,
  },
  {
    id: "evt-i-love-monday-2026",
    slug: "i-love-monday-open-house-dan-musik-kampus",
    title: "I Love Monday: Open House Robotik & Pentas Komunitas Musik",
    short_description:
      "Kolaborasi Open House Robotik, Solo Vocal POKJA, Komunitas Musik TI, dan Tek-in Music Community.",
    description:
      "Acara sore santai mahasiswa FTK yang menampilkan Open House Robotik serta penampilan langsung dari Solo Vocal POKJA, Komunitas Musik TI, dan Tek-in Music Community di Parkiran Gedung Mesin Undiksha.",
    translations: {
      en: {
        title: "I Love Monday: Robotics Open House & Campus Music Showcase",
        short_description:
          "Afternoon showcase featuring Robotics Open House, POKJA Solo Vocal, TI Music Community, and Tek-in Music.",
        description:
          "Campus community gathering at Mechanical Engineering Parking Area, Undiksha starting 16:30 WITA.",
      },
    },
    domain: "non_academic",
    category: "Festival & Hiburan",
    category_slug: "festival-hiburan",
    event_type: "Hiburan",
    organizer: "Komunitas FTK & TI Undiksha",
    start_datetime: "2026-09-07T16:30:00+08:00",
    end_datetime: "2026-09-07T21:00:00+08:00",
    location: "Parkiran Gedung Mesin, Undiksha",
    status: "open",
    poster_url: "/assets/posters/i-love-monday.jpeg",
    external_registration_url: "#detail-acara",
    contact_person: "Komunitas Musik TI & Robotik",
    is_featured: false,
  },
];