import {
  Vehicle,
  RentalVehicle,
  DetailingService,
  Promo,
  LeasingPartner,
  BlogPost,
  FAQ,
  Testimonial,
  Lead,
  Booking
} from './types';

export const INITIAL_BRANCHES = [
  { id: 'br-01', name: 'Auto Veloce Jakarta Selatan', address: 'Jl. Sultan Iskandar Muda No. 10, Pondok Indah, Jakarta Selatan', city: 'Jakarta' },
  { id: 'br-02', name: 'Auto Veloce BSD Tangerang', address: 'Boulevard BSD City, Kav Showroom No. 3, Tangerang', city: 'Tangerang' },
  { id: 'br-03', name: 'Auto Veloce Surabaya Barat', address: 'Jl. Mayjen HR. Muhammad No. 44, Surabaya', city: 'Surabaya' },
  { id: 'br-04', name: 'Auto Veloce Bandung Center', address: 'Jl. Asia Afrika No. 222, Bandung', city: 'Bandung' }
];

export const INITIAL_SALES_AGENTS = [
  { id: 'sa-01', name: 'Adrian Wijaya', title: 'Senior Sales Executive', phone: '+628121111001', branch: 'Jakarta' },
  { id: 'sa-02', name: 'Nadia Siregar', title: 'Luxury Relationship Manager', phone: '+628121111002', branch: 'Jakarta' },
  { id: 'sa-03', name: 'Kevin Pratama', title: 'Leasing Specialist Advisor', phone: '+628121111003', branch: 'Tangerang' },
  { id: 'sa-04', name: 'Melissa Tan', title: 'Client concierge Coordinator', phone: '+628121111004', branch: 'Surabaya' }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v-01',
    name: 'Toyota Alphard 2.5 G AT Executive',
    brand: 'Toyota',
    year: 2022,
    price: 1115000000,
    promoPrice: 1090000000,
    condition: 'Used',
    transmission: 'Automatic',
    fuel: 'Petrol',
    km: 18000,
    badge: 'Certified',
    badges: ['Certified', 'Low KM'],
    installmentFrom: 182000000,
    dpMin: 220000000,
    description: 'Kabin super mewah dengan konfigurasi Captain Seat orisinal kulit asli. Unit simpanan dengan histori pemakaian teratur milik pejabat korporat Jakarta Selatan. Cat bodi mengkilat tanpa baret dan interior beraroma mobil baru.',
    images: [
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    specs: {
      dimensions: '4945 x 1850 x 1895 mm',
      engine: '2494 cc 2AR-FE Dual VVT-i',
      acceleration: '11.3 detik (0-100 km/jam)',
      topSpeed: '180 km/jam'
    },
    warranty: 'Garansi Distributor Resmi Activa 1 Tahun',
    branchName: 'Auto Veloce Jakarta Selatan'
  },
  {
    id: 'v-02',
    name: 'BMW 530i M Sport LCI Premium',
    brand: 'BMW',
    year: 2021,
    price: 1195000000,
    condition: 'Used',
    transmission: 'Automatic',
    fuel: 'Petrol',
    km: 12500,
    badge: 'Low KM',
    badges: ['Low KM', 'Luxury Collection'],
    installmentFrom: 198000000,
    dpMin: 240000000,
    description: 'Sedan sport premium dengan paket perlengkapan sasis sport M Sport asli. Sangat aerodinamis dengan kontrol suspensi dinamis adaptif. Head unit berteknologi BMW Live Cockpit Professional.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    specs: {
      dimensions: '4963 x 1868 x 1479 mm',
      engine: '1998 cc TwinPower Turbo 4-Cylinder',
      acceleration: '6.4 detik (0-100 km/jam)',
      topSpeed: '250 km/jam'
    },
    warranty: 'Garansi Servis BSI Aktif s/d Maret 2027',
    branchName: 'Auto Veloce BSD Tangerang'
  },
  {
    id: 'v-03',
    name: 'Hyundai Ioniq 5 Signature Long Range',
    brand: 'Hyundai',
    year: 2023,
    price: 785000000,
    promoPrice: 765000000,
    condition: 'Used',
    transmission: 'Automatic',
    fuel: 'Electric',
    km: 8400,
    badge: 'Electric Vehicle',
    badges: ['Electric Vehicle', 'New Arrival'],
    installmentFrom: 125000000,
    dpMin: 150000000,
    description: 'Kendaraan bertenaga listrik penuh dengan model futuristik terbaik di kelasnya. Baterai sehat SOH 100% tersertifikasi. Dilengkapi fitur berkendara canggih Hyundai SmartSense terlengkap.',
    images: [
      'https://images.unsplash.com/photo-1669023414166-a4cf72efbfbe?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    specs: {
      dimensions: '4635 x 1890 x 1605 mm',
      engine: 'PMSM Electric Battery Lithium-ion 72.6 kWh',
      acceleration: '7.4 detik (0-100 km/jam)',
      topSpeed: '185 km/jam'
    },
    warranty: 'Garansi Baterai Resmi Pabrikan s/d 2031',
    branchName: 'Auto Veloce Surabaya Barat'
  },
  {
    id: 'v-04',
    name: 'BYD Seal Premium AWD Performance',
    brand: 'BYD',
    year: 2024,
    price: 719000000,
    condition: 'New',
    transmission: 'Automatic',
    fuel: 'Electric',
    km: 0,
    badge: 'Electric Vehicle',
    badges: ['Electric Vehicle', 'New Arrival'],
    installmentFrom: 118000000,
    dpMin: 140000000,
    description: 'Sedan listrik murni AWD paling agresif hari ini. Kondisi baru segel plastik 100% di showroom Bandung Center. Menawarkan tenaga instan gabungan dual motor berkepala akselerasi dahsyat.',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
    ],
    specs: {
      dimensions: '4800 x 1875 x 1460 mm',
      engine: 'Double Motor PMSM AWD Battery 82.5 kWh',
      acceleration: '3.8 detik (0-100 km/jam)',
      topSpeed: '240 km/jam'
    },
    warranty: 'Garansi 8 Tahun Blade Battery BYD Indonesia',
    branchName: 'Auto Veloce Bandung Center'
  }
];

