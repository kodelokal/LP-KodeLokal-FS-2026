import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  siteSettings,
  services,
  portfolios,
  teamMembers,
  testimonials,
  faqs,
  clientProjects,
  projectMilestones,
  inquiries,
} from "./schema";

async function seed() {
  console.log("Seeding KodeLokal Neon PostgreSQL database...");

  // 1. Seed initial internal users (CEO + CTO)
  const ceoPasswordHash = await bcrypt.hash("KodeLokal2026!", 12);
  const ctoPasswordHash = await bcrypt.hash("KodeLokal2026!", 12);

  await db
    .insert(users)
    .values([
      {
        name: "Founder KodeLokal",
        email: "ceo@kodelokal.store",
        passwordHash: ceoPasswordHash,
        role: "CEO",
        title: "Chief Executive Officer",
        isActive: true,
      },
      {
        name: "Lead Architect KodeLokal",
        email: "cto@kodelokal.store",
        passwordHash: ctoPasswordHash,
        role: "CTO",
        title: "Chief Technology Officer",
        isActive: true,
      },
    ])
    .onConflictDoNothing({ target: users.email });

  const [ceoUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "ceo@kodelokal.store"))
    .limit(1);

  // 2. Seed Site Settings (singleton id=1)
  await db
    .insert(siteSettings)
    .values({
      id: 1,
      brandName: "KodeLokal",
      tagline: "Mitra Digital Anda",
      heroTitle: "Bikin website & aplikasi nggak pake ribet, biar mimin yang beresin.",
      heroSubtitle:
        "Dari landing page buat naikin jualan, toko online UMKM, sampai aplikasi web custom — tim KodeLokal siap bantu dari nol sampai live. Kamu tinggal pantau progresnya santai, mimin yang ngoding!",
      heroCtaPrimary: "Ngobrol Sama Mimin",
      heroCtaSecondary: "Kepoin Portofolio",
      aboutTitle: "Satu Squad Solid buat Solusi Digital Kamu",
      aboutDescription:
        "Kami bikin website dan aplikasi yang tampilannya kece, kodenya rapi, dan progresnya transparan — biar kamu bisa fokus gedein bisnis tanpa pusing urusan teknis.",
      whatsappNumber: "6281234567890",
      contactEmail: "halo@kodelokal.store",
      officeAddress: "Indonesia — Remote-First Digital Studio",
      socialLinks: {
        instagram: "https://instagram.com/kodelokal.store",
        github: "https://github.com/kodelokal",
        linkedin: "https://linkedin.com/company/kodelokal",
      },
      stats: [
        { label: "Project udah live", value: "25+" },
        { label: "Klien & partner hepi", value: "18+" },
        { label: "Puas & repeat order", value: "99%" },
        { label: "Progres transparan", value: "100%" },
      ],
    })
    .onConflictDoNothing({ target: siteSettings.id });

  // 3. Seed Services
  const serviceRows = [
    {
      slug: "landing-page-konversi",
      title: "Landing Page & Company Profile",
      shortDescription:
        "Website cepat, responsif, SEO-ready, dan dirancang khusus untuk meningkatkan kepercayaan serta konversi calon pelanggan bisnis Anda.",
      features: [
        "Desain custom sesuai identitas brand",
        "Optimasi SEO & Core Web Vitals",
        "Integrasi WhatsApp, Formulir Lead & CMS",
        "Support Dark Mode & Animasi Modern",
      ],
      startingPrice: "Mulai Rp 2,5 Jt",
      iconName: "Rocket",
      accentColor: "orange",
      sortOrder: 1,
      isPublished: true,
    },
    {
      slug: "web-application-custom",
      title: "Aplikasi Web & SaaS Custom",
      shortDescription:
        "Pengembangan aplikasi web full-stack menggunakan Next.js dan PostgreSQL untuk otomasi proses bisnis, dashboard operasional, dan produk SaaS.",
      features: [
        "Arsitektur Full-Stack Next.js & PostgreSQL",
        "Manajemen Role & Hak Akses (RBAC)",
        "API Terdokumentasi & Integrasi Payment",
        "Deploy Cloud Serverless Siap Skala Besar",
      ],
      startingPrice: "Mulai Rp 7,5 Jt",
      iconName: "Code2",
      accentColor: "blue",
      sortOrder: 2,
      isPublished: true,
    },
    {
      slug: "sistem-informasi-cms",
      title: "Sistem Informasi & CMS Internal",
      shortDescription:
        "Kelola konten, inventaris, transaksi, atau data pelanggan secara mandiri lewat panel admin yang intuitif dan aman.",
      features: [
        "Dashboard Admin Intuitif & Responsif",
        "Laporan Real-Time & Export Data",
        "Pelacakan Status Pesanan / Project",
        "Pelatihan Tim & Dokumentasi Lengkap",
      ],
      startingPrice: "Mulai Rp 5 Jt",
      iconName: "Layers",
      accentColor: "blue",
      sortOrder: 3,
      isPublished: true,
    },
    {
      slug: "uiux-maintenance-retainer",
      title: "UI/UX Redesign & Maintenance",
      shortDescription:
        "Peremajaan tampilan antarmuka website lama agar lebih segar sekaligus perawatan berkala demi menjaga performa dan keamanan.",
      features: [
        "Audit UX & Desain Ulang Responsif",
        "Optimasi Kecepatan & Refactor Kode",
        "Backup Rutin & Monitoring Uptime",
        "Dukungan Teknis Prioritas",
      ],
      startingPrice: "Mulai Rp 1,5 Jt/bln",
      iconName: "Sparkles",
      accentColor: "orange",
      sortOrder: 4,
      isPublished: true,
    },
  ];

  for (const s of serviceRows) {
    await db.insert(services).values(s).onConflictDoNothing({ target: services.slug });
  }

  // 4. Seed Portfolios
  const portfolioRows = [
    {
      slug: "kriya-marketplace-umkm",
      title: "Kriya — E-Commerce & Panel Merchant UMKM",
      clientName: "Kriya Nusantara Collective",
      category: "E-Commerce",
      summary:
        "Platform toko online kerajinan lokal lengkap dengan dashboard manajemen pesanan merchant, katalog terkurasi, dan notifikasi pengiriman otomatis.",
      description:
        "Kriya membutuhkan transformasi dari pemesanan manual via chat menjadi ekosistem e-commerce yang elegan namun mudah dipakai pengrajin lokal. KodeLokal merancang storefront cepat berbasis Next.js beserta panel merchant untuk mengelola stok, status pengiriman, dan analitik penjualan harian.",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Midtrans"],
      imageUrl: "/portfolio/kriya-commerce.jpg",
      liveUrl: "https://kodelokal.store/#portofolio",
      projectYear: 2026,
      featured: true,
      sortOrder: 1,
      isPublished: true,
    },
    {
      slug: "shopflow-pos-inventaris",
      title: "ShopFlow — Cloud POS & Manajemen Inventaris",
      clientName: "PT Ritel Maju Bersama",
      category: "Sistem Informasi",
      summary:
        "Aplikasi manajemen gudang dan kasir multi-cabang dengan peringatan stok menipis, laporan performa mingguan, dan kontrol SKU terpusat.",
      description:
        "Untuk mengurangi selisih stok antar-cabang hingga 0%, kami membangun ShopFlow dengan sinkronisasi database cloud real-time, pelacakan mutasi SKU, dan grafik analitik penjualan mingguan yang langsung dapat dibaca pemilik usaha dari perangkat apa pun.",
      techStack: ["Next.js 16", "Drizzle ORM", "Neon DB", "Tailwind CSS", "Recharts"],
      imageUrl: "/portfolio/shopflow-pos.jpg",
      liveUrl: "https://kodelokal.store/#portofolio",
      projectYear: 2026,
      featured: true,
      sortOrder: 2,
      isPublished: true,
    },
    {
      slug: "nexaflow-corporate-logistics",
      title: "NexaFlow — Portal Korporat Logistik & Fintech",
      clientName: "NexaFlow Global Logistics",
      category: "Landing Page",
      summary:
        "Website company profile berstandar korporasi dengan arsitektur informasi tajam, pemuatan super cepat, dan integrasi permintaan demo B2B.",
      description:
        "NexaFlow memerlukan wajah digital baru untuk meyakinkan mitra logistik enterprise. Kami menyusun struktur konten editorial yang rapi, hierarki tipografi tegas, dan alur konversi permintaan demo yang meningkatkan prospek B2B hingga 2,4x.",
      techStack: ["Next.js", "Framer Motion", "Tailwind CSS", "Vercel Edge"],
      imageUrl: "/portfolio/nexaflow-corp.jpg",
      liveUrl: "https://kodelokal.store/#portofolio",
      projectYear: 2025,
      featured: true,
      sortOrder: 3,
      isPublished: true,
    },
    {
      slug: "learnhub-edutech-lms",
      title: "LearnHub — Platform Kursus Online & Pelacakan Belajar",
      clientName: "Akademi Digital Indonesia",
      category: "Web App",
      summary:
        "Learning Management System interaktif dengan progres modul real-time, katalog kelas terstruktur, kuis otomatis, dan sertifikat digital.",
      description:
        "LearnHub dibangun agar siswa menikmati pengalaman belajar yang ringan dan fokus. Dilengkapi dashboard progres per modul, timeline aktivitas terbaru, serta panel instruktur untuk mengelola kurikulum tanpa bantuan tim teknis.",
      techStack: ["Next.js", "PostgreSQL", "TypeScript", "Tailwind CSS", "Cloudflare R2"],
      imageUrl: "/portfolio/learnhub-lms.jpg",
      liveUrl: "https://kodelokal.store/#portofolio",
      projectYear: 2026,
      featured: true,
      sortOrder: 4,
      isPublished: true,
    },
  ];

  for (const p of portfolioRows) {
    await db.insert(portfolios).values(p).onConflictDoNothing({ target: portfolios.slug });
  }

  // 5. Seed Team Structure (Struktur Tim Pengembang) - only if empty
  const existingTeam = await db.select().from(teamMembers).limit(1);
  if (existingTeam.length === 0) {
    const [ceo] = await db
      .insert(teamMembers)
      .values({
        name: "Founder & CEO",
        roleCode: "CEO",
        positionTitle: "Chief Executive Officer",
        department: "Executive",
        bio: "Menentukan visi produk, strategi kemitraan klien, dan standar kualitas layanan digital KodeLokal.",
        skills: ["Product Strategy", "Business Development", "Client Partnership"],
        isOpenPosition: false,
        sortOrder: 1,
        isVisible: true,
      })
      .returning();

    const [cto] = await db
      .insert(teamMembers)
      .values({
        name: "Co-Founder & CTO",
        roleCode: "CTO",
        positionTitle: "Chief Technology Officer",
        department: "Engineering",
        parentId: ceo.id,
        bio: "Memimpin arsitektur sistem, standar engineering Next.js & PostgreSQL, keamanan aplikasi, serta skalabilitas infrastruktur.",
        skills: ["System Architecture", "Next.js", "PostgreSQL", "Cloud Security"],
        isOpenPosition: false,
        sortOrder: 2,
        isVisible: true,
      })
      .returning();

    const [pm] = await db
      .insert(teamMembers)
      .values({
        name: "Project Manager",
        roleCode: "PM",
        positionTitle: "Technical Project Manager",
        department: "Product & PM",
        parentId: ceo.id,
        bio: "Mengawal timeline sprint, komunikasi milestone klien, dan memastikan setiap deliverable selesai tepat waktu.",
        skills: ["Agile Delivery", "Sprint Planning", "Client Communication"],
        isOpenPosition: true,
        sortOrder: 3,
        isVisible: true,
      })
      .returning();

    await db.insert(teamMembers).values([
      {
        name: "Lead Full-Stack Engineer",
        roleCode: "WORKER",
        positionTitle: "Full-Stack Developer",
        department: "Engineering",
        parentId: cto.id,
        bio: "Mengembangkan antarmuka modern, integrasi API, dan fitur inti aplikasi klien dengan performa tinggi.",
        skills: ["TypeScript", "React", "Next.js", "Drizzle ORM"],
        isOpenPosition: false,
        sortOrder: 4,
        isVisible: true,
      },
      {
        name: "UI/UX & Frontend Worker",
        roleCode: "WORKER",
        positionTitle: "UI/UX & Frontend Specialist",
        department: "Engineering",
        parentId: cto.id,
        bio: "Slot tim pengembang kolaboratif untuk desain antarmuka, micro-interaction, dan implementasi responsif.",
        skills: ["Figma", "Tailwind CSS", "Framer Motion", "Design Systems"],
        isOpenPosition: true,
        sortOrder: 5,
        isVisible: true,
      },
      {
        name: "Growth & Marketing Lead",
        roleCode: "MARKETING",
        positionTitle: "Digital Marketing & Growth",
        department: "Growth & Marketing",
        parentId: ceo.id,
        bio: "Mengelola kampanye akuisisi klien, konten media sosial, SEO, serta manajemen konten landing page.",
        skills: ["SEO", "Content Strategy", "Performance Ads", "Brand Growth"],
        isOpenPosition: true,
        sortOrder: 6,
        isVisible: true,
      },
      {
        name: "Operations & Admin",
        roleCode: "ADMIN",
        positionTitle: "Admin & Client Operations",
        department: "Operations",
        parentId: pm.id,
        bio: "Mendukung administrasi kontrak, penagihan, onboarding klien, dan pembaruan konten operasional.",
        skills: ["Client Onboarding", "CMS Operations", "Finance Admin"],
        isOpenPosition: true,
        sortOrder: 7,
        isVisible: true,
      },
    ]);
  }

  // 6. Seed Testimonials (if empty)
  const existingTestimonials = await db.select().from(testimonials).limit(1);
  if (existingTestimonials.length === 0) {
    await db.insert(testimonials).values([
      {
        clientName: "Dewi Lestari",
        clientRole: "Founder",
        companyName: "Kriya Nusantara",
        quote:
          "Komunikasi tim KodeLokal super jelas. Fitur lacak progress project bikin kami selalu tenang karena tahu persis apa yang sedang dikerjakan tiap minggu.",
        rating: 5,
        isPublished: true,
        sortOrder: 1,
      },
      {
        clientName: "Budi Santoso",
        clientRole: "Direktur Operasional",
        companyName: "PT Ritel Maju Bersama",
        quote:
          "Sistem inventaris yang dibuat benar-benar memangkas waktu rekap stok harian kami. Tampilannya bersih, cepat, dan karyawan toko langsung paham cara pakainya.",
        rating: 5,
        isPublished: true,
        sortOrder: 2,
      },
      {
        clientName: "Raka Pratama",
        clientRole: "Head of Growth",
        companyName: "Akademi Digital Indonesia",
        quote:
          "Desainnya terasa premium dan tidak kaku. Setelah migrasi ke website baru buatan KodeLokal, rasio pendaftar kelas dari mobile naik signifikan.",
        rating: 5,
        isPublished: true,
        sortOrder: 3,
      },
    ]);
  }

  // 7. Seed FAQs (if empty)
  const existingFaqs = await db.select().from(faqs).limit(1);
  if (existingFaqs.length === 0) {
    await db.insert(faqs).values([
      {
        question: "Berapa lama estimasi pengerjaan website di KodeLokal?",
        answer:
          "Untuk Landing Page & Company Profile umumnya memakan waktu 7–14 hari kerja. Sedangkan Aplikasi Web custom, E-Commerce, atau Sistem Informasi berkisar 3–8 minggu tergantung kompleksitas fitur dan integrasi.",
        sortOrder: 1,
        isPublished: true,
      },
      {
        question: "Bagaimana saya memantau perkembangan project yang sedang berjalan?",
        answer:
          "Setiap klien mendapatkan Kode Tracking unik (misalnya KL-2026-001) yang dapat dimasukkan kapan saja di halaman Lacak Project (/track) untuk melihat persentase progress, tahapan milestone, dan link preview staging secara real-time.",
        sortOrder: 2,
        isPublished: true,
      },
      {
        question: "Apakah saya bisa mengubah konten teks atau portofolio website sendiri nanti?",
        answer:
          "Tentu! Website yang kami bangun dilengkapi CMS Admin yang ramah pengguna sehingga tim Anda bisa memperbarui teks, gambar, layanan, hingga mengelola data tanpa harus menyentuh kode.",
        sortOrder: 3,
        isPublished: true,
      },
      {
        question: "Teknologi apa yang digunakan KodeLokal?",
        answer:
          "Kami menggunakan stack modern berkinerja tinggi seperti Next.js, TypeScript, Tailwind CSS, dan PostgreSQL (Neon/Supabase) yang di-deploy ke infrastruktur cloud global seperti Vercel agar cepat diakses dan aman.",
        sortOrder: 4,
        isPublished: true,
      },
      {
        question: "Apakah tersedia garansi atau dukungan maintenance setelah website live?",
        answer:
          "Ya, setiap project sudah termasuk masa garansi perbaikan bug selama 30 hari setelah serah terima, dan tersedia paket maintenance bulanan bila Anda membutuhkan pembaruan fitur berkelanjutan.",
        sortOrder: 5,
        isPublished: true,
      },
    ]);
  }

  // 8. Seed Sample Client Projects + Milestones for immediate testing of /track & /admin/projects
  const existingProj1 = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.trackingCode, "KL-2026-001"))
    .limit(1);

  if (existingProj1.length === 0) {
    const [proj1] = await db
      .insert(clientProjects)
      .values({
        trackingCode: "KL-2026-001",
        title: "Redesign Website & Portal Katalog Kopi Nusantara",
        clientName: "Andi Wijaya",
        clientEmail: "andi@kopinusantara.id",
        clientCompany: "CV Kopi Nusantara Sejahtera",
        clientPhone: "081299887766",
        serviceCategory: "E-Commerce",
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 65,
        budget: "Rp 12.500.000",
        startDate: "2026-10-15",
        dueDate: "2026-12-05",
        stagingUrl: "https://kodelokal.store",
        notes: "Fokus pada kecepatan mobile checkout dan integrasi katalog grosir B2B.",
        leadPmId: ceoUser?.id ?? null,
        isPublicTracking: true,
      })
      .returning();

    await db.insert(projectMilestones).values([
      {
        projectId: proj1.id,
        title: "Discovery, Wireframe & Arsitektur Database",
        description: "Pemetaan alur belanja ritel & grosir serta struktur katalog produk.",
        status: "DONE",
        dueDate: "2026-10-22",
        sortOrder: 1,
        completedAt: new Date(),
      },
      {
        projectId: proj1.id,
        title: "Desain UI/UX High-Fidelity (Light & Dark)",
        description: "Finalisasi sistem desain dan prototipe interaktif desktop & mobile.",
        status: "DONE",
        dueDate: "2026-11-01",
        sortOrder: 2,
        completedAt: new Date(),
      },
      {
        projectId: proj1.id,
        title: "Pengembangan Frontend, CMS & Keranjang Belanja",
        description: "Implementasi Next.js 16, katalog dinamis, dan panel admin produk.",
        status: "IN_PROGRESS",
        dueDate: "2026-11-24",
        sortOrder: 3,
      },
      {
        projectId: proj1.id,
        title: "QA Testing, Optimasi SEO & Deploy Produksi",
        description: "Pengujian lintas perangkat, domain setup, dan serah terima panduan CMS.",
        status: "TODO",
        dueDate: "2026-12-05",
        sortOrder: 4,
      },
    ]);
  }

  const existingProj2 = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.trackingCode, "KL-2026-002"))
    .limit(1);

  if (existingProj2.length === 0) {
    const [proj2] = await db
      .insert(clientProjects)
      .values({
        trackingCode: "KL-2026-002",
        title: "Company Profile & Booking System Klinik Sehat",
        clientName: "dr. Nadia Putri",
        clientEmail: "nadia@kliniksehat.co.id",
        clientCompany: "Klinik Sehat Sentosa",
        clientPhone: "081355667788",
        serviceCategory: "Web App",
        status: "REVIEW",
        priority: "MEDIUM",
        progress: 90,
        budget: "Rp 8.000.000",
        startDate: "2026-10-01",
        dueDate: "2026-11-28",
        stagingUrl: "https://kodelokal.store",
        notes: "Tahap UAT jadwal dokter dan notifikasi WhatsApp otomatis.",
        leadPmId: ceoUser?.id ?? null,
        isPublicTracking: true,
      })
      .returning();

    await db.insert(projectMilestones).values([
      {
        projectId: proj2.id,
        title: "Riset Alur Pendaftaran Pasien & Desain UI",
        status: "DONE",
        dueDate: "2026-10-12",
        sortOrder: 1,
        completedAt: new Date(),
      },
      {
        projectId: proj2.id,
        title: "Implementasi Jadwal Dokter & Booking Online",
        status: "DONE",
        dueDate: "2026-11-05",
        sortOrder: 2,
        completedAt: new Date(),
      },
      {
        projectId: proj2.id,
        title: "Review Klien (UAT) & Penyesuaian Final",
        status: "REVIEW",
        dueDate: "2026-11-28",
        sortOrder: 3,
      },
    ]);
  }

  // 9. Seed 1 Sample Inquiry (if empty)
  const existingInq = await db.select().from(inquiries).limit(1);
  if (existingInq.length === 0) {
    await db.insert(inquiries).values({
      name: "Dimas Saputra",
      email: "dimas@suryalogistik.id",
      phone: "081234009911",
      company: "PT Surya Logistik Ekspres",
      serviceInterest: "Landing Page & Company Profile",
      budgetRange: "Rp 5 Jt – Rp 10 Jt",
      message:
        "Halo tim KodeLokal, kami berencana membangun ulang landing page perusahaan dan menambahkan form cek tarif pengiriman. Mohon info jadwal diskusi minggu ini.",
      status: "NEW",
    });
  }

  console.log("Seed completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
