import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'db-store.json');

// Interfaces for local persistence
import {
  INITIAL_BRANCHES,
  INITIAL_SALES_AGENTS,
  INITIAL_VEHICLES,
  INITIAL_RENTAL_VEHICLES,
  INITIAL_DETAILING_SERVICES,
  INITIAL_PROMOS,
  INITIAL_LEASING_PARTNERS,
  INITIAL_BLOG_POSTS,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_LEADS,
  INITIAL_BOOKINGS
} from './src/data';

// Helper to load/save server-side state
function getDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (!db.users || db.users.length < 4) {
        db.users = [
          {
            id: 'u-admin',
            name: 'Admin Auto Veloce',
            email: 'admin@autoveloce.com',
            phone: '08111222333',
            password: 'admin',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            isAdmin: true
          },
          {
            id: 'u-staff',
            name: 'Staff Supervisor',
            email: 'staff@autoveloce.com',
            phone: '08122334455',
            password: 'staff123',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            isAdmin: true
          },
          {
            id: 'u-sales',
            name: 'Hendry Wijaya',
            email: 'sales@autoveloce.com',
            phone: '08133445566',
            password: 'sales123',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            isAdmin: true
          },
          {
            id: 'u-finance',
            name: 'Siti Rahma',
            email: 'finance@autoveloce.com',
            phone: '08144556677',
            password: 'finance123',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            isAdmin: true
          }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      }
      return db;
    } catch (e) {
      console.error('Error parsing JSON db, resetting to defaults', e);
    }
  }

  // Fallback to defaults
  const freshDb = {
    branches: INITIAL_BRANCHES,
    salesAgents: INITIAL_SALES_AGENTS,
    vehicles: INITIAL_VEHICLES,
    rentalVehicles: INITIAL_RENTAL_VEHICLES,
    detailingServices: INITIAL_DETAILING_SERVICES,
    promos: INITIAL_PROMOS,
    leasingPartners: INITIAL_LEASING_PARTNERS,
    blogPosts: INITIAL_BLOG_POSTS,
    faqs: INITIAL_FAQS,
    testimonials: INITIAL_TESTIMONIALS,
    leads: INITIAL_LEADS,
    bookings: INITIAL_BOOKINGS,
    users: [
      {
        id: 'u-admin',
        name: 'Admin Auto Veloce',
        email: 'admin@autoveloce.com',
        phone: '08111222333',
        password: 'admin',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        isAdmin: true
      },
      {
        id: 'u-staff',
        name: 'Staff Supervisor',
        email: 'staff@autoveloce.com',
        phone: '08122334455',
        password: 'staff123',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        isAdmin: true
      },
      {
        id: 'u-sales',
        name: 'Hendry Wijaya',
        email: 'sales@autoveloce.com',
        phone: '08133445566',
        password: 'sales123',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        isAdmin: true
      },
      {
        id: 'u-finance',
        name: 'Siti Rahma',
        email: 'finance@autoveloce.com',
        phone: '08144556677',
        password: 'finance123',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        isAdmin: true
      }
    ],
    settings: {
      activeTemplate: 'Premium Car Showroom',
      language: 'id',
      theme: 'dark'
    },
    auditLogs: [
      {
        id: 'log-001',
        timestamp: new Date().toISOString(),
        action: 'Database Initialized',
        user: 'System Admin',
        ip: '127.0.0.1',
        details: 'Initial system seed data loaded successfully.'
      }
    ]
  };
  saveDatabase(freshDb);
  return freshDb;
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database file', e);
  }
}