export const INITIAL_RENTAL_VEHICLES: RentalVehicle[] = [
  {
    id: 'r-01',
    name: 'Toyota Innova Zenix Hybrid Premium',
    type: 'SUV',
    dailyPrice: 1100000,
    withDriverPrice: 1500000,
    deposit: 2000000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    branchName: 'Auto Veloce Jakarta Selatan',
    specs: ['7 Seats', 'Hybrid Fuel', 'Sunroof Panoramic', 'Active Safety Smart']
  },
  {
    id: 'r-02',
    name: 'Toyota Alphard Executive Class 2022',
    type: 'Luxury',
    dailyPrice: 2800000,
    withDriverPrice: 3500000,
    deposit: 5000000,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800',
    branchName: 'Auto Veloce BSD Tangerang',
    specs: ['7 Captain Seats', 'Leather Seat Cushion', 'Dual Sliding Door', 'Privat Tinted Window']
  },
  {
    id: 'r-03',
    name: 'Toyota HiAce Premio Executive VIP',
    type: 'Group',
    dailyPrice: 1800000,
    withDriverPrice: 2400000,
    deposit: 3000000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    branchName: 'Auto Veloce Bandung Center',
    specs: ['11 VIP Seats', 'Luggage Compartment Wide', 'Full Karaoke Sound System', 'Charging Ports at seats']
  },
  {
    id: 'r-04',
    name: 'Mercedes-Benz S-Class S450 AMG Line',
    type: 'Luxury',
    dailyPrice: 5500000,
    withDriverPrice: 6500000,
    deposit: 10000000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    branchName: 'Auto Veloce Jakarta Selatan',
    specs: ['5 Seats', 'Exclusive Nappa Leather', 'Active Air Suspension', 'Burmester Surround Sound']
  }
];

export const INITIAL_DETAILING_SERVICES: DetailingService[] = [
  {
    id: 'dt-01',
    name: 'Premium Snow Wash & Engine Bay Dressing',
    category: 'Clean',
    description: 'Pembersihan bodi eksterior, dek roda, kolong bawah bodi dengan salju ph-balanced khusus otomotif serta pelumasan pelindung karet plastik ruang mesin.',
    duration: '1.5 Jam',
    priceSmall: 180000,
    priceLarge: 250000
  },
  {
    id: 'dt-02',
    name: 'Interior Deep Cleaning & Ozone Sanitizer',
    category: 'Clean',
    description: 'Pembersihan tuntas debu sela AC, noda minyak jok kulit, pembersihan karpet dasar, diakhiri sterilisasi uap ozone pembunuh bakteri & bau pengap rokok.',
    duration: '3 Jam',
    priceSmall: 600000,
    priceLarge: 850000
  },
  {
    id: 'dt-03',
    name: 'Paint Correction Standard (Dual Stage Polishing)',
    category: 'Polishing',
    description: 'Pemolesan 2 tahap guna mengoreksi 85%+ baret halus kuku kucing, baret pusaran cuci, serta mencerahkan kembali kekusaman cat karena kelapukan cuaca.',
    duration: '5 Jam',
    priceSmall: 1200000,
    priceLarge: 1600000
  },
  {
    id: 'dt-04',
    name: 'Platinum Nano Ceramic Coating 9H+ (Single Layer)',
    category: 'Coating',
    description: 'Pelapisan 1 lapis kristal cair silica dwi-formulator penolak air (efek daun talas). Melindungi kilap cat dari pemudaran oksidasi sinar ultra-violet matahari.',
    duration: '24 Jam (Butuh rawat inap)',
    priceSmall: 2500000,
    priceLarge: 3500000
  }
];