async function run() {
  const app = express();
  app.use(express.json());

  // Log incoming API calls to server console & Audit Log
  const addAuditLog = (action: string, user: string, details: string, ip = '127.0.0.1') => {
    try {
      const db = getDatabase();
      if (!db.auditLogs || !Array.isArray(db.auditLogs)) {
        db.auditLogs = [];
      }
      const log = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        action,
        user,
        ip,
        details
      };
      db.auditLogs.unshift(log);
      // limit audit logs to last 100 entries
      if (db.auditLogs.length > 100) {
        db.auditLogs = db.auditLogs.slice(0, 100);
      }
      saveDatabase(db);
    } catch (err) {
      console.error('Audit logging failed, continuing execution gracefully:', err);
    }
  };

  // Helper to strip markdown code blocks from AI JSON response
  const cleanJsonString = (str: string): string => {
    let cleaned = str.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
      cleaned = cleaned.replace(/\n?```$/, '');
    }
    return cleaned.trim();
  };

  // Safe Gemini AI client setup
  const isGeminiEnabled = !!process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (isGeminiEnabled) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      console.log('✔ Server: Server-side Gemini AI Integration loaded.');
    } catch (e) {
      console.error('✘ Server: Failed to initialize Gemini Client', e);
    }
  } else {
    console.warn('⚠️ Server: GEMINI_API_KEY is not defined. Using adaptive mock logic.');
  }

  // --- REST ENDPOINTS ---

  // Branches
  app.get('/api/branches', (req, res) => {
    const db = getDatabase();
    res.json(db.branches);
  });

  // Sales Agents
  app.get('/api/sales-agents', (req, res) => {
    const db = getDatabase();
    res.json(db.salesAgents);
  });

  // Vehicles (Public view gets all; optional filter on client)
  app.get('/api/vehicles', (req, res) => {
    const db = getDatabase();
    res.json(db.vehicles);
  });

  // Admin CRUD for Vehicles
  app.post('/api/vehicles', (req, res) => {
    const db = getDatabase();
    const newVehicle = {
      id: `v-${Date.now()}`,
      ...req.body
    };
    db.vehicles.push(newVehicle);
    saveDatabase(db);
    addAuditLog('Created Vehicle', 'Admin / Content Editor', `Added vehicle: ${newVehicle.name}`);
    res.status(201).json(newVehicle);
  });

  app.put('/api/vehicles/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const index = db.vehicles.findIndex((v: any) => v.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    db.vehicles[index] = { ...db.vehicles[index], ...req.body };
    saveDatabase(db);
    addAuditLog('Updated Vehicle', 'Admin / Content Editor', `Updated vehicle ID: ${id}`);
    res.json(db.vehicles[index]);
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const filtered = db.vehicles.filter((v: any) => v.id !== id);
    if (filtered.length === db.vehicles.length) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    db.vehicles = filtered;
    saveDatabase(db);
    addAuditLog('Deleted Vehicle', 'Admin / Content Editor', `Removed vehicle ID: ${id}`);
    res.json({ message: 'Vehicle deleted successfully' });
  });

  // Rental Vehicles
  app.get('/api/rental-vehicles', (req, res) => {
    const db = getDatabase();
    res.json(db.rentalVehicles);
  });

  // Detailing Services
  app.get('/api/detailing-services', (req, res) => {
    const db = getDatabase();
    res.json(db.detailingServices);
  });

  // Promos
  app.get('/api/promos', (req, res) => {
    const db = getDatabase();
    res.json(db.promos);
  });

  // Leasing Partners
  app.get('/api/leasing-partners', (req, res) => {
    const db = getDatabase();
    res.json(db.leasingPartners);
  });

  // Blog Posts
  app.get('/api/blog-posts', (req, res) => {
    const db = getDatabase();
    res.json(db.blogPosts);
  });

  // FAQs
  app.get('/api/faqs', (req, res) => {
    const db = getDatabase();
    res.json(db.faqs);
  });

  // Testimonials
  app.get('/api/testimonials', (req, res) => {
    const db = getDatabase();
    res.json(db.testimonials);
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    const db = getDatabase();
    res.json(db.settings);
  });

  app.put('/api/settings', (req, res) => {
    const db = getDatabase();
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    addAuditLog('Updated Settings', 'Admin / Owner', `Updated global template / configs to: ${db.settings.activeTemplate}`);
    res.json(db.settings);
  });

  // Leads (CRM)
  app.get('/api/leads', (req, res) => {
    const db = getDatabase();
    res.json(db.leads);
  });

  app.post('/api/leads', (req, res) => {
    const db = getDatabase();
    const newLead = {
      id: `ld-${Date.now()}`,
      status: 'New',
      notes: [{ id: `n-${Date.now()}`, date: new Date().toISOString(), author: 'System Log', text: 'Lead submitted via online form gateway.' }],
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.leads.unshift(newLead);
    saveDatabase(db);
    addAuditLog('Created Lead', 'Web Customer', `New Lead submitted from ${newLead.name} (${newLead.type})`);
    res.status(201).json(newLead);
  });

  app.put('/api/leads/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const index = db.leads.findIndex((l: any) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    db.leads[index] = { ...db.leads[index], ...req.body };
    saveDatabase(db);
    addAuditLog('Updated Lead Details', 'Sales Staff', `Lead ID: ${id} updated status / ownership.`);
    res.json(db.leads[index]);
  });

  app.post('/api/leads/:id/notes', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { author, text } = req.body;
    const index = db.leads.findIndex((l: any) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const newNote = {
      id: `n-${Date.now()}`,
      date: new Date().toISOString(),
      author: author || 'Sales Team',
      text
    };
    db.leads[index].notes.push(newNote);
    saveDatabase(db);
    addAuditLog('Added Lead Note', author || 'Sales Staff', `Added interaction log to Lead ID: ${id}`);
    res.json(db.leads[index]);
  });

  // Bookings (Test Drive, Detailing, Rental)
  app.get('/api/bookings', (req, res) => {
    const db = getDatabase();
    res.json(db.bookings);
  });

  app.post('/api/bookings', (req, res) => {
    const db = getDatabase();
    const newBooking = {
      id: `bk-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.bookings.unshift(newBooking);
    saveDatabase(db);
    addAuditLog('Created Booking', 'Customer Checkout', `Created ${newBooking.type} reservation for ${newBooking.customerName}`);
    res.status(201).json(newBooking);
  });

  app.put('/api/bookings/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const index = db.bookings.findIndex((b: any) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    db.bookings[index] = { ...db.bookings[index], ...req.body };
    saveDatabase(db);
    addAuditLog('Updated Booking Status', 'Service Admin', `Booking ID: ${id} set to ${db.bookings[index].status}`);
    res.json(db.bookings[index]);
  });

  // Audit Logs View
  app.get('/api/audit-logs', (req, res) => {
    const db = getDatabase();
    res.json(db.auditLogs);
  });

  // Clear Audit Logs
  app.post('/api/audit-logs/clear', (req, res) => {
    const db = getDatabase();
    db.auditLogs = [];
    saveDatabase(db);
    res.json({ message: 'Audit logs cleared' });
  });

  // --- PERSISTENT AI LIGHT ENGINES ---

  // 1. AI Car Matcher
  app.post('/api/ai/car-match', async (req, res) => {
    const { budget, purpose, passengers, fuel, transmission } = req.body;
    const db = getDatabase();
    const carsListStr = db.vehicles.map((v: any) => `- ID: ${v.id}, Name: ${v.name}, Brand: ${v.brand}, Type: ${v.type}, Seats: ${v.specs.dimensions || '7'}, Fuel: ${v.fuel}, Trans: ${v.transmission}, Price: Rp ${v.price.toLocaleString('id-ID')}, Description: ${v.description}`).join('\n');

    let responseText = '';
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `As an experienced professional Sales Advisor at Auto Veloce Motor, recommend 2-3 matched vehicles from our current catalog for a user with these criteria:
- Budget Limit: Rp ${parseInt(budget || '0').toLocaleString('id-ID')}
- Primary usage purpose: ${purpose || 'Daily commuting'}
- Preferred Passenger Count: ${passengers || '5'} seats
- Fuel Preference: ${fuel || 'Any'}
- Gearbox Preference: ${transmission || 'Any'}

Here is our available vehicle inventory:
${carsListStr}

Please generate a professional, persuasive response in Bahasa Indonesia. Format the response as JSON with properties:
- matches: array of objects containing (id, inlineMatchReason)
- assistantProse: a polite and comprehensive concluding advice paragraph.
Ensure ONLY valid JSON is returned.`,
          config: { responseMimeType: 'application/json' }
        });
        responseText = result.text || '';
      } catch (e) {
        console.error('Gemini Car Match error, fallback to rules', e);
      }
    }

    if (!responseText) {
      // Robust adaptive rule-based fallback when key is absent
      const matchedCars = db.vehicles.filter((v: any) => {
        let isMatch = true;
        if (budget && v.price > parseInt(budget)) isMatch = false;
        if (transmission && transmission !== 'Any' && v.transmission !== transmission) isMatch = false;
        if (fuel && fuel !== 'Any' && v.fuel !== fuel) isMatch = false;
        return isMatch;
      }).slice(0, 3);

      const payload = {
        matches: matchedCars.map((c: any) => ({
          id: c.id,
          inlineMatchReason: `Sangat pas untuk kebutuhan Anda karena dibekali transmisi ${c.transmission} yang handal, efisiensi bahan bakar ${c.fuel}, serta sangat representatif untuk keperluan ${purpose || 'harian'}.`
        })),
        assistantProse: 'Berdasarkan kriteria Anda, tim ahli Auto Veloce menyarankan opsi di atas. Silakan jadwalkan kunjungan showroom atau booking test drive sekarang juga untuk merasakan sensasi mengaspal!'
      };
      return res.json(payload);
    }

    try {
      res.json(JSON.parse(cleanJsonString(responseText)));
    } catch {
      res.json({ error: 'AI failed to respond in standard JSON format', developerLog: responseText });
    }
  });

  // 2. AI Credit Explainer
  app.post('/api/ai/credit-explain', async (req, res) => {
    const { vehicleName, price, dp, tenor, monthlyInstallment, interestRate, leasingName } = req.body;
    let explanation = '';
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Explain this credit simulation for the vehicle "${vehicleName}" in clear, helpful human terms in Bahasa Indonesia:
- Total Car Price: Rp ${parseInt(price).toLocaleString('id-ID')}
- Down Payment (DP): Rp ${parseInt(dp).toLocaleString('id-ID')}
- Tenor Period: ${tenor} months
- Est. Monthly Installment: Rp ${parseInt(monthlyInstallment).toLocaleString('id-ID')}
- Interest Rate applied: ${interestRate} (flat per year)
- Leasing Company Partner: ${leasingName}

Provide helpful tips regarding budgeting, credit health assessment, and readiness to approve. Offer a warm final sentence reminding them of the Auto Veloce support. No formatting code, just elegant readable markdown.`
        });
        explanation = result.text || '';
      } catch (e) {
        console.error('Gemini explanation failed', e);
      }
    }

    if (!explanation) {
      explanation = `### Analisis Kredit Simulasi Anda (${leasingName})
Kami menyambut baik ketertarikan Anda pada **${vehicleName}**. Berdasarkan simulasi cicilan sebesar **Rp ${parseInt(monthlyInstallment).toLocaleString('id-ID')}/bulan** selama **${tenor} bulan**, berikut adalah pertimbangan dari tim keuangan kami:

1. **Rasio Pendapatan**: Usahakan total cicilan bulanan ini tidak melebihi 30% dari total pendapatan bulanan kotor rumah tangga Anda untuk menjaga stabilitas keuangan.
2. **Kesiapan DP**: Pembayaran awal (DP) sebesar **Rp ${parseInt(dp).toLocaleString('id-ID')}** sudah memenuhi batas aturan minimum OJK (20%), sehingga peluang pengajuan disetujui oleh ${leasingName} dinilai **Sangat Tinggi**.
3. **Tips Arus Kas**: Tenor ${tenor} bulan memberikan kestabilan pengeluaran berkala. Jika memiliki dana idle ekstra di masa depan, Anda bisa berkonsultasi mengenai pelunasan dipercepat untuk memotong beban amortisasi bunga.`;
    }

    res.json({ explanation });
  });

  // 3. AI Lead Scoring
  app.post('/api/ai/lead-score', async (req, res) => {
    const { leadDetails } = req.body;
    let scoreResponse = '';
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Analyse the lead engagement activities below and generate scoring assessment in Bahasa Indonesia.
Activity parameters:
${JSON.stringify(leadDetails, null, 2)}

Provide structured evaluation containing:
- Score Rating: Hot, Warm, or Cold
- Estimated conversion probability: xx%
- Concise Bullet Points of behavior triggers (e.g. simulation completed, custom message sent, high budget match)
- Recommendations for sales follow-up intensity.

Format the reply as clean JSON object:
{
  "rating": "Hot" | "Warm" | "Cold",
  "probability": number,
  "triggers": string[],
  "strategy": string
}`
        });
        scoreResponse = result.text || '';
      } catch (e) {
        console.error('Gemini score analysis failed', e);
      }
    }

    if (!scoreResponse) {
      const budgetMatch = leadDetails.budget || 500000000;
      const type = leadDetails.type;
      const hasDPTenor = !!(leadDetails.details?.dp && leadDetails.details?.tenor);

      let rating = 'Warm';
      let probability = 60;
      let triggers = ['Telah mengirimkan detail kontak valid via form web.'];

      if (type === 'Credit' && hasDPTenor) {
        rating = 'Hot';
        probability = 85;
        triggers.push('Menyelesaikan kalkulasi kredit mandiri dengan rincian DP & Tenor spesifik.');
      } else if (type === 'Trade-In') {
        rating = 'Hot';
        probability = 75;
        triggers.push('Menyertakan rincian spesifik unit trade-in lama beserta target unit incaran.');
      }

      if (leadDetails.details?.message && leadDetails.details?.message.length > 50) {
        triggers.push('Menyertakan pesan personal dengan tingkat ketertarikan tinggi.');
      }

      const payload = {
        rating,
        probability,
        triggers,
        strategy: `Hubungi kembali dalam waktu maksimal 2 jam via WhatsApp. Sampaikan ketersediaan unit dan tawarkan jadwal pertemuan showroom secara eksklusif.`
      };
      return res.json(payload);
    }

    try {
      res.json(JSON.parse(cleanJsonString(scoreResponse)));
    } catch {
      res.status(500).json({ error: 'Failed to process AI output as JSON', developerLog: scoreResponse });
    }
  });

  // 4. AI Follow-up Assistant
  app.post('/api/ai/follow-up-draft', async (req, res) => {
    const { leadName, interestedUnit, leadType, salesName } = req.body;
    let draft = '';
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Create an elegant, non-pushy, premium sales WhatsApp/SMS follow-up template in Bahasa Indonesia.
Customer's Name: ${leadName}
Interested Vehicle/Service: ${interestedUnit}
Inquiry Type: ${leadType}
Assigned Sales Advisor: ${salesName}

The text must look human-written, warm, professional, offering concierge assistance (e.g., arrange viewing, answer credit simulation questions). Avoid cheesy sales clichés. Use appropriate line spacing and gentle call-to-actions.`
        });
        draft = result.text || '';
      } catch (e) {
        console.error('Gemini follow up draft outline failed', e);
      }
    }

    if (!draft) {
      draft = `Selamat pagi/siang Bapak/Ibu *${leadName}*,

Perkenalkan saya *${salesName}*, Sales Advisor dari *Auto Veloce Motor*. Terima kasih telah menghubungi kami mengenai ketertarikan Anda pada unit *${interestedUnit}* (${leadType}).

Untuk mempermudah rencana pembelian Anda, saya bersedia membantu menjawab pertanyaan lanjutan seputar kelengkapan dokumen, simulasi cicilan khusus dari leasing partner kami, maupun menjadwalkan kunjungan privat untuk viewing atau test drive langsung di showroom.

Apakah sekiranya ada waktu luang hari ini untuk berdiskusi santai sejenak via telepon atau WhatsApp?

Salam hangat,
*${salesName}*
Auto Veloce Motor`;
    }

    res.json({ draft });
  });

  // 5. AI Listing Writer
  app.post('/api/ai/listing-prose', async (req, res) => {
    const { name, brand, year, type, km, transmission, specs } = req.body;
    let prose = '';
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Draft a highly luxurious and compelling marketing item description for a vehicle catalog listing in Bahasa Indonesia.
Vehicle: ${year} ${brand} ${name}
Segment: ${type}
Mileage: ${km} km
Gearbox: ${transmission}
Key specs provided: ${JSON.stringify(specs)}

The tone must be elite, evocative, and secure. Focus on performance excellence, immaculate state, pristine cabin feeling, and strict multi-point inspection warranty backing by Auto Veloce. Keep it to 2 compact paragraphs.`
        });
        prose = result.text || '';
      } catch (e) {
        console.error('Listing writer failed', e);
      }
    }

    if (!prose) {
      prose = `Hadir sebagai mahakarya kemewahan abadi, **${brand} ${name} (${year})** ini memancarkan pesona prestisius yang tak tertandingi di jalanan. Dengan jarak tempuh rendah sebesar **${km} KM** serta didukung transmisi **${transmission}** luar biasa responsif, kondisi eksterior dan interior sangat terawat layaknya keluar dari dealer resmi baru. 

Dapatkan ketenangan berkendara termutakhir karena unit ini telah lolos uji inspeksi ketat 150+ titik standar emas Auto Veloce Motor. Kami menjamin kebebasan sengketa dokumen penuh, bebas indikasi banjir, serta bebas riwayat kecelakaan besar, didukung garansi perfomance resmi khusus untuk menjaga kualitas perjalanan eksklusif Anda.`;
    }

    res.json({ prose });
  });

  // 6. AI Trade-in Brief
  app.post('/api/ai/trade-in-brief', async (req, res) => {
    const { customerName, oldCar, newCar, km, condition, expectedPrice } = req.body;
    let brief = '';
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Summarize this trade-in inquiry for our professional Appraiser Team in Bahasa Indonesia.
Customer Name: ${customerName}
Old Car Details: ${oldCar}
Odometer count: ${km} km
Customer reported car condition: ${condition}
Expected valuation by customer: Rp ${parseInt(expectedPrice || '0').toLocaleString('id-ID')}
New vehicle targeted: ${newCar}

Produce a dense appraiser brief with:
- Summary of potential strong areas of old car
- Suspected inspection check areas for this type model
- Fair-market appraisal price range estimate (give standard logic range)
- Conversion advice on how to lock the trade-in.
Format as clear markdown.`
        });
        brief = result.text || '';
      } catch (e) {
        console.error('Trade-in brief failing', e);
      }
    }

    if (!brief) {
      brief = `### BRIP TRADE-IN EVALUASI (APPRAISER INTERN)
**Calon Pembeli:** ${customerName}
**Unit Lama:** ${oldCar} (${km} KM)
**Unit Incaran:** ${newCar}

**Analisis Unit Lama:**
- **Kondisi Umum:** Dilaporkan "${condition}". Unit dengan kilometer moderat memiliki nilai jual tinggi jika dirawat secara berkala.
- **Titik Kritis Pemeriksaan:** Wajib menguji kelayakan kaki-kaki, transmisi matik, kebocoran oli mesin, serta cek ketebalan cat panel untuk deteksi baret/cat ulang.
- **Rekomendasi Kisaran Harga Pasar:** Berkisar di antara **Rp ${(parseInt(expectedPrice || '0') * 0.9).toLocaleString('id-ID')} - Rp ${(parseInt(expectedPrice || '0') * 1.05).toLocaleString('id-ID')}** tergantung hasil inspeksi menyeluruh.
- **Langkah Strategis:** Jadwalkan kunjungan appraisal langsung ke rumah customer / cabang terdekat untuk menawarkan bonus trade-in booster maksimal.`;
    }

    res.json({ brief });
  });

  // 7. AI Rental Matcher
  app.get('/api/ai/rental-match', (req, res) => {
    // Dynamic matching algorithm based on purpose
    const { purpose } = req.query;
    const db = getDatabase();
    let bestMatch = db.rentalVehicles[0];

    const purposeStr = String(purpose || '').toLowerCase();

    if (purposeStr.includes('wedding') || purposeStr.includes('pernikahan') || purposeStr.includes('vip')) {
      bestMatch = db.rentalVehicles.find((v: any) => v.type === 'Luxury' || v.type === 'VIP') || db.rentalVehicles[1];
    } else if (purposeStr.includes('group') || purposeStr.includes('family') || purposeStr.includes('keluarga') || purposeStr.includes('liburan') || purposeStr.includes('corporate') || purposeStr.includes('bisnis')) {
      bestMatch = db.rentalVehicles.find((v: any) => v.type === 'Group') || db.rentalVehicles[3];
    } else {
      bestMatch = db.rentalVehicles[0];
    }

    res.json({
      matchedVehicle: bestMatch,
      reason: `Sangat cocok sebagai pilihan akomodasi transportasi kelas utama untuk agenda "${purpose || 'perjalanan umum'}" Anda.`
    });
  });

  // 8. AI Detailing Matcher
  app.post('/api/ai/detailing-match', (req, res) => {
    const { issue } = req.body;
    const db = getDatabase();
    let service = db.detailingServices[0];

    const issueLower = (issue || '').toLowerCase();
    if (issueLower.includes('baret') || issueLower.includes('kusam') || issueLower.includes('swirl')) {
      service = db.detailingServices.find((s: any) => s.id === 'dt-03') || db.detailingServices[2];
    } else if (issueLower.includes('jamur') || issueLower.includes('perlindungan') || issueLower.includes('kilap')) {
      service = db.detailingServices.find((s: any) => s.id === 'dt-04' || s.id === 'dt-05') || db.detailingServices[4];
    } else if (issueLower.includes('bau') || issueLower.includes('kotor kabin') || issueLower.includes('interior')) {
      service = db.detailingServices.find((s: any) => s.id === 'dt-02') || db.detailingServices[1];
    }

    res.json({
      matchedService: service,
      justification: `Berdasarkan masalah kendaraan Anda "${issue}", kami mengidentifikasi paket ini paling efektif memberikan restorasi hasil maksimal.`
    });
  });

  // 9. AI SEO Assistant
  app.post('/api/ai/seo-generator', async (req, res) => {
    const { carName, branchName } = req.body;
    let seo = { title: '', description: '' };
    if (ai) {
      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Create high-CTR SEO parameters in Bahasa Indonesia:
Car Model: ${carName}
Branch Showroom Location: ${branchName}

Provide response as a standard JSON object containing:
- title: concise title under 60 chars. Must include brand/model, "Bekas Premium" or "Baru", and "Auto Veloce".
- description: engaging search descriptive snippet under 155 chars. Highlight inspection quality, credit availability, or warranty.
Only return pure JSON.`,
          config: { responseMimeType: 'application/json' }
        });
        const parsed = JSON.parse(cleanJsonString(result.text || '{}'));
        seo.title = parsed.title;
        seo.description = parsed.description;
      } catch (e) {
        console.error('Gemini SEO generator failed', e);
      }
    }

    if (!seo.title) {
      seo.title = `${carName} Bekas Premium ${branchName || 'Jakarta'} | Auto Veloce`;
      seo.description = `Miliki ${carName} berkualitas premium terbaik di ${branchName || 'Auto Veloce'}. Surat dokumen lengkap, bergaransi & tersaji opsi simulasi kredit ringan.`;
    }

    res.json(seo);
  });

  // --- AUTH ENDPOINTS ---

  // Register
  app.post('/api/auth/register', (req, res) => {
    const db = getDatabase();
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const existingUser = db.users.find((u: any) => u.email.trim().toLowerCase() === emailNormalized);

    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: emailNormalized,
      phone: phone.trim(),
      password, // Simple plaintext for demo/applet robustness
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop', // default nice avatar
      isAdmin: true
    };

    db.users.push(newUser);
    saveDatabase(db);
    addAuditLog('User Registered', newUser.name, `New user registered with email: ${newUser.email}`);

    const { password: _, ...userSafe } = newUser;
    res.status(201).json(userSafe);
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const db = getDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = db.users.find((u: any) => u.email.trim().toLowerCase() === emailNormalized && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    addAuditLog('User Logged In', user.name, `User logged in: ${user.email}`);
    
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  });

  // Update Profile
  app.put('/api/auth/profile', (req, res) => {
    const db = getDatabase();
    const { id, name, email, phone, password, photo } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID user tidak valid.' });
    }

    const index = db.users.findIndex((u: any) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const user = db.users[index];

    // If changing email, check if it's already taken
    if (email && email.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      const emailNormalized = email.trim().toLowerCase();
      const existingUser = db.users.find((u: any) => u.email.trim().toLowerCase() === emailNormalized && u.id !== id);
      if (existingUser) {
        return res.status(400).json({ error: 'Email sudah digunakan oleh user lain.' });
      }
      user.email = emailNormalized;
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (password) user.password = password;
    if (photo !== undefined) user.photo = photo;

    db.users[index] = user;
    saveDatabase(db);
    addAuditLog('User Profile Updated', user.name, `Profile updated for ${user.email}`);

    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  });

  // --- STATIC ASSETS FOR WEB PREVIEW & FAVICON ---

  // Dynamic beautiful favicon serving
  app.get('/favicon.svg', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="25" fill="#0c0c0e" />
  <!-- Sleek sporty car profile contour line -->
  <path d="M15 65 C25 65, 30 50, 45 42 C50 39, 65 39, 72 45 C80 52, 83 60, 88 65" fill="none" stroke="url(#glow)" stroke-width="6" stroke-linecap="round" />
  <path d="M30 65 L40 65" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
  <path d="M60 65 L70 65" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
  <text x="50" y="83" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">VELOCE</text>
</svg>`);
  });

  // Dynamic social preview image serving
  app.get('/preview.jpg', (req, res) => {
    const previewPath = path.join(process.cwd(), 'src/assets/images/auto_veloce_demo_1783578187191.jpg');
    if (fs.existsSync(previewPath)) {
      res.sendFile(previewPath);
    } else {
      res.status(404).send('Preview image not found');
    }
  });

  // --- DEV / PRODUCTION INTEGRATION ---

  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    // Integrate Vite as Middleware
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(process.cwd(), 'dist')));
  }

  // Handle SPA routing - delegate all unmatched routes to index.html
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith('/api')) {
      return next();
    }
    try {
      let template: string;
      if (process.env.NODE_ENV !== 'production') {
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production' && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 AUTO VELOCE MOTOR Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 Dev Server mode: ${process.env.NODE_ENV !== 'production' ? 'Vite HMR Hooked' : 'Static Built Client'}`);
    console.log(`====================================================`);
  });
}

run().catch((err) => {
  console.error('Fatal Server crash on startup', err);
});