export const INITIAL_PROMOS: Promo[] = [
  { id: 'pr-01', title: 'DP Murah Ceria Merdeka', description: 'Ajukan cicilan dengan batas DP seminim mungkin mulai dari 15% khusus untuk leasing BCA Finance selama bulan promosi.', expiryDate: '30 Juni 2026', bannerImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800' },
  { id: 'pr-02', title: 'Double Shield Detailing Suite', description: 'Dapatkan diskon potongan langsung sebesar 20% untuk paket Nano Ceramic Coating 3 tahun bagi unit mobil yang dibeli langsung di Auto Veloce.', expiryDate: '15 Juli 2026', bannerImage: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800' }
];

export const INITIAL_LEASING_PARTNERS: LeasingPartner[] = [
  { id: 'lp-01', name: 'BCA Finance Syariah/Flat', interestRate: '3.1% - 4.25%', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=80' },
  { id: 'lp-02', name: 'Mandiri Utama Finance', interestRate: '3.4% - 4.8%', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=80' },
  { id: 'lp-03', name: 'Maybank Syariah Indonesia', interestRate: '3.2% - 4.5%', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=80' },
  { id: 'lp-04', name: 'CIMB Niaga Auto Finance', interestRate: '3.3% - 4.6%', logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=80' }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b-01',
    title: 'Panduan Membeli Mobil Bekas Mewah Agar Bebas Kerugian',
    category: 'Edukesi',
    date: '2026-05-18',
    summary: 'Bagaimana mengenali bodi sasis bekas tabrak besar serta taktik bernegosiasi jaminan garansi showroom.',
    body: 'Membeli mobil mewah bekas tentu menguntungkan karena depresiasi harga yang sudah melandai dibandingkan unit gres. Namun, Anda wajib memahami riwayat fungsional mobil meliputi odometer asli tanpa reset, bebas tabrak structural sasis, serta bebas indikasi terendam banjir bandang.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'b-02',
    title: 'Manfaat Nyata Ceramic Coating Pada Musim Pancaroba',
    category: 'Perawatan',
    date: '2026-05-28',
    summary: 'Melindungi kilau bodi dari bahaya jamur air akibat pengendapan air hujan asam yang merusak vernis cat.',
    body: 'Air hujan mengandung zat asam tinggi yang jika mengering di atas permukaan vernis cat mobil di bawah terik matahari akan memicu bercak jamur air (waterspot) yang sulit dihilangkan. Lapisan tipis nano ceramic 9H+ bertindak sebagai perisai keras yang memiliki sifat hidrofobik daun talas.',
    imageUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_FAQS: FAQ[] = [
  { id: 'f-01', question: 'Apakah seluruh surat dokumen mobil dijamin keaslian dan keabsahannya secara hukum?', answer: 'Tentu saja. Seluruh unit yang masuk ke showroom telah diuji fisik kelengkapan form A, faktur, STNK, BPKB asli serta lolos cek pemalsuan Samsat Polda Metro Jaya. Kami menjamin buyback 100% jika dokumen bermasalah.' },
  { id: 'f-02', question: 'Bagaimana metode pendelegasian routing booking test drive di web ini?', answer: 'Sistem routing WhatsApp cerdas kami akan mendelegasikan data Anda kepada Advisor ahli sesuai ketersediaan unit dan wilayah domisili cabang showroom terdekat untuk menjamin pelayanan privat kelas satu.' }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  { id: 't-01', customerName: 'Bapak Hartono Mulyadi', profession: 'Direktur Finansial Property', rating: 5, feedback: 'Urusan tukar tambah Alphard sangat cepat dan transparan. Appraiser independen mereka sangat profesional, sisa bayar langsung didanai BCA Finance dengan bunga bersahabat.' },
  { id: 't-02', customerName: 'Ibu Amanda Kirana', profession: 'Kolektor Seni & Penggiat Kreatif', rating: 5, feedback: 'Mobil BMW 5 Series simpanan dengan kilometer rendah. Kondisi interior sangat bersih layaknya mobil baru keluar pabrikan.' },
  { id: 't-03', customerName: 'Bapak Raditya Wibowo', profession: 'Tech Founder & Angel Investor', rating: 5, feedback: 'Layanan Rental VIP di Auto Veloce sangat menakjubkan. Pengiriman tepat waktu dengan supir berpakaian rapi dan sangat mengerti rute tercepat Jakarta-Bandung.' },
  { id: 't-04', customerName: 'Ibu dr. Sarah Fitriani', profession: 'Dokter Spesialis & Pengusaha Klinik', rating: 5, feedback: 'Saya memesan Platinum Nano Ceramic Coating untuk SUV saya. Hasil pengerjaannya presisi, efek daun talasnya luar biasa, dan gratis pembersihan ruang mesin!' }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'ld-001',
    name: 'Jonathan Wijaya',
    whatsApp: '+6281290001001',
    email: 'jonathan.w@gmail.com',
    type: 'Test Drive',
    status: 'New',
    assignedTo: 'sa-01',
    createdAt: new Date().toISOString(),
    details: {
      vehicleId: 'v-01',
      vehicleName: 'Toyota Alphard 2.5 G AT Executive',
      comment: 'Tolong disiapkan rincian cicilan dengan DP Rp 250jt.'
    },
    notes: [
      { id: 'n-1', date: new Date().toISOString(), author: 'System', text: 'Form submitted online.' }
    ]
  },
  {
    id: 'ld-002',
    name: 'Amanda Kirana',
    whatsApp: '+6281290001002',
    email: 'amanda.k@yahoo.co.id',
    type: 'Trade-In',
    status: 'Contacted',
    assignedTo: 'sa-02',
    createdAt: new Date().toISOString(),
    details: {
      oldVehicleName: 'Toyota Fortuner 2017',
      oldVehicleKM: 80000,
      customerExpectedPrice: 320000000,
      targetVehicleId: 'v-02',
      targetVehicleName: 'BMW 530i M Sport LCI Premium'
    },
    notes: [
      { id: 'n-2', date: new Date().toISOString(), author: 'Nadia Siregar', text: 'Telah diajak diskusi penawaran appraisal awal via telepon' }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    customerName: 'Jonathan Wijaya',
    customerPhone: '+6281290001001',
    type: 'Test Drive',
    itemId: 'v-01',
    itemName: 'Toyota Alphard 2.5 G AT Executive',
    branchName: 'Auto Veloce Jakarta Selatan',
    date: '2026-06-10',
    time: '11:00',
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bk-002',
    customerName: 'Ahmad Faisal',
    customerPhone: '+6281290001005',
    type: 'Detailing',
    itemId: 'dt-04',
    itemName: 'Platinum Nano Ceramic Coating 9H+ (SUV/Large Car)',
    branchName: 'Auto Veloce Bandung Center',
    date: '2026-06-08',
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  }
];
