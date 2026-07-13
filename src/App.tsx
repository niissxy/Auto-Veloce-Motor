import React from 'react';
import {
  Flame,
  Search,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  Scale,
  Sparkles,
  PhoneCall,
  Calendar,
  DollarSign,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Clock,
  HelpCircle,
  ThumbsUp,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Play,
  Tv,
  Smartphone,
  Laptop,
  Quote
} from 'lucide-react';

// Imports sub components
import { Navbar } from './components/Navbar';
import { Showroom } from './components/Showroom';
import { RentalService } from './components/RentalService';
import { DetailingService } from './components/DetailingService';
import { TradeInWizard } from './components/TradeInWizard';
import { CRMAdmin } from './components/CRMAdmin';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { AdminAuth } from './components/AdminAuth';
import { UserSession } from './types';

// Database & Translation seeding
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
} from './data';
import { SupportedLanguage, TRANSLATIONS } from './translations';
import { Lead, Booking, Vehicle } from './types';

export default function App() {
  // Global States
  const [currentLang, setCurrentLang] = React.useState<SupportedLanguage>('id');
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = React.useState<'home' | 'showroom' | 'rentals' | 'detailing' | 'trade-in' | 'ai-assistant' | 'admin' | 'profile'>('home');
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const handleSetLang = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('av_lang', lang);
  };

  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('av_theme', newTheme);
  };

  // Database mirror lists
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(INITIAL_VEHICLES);
  const [leads, setLeads] = React.useState<Lead[]>(INITIAL_LEADS);
  const [bookings, setBookings] = React.useState<Booking[]>(INITIAL_BOOKINGS);

  // Accordion faq states
  const [openFaqId, setOpenFaqId] = React.useState<string | null>(null);

  // Home Screen Matcher AI Query forms
  const [aiBudget, setAiBudget] = React.useState('1000000000');
  const [aiPurpose, setAiPurpose] = React.useState('Daily commuting & business prestige');
  const [aiPassengers, setAiPassengers] = React.useState('7');
  const [aiFuel, setAiFuel] = React.useState('Any');
  const [aiTrans, setAiTrans] = React.useState('Any');
  
  const [aiMatches, setAiMatches] = React.useState<Array<{ id: string; inlineMatchReason: string }>>([]);
  const [aiProse, setAiProse] = React.useState('');
  const [aiSearching, setAiSearching] = React.useState(false);

  // Interactive Video Demo States
  const [isPlayingDemo, setIsPlayingDemo] = React.useState(false);
  const [isPausedDemo, setIsPausedDemo] = React.useState(false);
  const [demoStep, setDemoStep] = React.useState(0);

  // Load from server in real-time on mount
  const handleLoadState = async () => {
    try {
      const resVehicles = await fetch('/api/vehicles');
      const vData = await resVehicles.json();
      if (Array.isArray(vData) && vData.length > 0) setVehicles(vData);

      const resLeads = await fetch('/api/leads');
      const lData = await resLeads.json();
      if (Array.isArray(lData)) setLeads(lData);

      const resBookings = await fetch('/api/bookings');
      const bData = await resBookings.json();
      if (Array.isArray(bData)) setBookings(bData);
    } catch (e) {
      console.warn('Backend server state loading deferred. Falling back to local dataset.', e);
    }
  };

  React.useEffect(() => {
    handleLoadState();

    // Check for saved user session
    const saved = localStorage.getItem('av_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        setIsAdmin(parsed.isAdmin);
      } catch (e) {
        console.error('Error parsing saved session', e);
      }
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('av_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme as 'dark' | 'light');
    }

    // Check for saved language preference
    const savedLang = localStorage.getItem('av_lang');
    if (savedLang) {
      setCurrentLang(savedLang as SupportedLanguage);
    }
  }, []);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setIsAdmin(user.isAdmin);
    localStorage.setItem('av_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('av_user_session');
    setActiveTab('home');
  };

  const handleUpdateUser = (updatedUser: UserSession) => {
    setCurrentUser(updatedUser);
    setIsAdmin(updatedUser.isAdmin);
    localStorage.setItem('av_user_session', JSON.stringify(updatedUser));
  };

  // Sync back submitted details
  const triggerNewLeadOnServer = async (newLead: any) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      const persisted = await res.json();
      setLeads((prev) => [persisted, ...prev]);
    } catch {
      // Local fallback
      const mockLead = {
        id: `local-ld-${Date.now()}`,
        status: 'New' as const,
        createdAt: new Date().toISOString(),
        notes: [],
        ...newLead
      };
      setLeads((prev) => [mockLead, ...prev]);
    }
  };

  const triggerNewBookingOnServer = async (newB: any) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newB)
      });
      const persisted = await res.json();
      setBookings((prev) => [persisted, ...prev]);
    } catch {
      // Local fallback
      const mockB = {
        id: `local-bk-${Date.now()}`,
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
        ...newB
      };
      setBookings((prev) => [mockB, ...prev]);
    }
  };

  const handleAIQueryMatch = async () => {
    setAiSearching(true);
    setAiMatches([]);
    setAiProse('');
    try {
      const res = await fetch('/api/ai/car-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: aiBudget,
          purpose: aiPurpose,
          passengers: aiPassengers,
          fuel: aiFuel,
          transmission: aiTrans
        })
      });
      const result = await res.json();
      setAiMatches(result.matches || []);
      setAiProse(result.assistantProse || '');
    } catch {
      // Rule-based fallback
      const picked = vehicles.filter(v => v.price <= parseInt(aiBudget)).slice(0, 2);
      setAiMatches(picked.map(p => ({
        id: p.id,
        inlineMatchReason: `Sangat cocok sebagai kendaraan prestisius hemat energi bertenaga ${p.fuel} untuk keluarga Anda.`
      })));
      setAiProse('Kami menyarankan opsi di atas berdasarkan kriteria anggaran dan kepraktisan penggunaan harian Anda.');
    } finally {
      setAiSearching(false);
    }
  };

  const handleNavClick = (tabId: string) => {
    setIsAdmin(false);
    if (['home', 'masalah-solusi', 'video-demo', 'testimoni'].includes(tabId)) {
      setActiveTab('home');
      setTimeout(() => {
        const element = document.getElementById(tabId + '-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      setActiveTab(tabId as any);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const t = TRANSLATIONS[currentLang];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark-theme bg-neutral-950 text-white' : 'light-theme bg-slate-50 text-slate-900'} font-sans selection:bg-red-600 selection:text-white antialiased`}>
      
      {/* 24. Header navbar global switcher inside */}
      <Navbar
        currentLang={currentLang}
        setLang={handleSetLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onNavClick={handleNavClick}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        setTheme={handleSetTheme}
      />

      {/* Main body rendering tabs switches */}
      {activeTab === 'admin' ? (
        currentUser?.isAdmin ? (
          <CRMAdmin
            initialLeads={leads}
            initialBookings={bookings}
            currentLang={currentLang}
            onLeadUpdated={() => handleLoadState()}
            onBookingUpdated={() => handleLoadState()}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        ) : (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdminAuth onLoginSuccess={handleLoginSuccess} lang={currentLang} />
          </div>
        )
      ) : (
        <>
          {activeTab === 'home' && (
            <div id="home-portal" className="space-y-16 pb-20">
              
              {/* cinematic hero slider bg banner */}
              <div id="hero-slider" className="relative relative h-[65vh] sm:h-[75vh] w-full bg-black overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1600"
                    alt="Luxury Car Showcase"
                    className="w-full h-full object-cover opacity-35"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/80"></div>
                </div>

                {/* Floating headline */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-4 sm:space-y-6">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest text-red-500 uppercase bg-red-500/10 border border-red-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full inline-block animate-pulse">
                    🏢 OFFICIAL AUTO VELOCE MOTOR HUB
                  </span>
                  <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter sm:tracking-tight">
                    {t.heroTitle}
                  </h1>
                  <p className="text-xs sm:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed">
                    {t.heroSub}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 sm:pt-4">
                    <button
                      onClick={() => setActiveTab('showroom')}
                      className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all border border-red-500/20 shadow-lg shadow-red-600/10 flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{t.viewCars}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('ai-assistant')}
                      className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-spin" />
                      <span>{t.aiMatch}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive AI Car Matcher Section (Home Integration) */}
              <div id="ai-quick-matcher" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-red-500 animate-pulse" />
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">{t.aiQuickMatcherTitle || 'AI Sales Advisor Matchmaker'}</h2>
                      <p className="text-xs text-neutral-400">{t.aiQuickMatcherSub || 'Temukan kecocokan unit ideal berdasarkan anggaran & gaya berkendara Anda.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">{t.aiBudgetLimit || 'Anggaran Batas Maksimal (IDR)'}</label>
                      <select
                        value={aiBudget}
                        onChange={(e) => setAiBudget(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-red-500 text-neutral-300"
                      >
                        <option value="500000000">Rp 500 Juta</option>
                        <option value="800000000">Rp 800 Juta</option>
                        <option value="1200000000">Rp 1.2 Miliar</option>
                        <option value="2000000000">Rp 2.0 Miliar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">{t.aiPassengersLabel || 'Kapasitas Penumpang'}</label>
                      <select
                        value={aiPassengers}
                        onChange={(e) => setAiPassengers(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300"
                      >
                        <option value="4">
                          {currentLang === 'id' ? 'Maksimal 4 Seats (Sport SUV)' : currentLang === 'zh' ? '最多 4 座 (运动 SUV)' : currentLang === 'ar' ? 'بحد أقصى 4 مقاعد (SUV رياضية)' : currentLang === 'ja' ? '最大4人乗り (スポーツSUV)' : 'Max 4 Seats (Sport SUV)'}
                        </option>
                        <option value="5">
                          {currentLang === 'id' ? 'Maksimal 5 Seats (Sedan / Crossover)' : currentLang === 'zh' ? '最多 5 座 (轿车/跨界车)' : currentLang === 'ar' ? 'بحد أقصى 5 مقاعد (سيدان / كروس أوفر)' : currentLang === 'ja' ? '最大5人乗り (セダン / クロスオーバー)' : 'Max 5 Seats (Sedan / Crossover)'}
                        </option>
                        <option value="7">
                          {currentLang === 'id' ? 'Maksimal 7 Seats (Luxury MPV)' : currentLang === 'zh' ? '最多 7 座 (豪华 MPV)' : currentLang === 'ar' ? 'بحد أقصى 7 مقاعد (MPV فاخرة)' : currentLang === 'ja' ? '最大7人乗り (高級MPV)' : 'Max 7 Seats (Luxury MPV)'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">{t.aiPurposeLabel || 'Tujuan & Gaya Penggunaan'}</label>
                      <input
                        type="text"
                        value={aiPurpose}
                        onChange={(e) => setAiPurpose(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleAIQueryMatch}
                      disabled={aiSearching}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all"
                    >
                      {aiSearching 
                        ? (currentLang === 'id' ? 'AI Sedang Menganalisis Katalog...' : currentLang === 'zh' ? 'AI正在分析车源目录...' : currentLang === 'ar' ? 'جاري تحليل الأسطول...' : currentLang === 'ja' ? 'AIがカタログ診断中...' : 'AI Analyzing Fleet Catalog...') 
                        : (t.aiQuickMatcherBtn || 'Analisis Kecocokan Unit Saya')}
                    </button>
                  </div>

                  {/* Recommendations Display inline on Home */}
                  {aiMatches.length > 0 && (
                    <div className="pt-6 border-t border-neutral-850 space-y-4">
                      <span className="text-[10px] font-extrabold tracking-widest text-[#fbbf24] uppercase block">
                        {t.aiQuickMatcherResult || 'Hasil Rekomendasi AI'}:
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiMatches.map((match) => {
                          const matchedCar = vehicles.find(v => v.id === match.id) || vehicles[0];

                          return (
                            <div key={match.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 flex gap-4">
                              <div className="w-20 h-16 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={matchedCar.images[0]} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-white">{matchedCar.name}</h4>
                                <span className="block text-[9px] text-[#fbbf24] mt-0.5">RP {matchedCar.price.toLocaleString('id-ID')}</span>
                                <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">{match.inlineMatchReason}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {aiProse && (
                        <p className="text-xs text-neutral-300 italic p-3 bg-neutral-950 border border-neutral-900 rounded-lg">
                          "{aiProse}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Masalah & Solusi */}
              <div id="masalah-solusi-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="text-center mb-12">
                  <span className="text-xs font-black tracking-widest text-red-500 uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded-full inline-block">
                    {t.problemsSolutionsTitle || 'MATRIKS TANTANGAN VS SOLUSI'}
                  </span>
                  <h2 className="text-3xl font-black mt-3 text-white">
                    {t.problemsSolutionsSub || 'Transparansi Penuh untuk Kepuasan Maksimal'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-2 max-w-2xl mx-auto">
                    {t.problemsSolutionsDesc || 'Kami memahami bahwa membeli mobil premium dipenuhi oleh rintangan. Lihat bagaimana Auto Veloce menyelesaikan masalah klasik Anda.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Masalah (Style Merah) */}
                  <div className="p-8 bg-neutral-900/60 border border-red-900/30 rounded-3xl shadow-xl shadow-red-950/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all duration-500"></div>
                    
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                      <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-red-500">
                          {currentLang === 'id' ? 'Masalah Klasik Showroom' : 'Classic Dealership Pain Points'}
                        </h3>
                        <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">
                          {currentLang === 'id' ? 'Rintangan di Dealer Konvensional' : 'Obstacles in Conventional Dealerships'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-200">
                            {currentLang === 'id' ? 'Manipulasi Kilometer & Riwayat Tabrak' : 'Odometer Tampering & Crash History'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Showroom nakal sering memundurkan angka odometer dan menyembunyikan sasis bengkok bekas benturan ekstrem atau terendam banjir.' 
                              : 'Unscrupulous dealers often reset mileage counters and hide structural frame damage from major accidents or flood history.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-200">
                            {currentLang === 'id' ? 'Sengketa Surat-Surat & Pajak Mati' : 'Legal Document Disputes & Expired Tax'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Kekhawatiran fisik dokumen BPKB palsu, STNK diblokir e-TLE, atau kendaraan tersangkut jaminan ganda yang menyusahkan pengurusan Bapenda.' 
                              : 'Anxiety over fake titles, e-TLE traffic blocks, or double bank guarantees making tax renewals at Samsat a major headache.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-200">
                            {currentLang === 'id' ? 'Proses Kredit Berbelit & Bunga Jebakan' : 'Complex Financing & Hidden Markup Fees'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Perhitungan leasing yang ditutup-tutupi, biaya admin siluman, serta kenaikan suku bunga tiba-tiba saat approval tanpa persetujuan awal.' 
                              : 'Opaque financing templates, stealth processing fees, and sudden interest hikes right during approval with no warnings.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-200">
                            {currentLang === 'id' ? 'Kualitas Detailing Salon yang Kilat & Cepat Pudar' : 'Low-Tier Cosmeticians & Fading Polishes'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Hanya dilapisi silikon murah pengilap sementara yang akan luntur dan memunculkan kembali baret pusaran cuci setelah diguyur hujan pertama.' 
                              : 'Temporary silicone sprays that wash away, exposing swirl marks and micro-scratches right after the very first rain wash.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solusi (Style Hijau) */}
                  <div className="p-8 bg-neutral-900/60 border border-emerald-900/30 rounded-3xl shadow-xl shadow-emerald-950/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>

                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-emerald-400">
                          {currentLang === 'id' ? 'Solusi Standar Auto Veloce' : 'Auto Veloce Premium Solution'}
                        </h3>
                        <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">
                          {currentLang === 'id' ? 'Keamanan & Transparansi Eksklusif VIP' : 'Exclusive Security & VIP Experience'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-100">
                            {currentLang === 'id' ? 'Uji Kelayakan Emas 150+ Titik Inspeksi' : '150+ Point Certified Gold Appraisal'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Setiap mobil wajib melewati penilaian komputerisasi sasis penjamin bebas tabrakan terstruktur, karat air garam, dan odometer dijamin asli.' 
                              : 'Every vehicle passes strict multi-point structural checks ensuring no frame alterations, salt rust, and 100% verified mileage.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-100">
                            {currentLang === 'id' ? 'Garansi Buyback Keaslian Surat 100%' : '100% Legal Document Buyback Guarantee'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Jaminan hitam di atas putih perlindungan hukum penuh. Showroom akan membeli kembali unit 100% jika surat terbukti bermasalah.' 
                              : 'Solid written legal assurance. Auto Veloce will purchase back the vehicle at full price if paperwork issues arise.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-100">
                            {currentLang === 'id' ? 'Simulasi Transparan Didukung AI Gemini' : 'Transparent Credit Guided by Gemini Server'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Gunakan kalkulator kredit akurat kami, terhubung langsung dengan bunga Syariah flat. Tidak ada biaya siluman atau provisi ghaib.' 
                              : 'Enjoy clear monthly calculations mapped by AI, linked directly with flat Syariah rates. No surprise markups or phantom fees.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-100">
                            {currentLang === 'id' ? 'Platinum Nano Ceramic Coating 9H+' : '9H+ Double Shield Nano Ceramic Shield'}
                          </h4>
                          <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                            {currentLang === 'id' 
                              ? 'Mengoreksi cat kusam dengan pemolesan multi-tahap dan melapisinya dengan formula silica cair premium bergaransi kilau ekstrim 3 tahun.' 
                              : 'Multi-stage paint correction coated with premium liquid silica formula, providing an extreme high gloss with a 3-year warranty.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Promos & Campaign section */}
              <div id="promos-carousel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">FLASH DEALS & CAMPAIGNS</span>
                    <h3 className="text-2xl font-black text-white mt-1">{t.limitedPromos}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {INITIAL_PROMOS.map((promo) => {
                    const localizedTitle = currentLang === 'id' ? promo.title : (
                      promo.id === 'pr-01'
                        ? (currentLang === 'zh' ? '独立月超低首付优惠' : currentLang === 'ar' ? 'عرض الدفعة الأولى المخفضة للاستقلال' : currentLang === 'ja' ? '独立記念 低頭金プロモ' : 'Independence Month Low DP Promo')
                        : (currentLang === 'zh' ? '双层防护漆面美容套餐' : currentLang === 'ar' ? 'مجموعة تلميع وحماية درع مزدوج' : currentLang === 'ja' ? 'ダブルシールド ディテイリングスイート' : 'Double Shield Detailing Suite')
                    );
                    const localizedDesc = currentLang === 'id' ? promo.description : (
                      promo.id === 'pr-01'
                        ? (currentLang === 'zh' ? '在推广月期间，享受低至 15% 的首付分期，此优惠由 BCA Finance 独家提供。' : currentLang === 'ar' ? 'تقدم بطلب تقسيط بدفعة أولى منخفضة تصل إلى 15%، حصرياً عبر جهة التمويل BCA Finance خلال شهر العرض.' : currentLang === 'ja' ? 'プロモーション月間中、BCA Financeリーシング限定で、頭金最低15%からの分割払いをお申し込みいただけます。' : 'Apply for monthly installments with a down payment as low as 15%, exclusive for BCA Finance leasing during the promo month.')
                        : (currentLang === 'zh' ? '凡在 Auto Veloce 直接购买车辆，均可享受 3 年期纳米陶瓷涂层套餐立减 20% 的优惠。' : currentLang === 'ar' ? 'احصل على خصم فوري بنسبة 20% على باقة طلاء نانو سيراميك لمدة 3 سنوات لأي سيارة تشتريها مباشرة من أوتو فيلوتشي.' : currentLang === 'ja' ? 'Auto Veloceで直接ご購入いただいた車両を対象に、3年間耐久ナノセラミックコーティングパッケージが20%即時割引になります。' : 'Get an instant 20% discount on a 3-year Nano Ceramic Coating package for any vehicle purchased directly at Auto Veloce.')
                    );
                    const localizedExpiry = currentLang === 'id' ? promo.expiryDate : (
                      promo.id === 'pr-01'
                        ? (currentLang === 'zh' ? '2026年6月30日' : currentLang === 'ar' ? '30 يونيو 2026' : currentLang === 'ja' ? '2026年6月30日' : '30 June 2026')
                        : (currentLang === 'zh' ? '2026年7月15日' : currentLang === 'ar' ? '15 يوليو 2026' : currentLang === 'ja' ? '2026年7月15日' : '15 July 2026')
                    );
                    return (
                      <div
                        key={promo.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl hover:border-red-500/20 transition-all flex flex-col md:flex-row"
                      >
                        <div className="md:w-1/2 aspect-video md:aspect-auto">
                          <img src={promo.bannerImage} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="p-6 md:w-1/2 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{t.promoActive}</span>
                            <h4 className="font-bold text-lg text-white mt-2.5">{localizedTitle}</h4>
                            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{localizedDesc}</p>
                          </div>
                          <div className="border-t border-neutral-850 pt-3 mt-4 text-[10px] text-neutral-500 uppercase font-bold text-right">
                            {t.promoUntil}: {localizedExpiry}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Video Demo Section */}
              <div id="video-demo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="text-center mb-6 sm:mb-12">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest text-red-500 uppercase bg-red-500/10 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-500/20 rounded-full inline-block">
                    {currentLang === 'id' ? 'EKSPLORASI FITUR INTERAKTIF' : 'INTERACTIVE FEATURE WALKTHROUGH'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-2 sm:mt-3 text-white">
                    {t.videoDemoTitle || 'Eksplorasi Video Tur Showroom & Fitur'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-2 max-w-2xl mx-auto">
                    {t.videoDemoSub || 'Tonton langsung kualitas detail unit premium dan fasilitas salon coating detailing kami.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
                  {/* Left: Beautiful Mock Video Player Screen */}
                  <div id="mock-video-player" className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 pb-6 sm:pb-4 md:pb-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {/* Simulated Video Frame */}
                    <div className="relative aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                      {isPlayingDemo ? (
                        /* Simulated Playing Screen - Interactive Step Walkthrough */
                        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 w-full h-full">
                          {/* Video Header info */}
                          <div className="flex items-center justify-between z-10">
                            <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                              {currentLang === 'id' ? 'SEDANG MEMUTAR DEMO' : 'PLAYING PORTAL DEMO'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Step {demoStep + 1} / 4
                            </span>
                          </div>

                          {/* Interactive Display Content depending on current active step */}
                          <div className="my-auto text-center px-4 py-2">
                            {demoStep === 0 && (
                              <div className="space-y-3">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                  <Search className="w-6 h-6 text-red-500" />
                                </div>
                                <h4 className="font-extrabold text-base text-white">{currentLang === 'id' ? '1. Showroom & Katalog Mobil Premium' : '1. Premium Showroom & Catalog'}</h4>
                                <p className="text-[11px] text-neutral-300 max-w-md mx-auto leading-relaxed">
                                  {currentLang === 'id'
                                    ? 'Filter pintar berdasarkan harga, merek, bahan bakar, dan ketersediaan cabang showroom terdekat dengan update real-time.'
                                    : 'Smart filters mapping prices, brands, fuel systems, and nearest showroom branch availability in real-time.'}
                                </p>
                                <div className="inline-flex items-center gap-1.5 p-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded-full text-[9px] text-neutral-400">
                                  <Tv className="w-3.5 h-3.5 text-red-500" />
                                  <span>Desktop Responsive Grid Layout</span>
                                </div>
                              </div>
                            )}

                            {demoStep === 1 && (
                              <div className="space-y-3">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                  <Sparkles className="w-6 h-6 text-red-500" />
                                </div>
                                <h4 className="font-extrabold text-base text-white">{currentLang === 'id' ? '2. Smart AI Matchmaker Assistant' : '2. Smart AI Matchmaker Assistant'}</h4>
                                <p className="text-[11px] text-neutral-300 max-w-md mx-auto leading-relaxed">
                                  {currentLang === 'id'
                                    ? 'Kecerdasan buatan Gemini Server menganalisis anggaran, kebutuhan kursi penumpang, serta tujuan berkendara guna mencocokkan unit terbaik.'
                                    : 'Gemini server integrations reading budgets, seat needs, and driving habits to suggest handpicked elite vehicles.'}
                                </p>
                                <div className="inline-flex items-center gap-1.5 p-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded-full text-[9px] text-neutral-400">
                                  <Smartphone className="w-3.5 h-3.5 text-red-500" />
                                  <span>Mobile Optimized Floating Console</span>
                                </div>
                              </div>
                            )}

                            {demoStep === 2 && (
                              <div className="space-y-3">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                  <Calendar className="w-6 h-6 text-red-500" />
                                </div>
                                <h4 className="font-extrabold text-base text-white">{currentLang === 'id' ? '3. Reservasi Detailing & Salon Mewah' : '3. Detailing & Ceramic Scheduler'}</h4>
                                <p className="text-[11px] text-neutral-300 max-w-md mx-auto leading-relaxed">
                                  {currentLang === 'id'
                                    ? 'Pilih paket salon mobil, tentukan tanggal, jam kunjungan cabang terdekat, dan submit reservasi instan tanpa ribet antre.'
                                    : 'Select detailing suites, match ideal dates/hours, and submit bookings directly to nearest branch calendars.'}
                                </p>
                                <div className="inline-flex items-center gap-1.5 p-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded-full text-[9px] text-neutral-400">
                                  <Laptop className="w-3.5 h-3.5 text-red-500" />
                                  <span>Integrated Schedulers & Calendars</span>
                                </div>
                              </div>
                            )}

                            {demoStep === 3 && (
                              <div className="space-y-3">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                  <DollarSign className="w-6 h-6 text-red-500" />
                                </div>
                                <h4 className="font-extrabold text-base text-white">{currentLang === 'id' ? '4. Portal Penaksir Trade-In Instan' : '4. Instant Trade-In Valuation Engine'}</h4>
                                <p className="text-[11px] text-neutral-300 max-w-md mx-auto leading-relaxed">
                                  {currentLang === 'id'
                                    ? 'Hitung taksiran harga pasar mobil lama Anda secara instan dan ajukan tukar tambah langsung ke model target impian Anda.'
                                    : 'Value your current vehicle instantly, mapping expected payouts and linking seamless tradeup credit pathways.'}
                                </p>
                                <div className="inline-flex items-center gap-1.5 p-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded-full text-[9px] text-neutral-400">
                                  <Smartphone className="w-3.5 h-3.5 text-red-500" />
                                  <span>Dual Screen Handshake Wizard</span>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ) : (
                        /* Static Player Cover (Displays the generated high-quality mockup screenshot!) */
                        <div className="absolute inset-0 z-0 w-full h-full">
                          <img
                            src="/src/assets/images/auto_veloce_demo_1783578187191.jpg"
                            alt="Auto Veloce Tool Screenshot Demo Cover"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20 flex flex-col justify-between p-6 z-10 w-full h-full">
                            <span className="self-end text-[9px] font-black uppercase text-white bg-red-600 border border-red-500/30 px-2 py-1 rounded">
                              {currentLang === 'id' ? 'TOMBOL DEMO INTERAKTIF' : 'INTERACTIVE WALKTHROUGH'}
                            </span>
                            
                            {/* Center Play Button Overlay */}
                            <button
                              onClick={() => { setIsPlayingDemo(true); setDemoStep(0); }}
                              className="mx-auto w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center border border-red-400/40 shadow-2xl shadow-red-600/50 transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                            >
                              <Play className="w-7 h-7 text-white fill-current ml-1" />
                            </button>

                            <div className="text-center">
                              <p className="text-[11px] font-extrabold text-white tracking-wider uppercase">
                                {currentLang === 'id' ? 'Tonton Simulasi Demo Portal Auto Veloce' : 'Click to Play the Portal Interaction Demo'}
                              </p>
                              <p className="text-[9px] text-neutral-400 mt-0.5">
                                {currentLang === 'id' ? 'Screenshot interaktif tampilan platform web desktop & mobile' : 'Interactive view of our modular dashboard frameworks'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {isPlayingDemo && (
                      <div className="z-10 flex flex-col md:flex-row items-center justify-between border-t border-neutral-800 pt-4 mt-4 flex-wrap gap-2 px-4 pb-4">
                        {/* Player bar simulator */}
                        <div className="flex-1 min-w-0 mr-0 md:mr-4 w-full md:w-auto">
                          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600 transition-all duration-500" 
                              style={{ width: `${((demoStep + 1) / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 w-full md:w-auto justify-center md:justify-end">
                          <button 
                            onClick={() => setDemoStep((prev) => (prev > 0 ? prev - 1 : 3))}
                            className="px-2 py-1 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-neutral-300 bg-neutral-900 border border-neutral-800 rounded hover:text-white"
                          >
                            {currentLang === 'id' ? 'Mundur' : 'Prev'}
                          </button>
                          <button 
                            onClick={() => setDemoStep((prev) => (prev < 3 ? prev + 1 : 0))}
                            className="px-2 py-1 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            {currentLang === 'id' ? 'Lanjut' : 'Next'}
                          </button>
                          <button 
                            onClick={() => setIsPausedDemo(!isPausedDemo)}
                            className="px-2 py-1 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-neutral-400 bg-neutral-950/80 rounded hover:text-white"
                          >
                            {isPausedDemo ? (currentLang === 'id' ? 'Putar' : 'Play') : (currentLang === 'id' ? 'Pause' : 'Pause')}
                          </button>
                          <button 
                            onClick={() => { setIsPlayingDemo(false); setDemoStep(0); setIsPausedDemo(false); }}
                            className="px-2 py-1 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-neutral-400 bg-neutral-950/80 rounded hover:text-white"
                          >
                            {currentLang === 'id' ? 'Tutup' : 'Close'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Right: Detailed device spec cards */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 hover:border-red-500/20 transition-all">
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 h-11 w-11 flex-shrink-0 flex items-center justify-center">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">
                          {currentLang === 'id' ? 'Desktop Hub Dashboard' : 'Desktop Hub Dashboard'}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                          {currentLang === 'id'
                            ? 'Dilengkapi dengan catalog bento grid lapis ganda, form kalkulator asuransi leasing instan, serta integrasi detail unit yang sangat lega.'
                            : 'Fitted with double-tier bento catalogs, instant insurance and leasing options, and broad detailed high-definition car specs.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 hover:border-red-500/20 transition-all">
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 h-11 w-11 flex-shrink-0 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">
                          {currentLang === 'id' ? 'Mobile App-Style Interface' : 'Mobile App-Style Interface'}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                          {currentLang === 'id'
                            ? 'Didesain optimal untuk layar sentuh ponsel pintar Anda dengan laci drawer menu responsif ganda, tombol floating WhatsApp direct route, dan formulir ringkas.'
                            : 'Optimized touch experience with responsive double-action menu drawer, floating direct WhatsApp router and rapid inputs.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-red-500/10 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      <span className="text-[9px] font-black tracking-widest text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20 px-2 py-0.5 rounded uppercase inline-block mb-3">
                        {currentLang === 'id' ? 'INTEGRASI ASISTEN AI' : 'GEMINI INTEGRATED'}
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {currentLang === 'id'
                          ? 'Dapatkan jawaban instan seputar unit mobil idaman Anda kapan saja. Silakan klik tombol "AI Car Matcher" untuk berkonsultasi langsung secara privat!'
                          : 'Receive instant advice on your luxury vehicles of interest anytime. Simply trigger our interactive "AI Car Matcher" module.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Trust us cards */}
              <div id="why-trust-factors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <span className="text-xs uppercase font-extrabold text-red-500 bg-red-500/10 border border-red-500/10 px-3 py-1.5 rounded-full">{t.trustTitle}</span>
                  <p className="text-neutral-400 mt-2 text-xs">{t.trustSub}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-3">
                    <ShieldCheck className="w-8 h-8 text-red-500 mx-auto" />
                    <h4 className="font-bold text-lg text-white">{t.trustCard1Title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {t.trustCard1Desc}
                    </p>
                  </div>

                  <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-3">
                    <Award className="w-8 h-8 text-red-500 mx-auto" />
                    <h4 className="font-bold text-lg text-white">{t.trustCard2Title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {t.trustCard2Desc}
                    </p>
                  </div>

                  <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-3 col-span-2 md:col-span-1">
                    <Scale className="w-8 h-8 text-red-500 mx-auto" />
                    <h4 className="font-bold text-lg text-white">{t.trustCard3Title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {t.trustCard3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collapsible FAQ sections */}
              <div id="faq-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest">{t.faq}</span>
                  <h3 className="text-2xl font-black text-white mt-1">{t.faqTitle}</h3>
                </div>

                <div className="space-y-3">
                  {INITIAL_FAQS.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    const localizedQuestion = currentLang === 'id' ? faq.question : (
                      faq.id === 'f-01'
                        ? (currentLang === 'zh' ? '所有车辆文件是否都保证真实且在法律上有效？' : currentLang === 'ar' ? 'هل جميع مستندات وأوراق السيارات مضمونة ومعتمدة قانونياً؟' : currentLang === 'ja' ? 'すべての車両書類は本物であり、法的に有効であることが保証されていますか？' : 'Are all vehicle documents guaranteed to be authentic and legally valid?')
                        : (currentLang === 'zh' ? '本网站的试驾预约分流系统是如何工作的？' : currentLang === 'ar' ? 'كيف يعمل نظام توجيه وحجز مواعيد تجربة القيادة على هذا الموقع؟' : currentLang === 'ja' ? 'このウェブサイトの試乗予約転送システムはどのように機能しますか？' : 'How does the test drive booking routing system on this website work?')
                    );
                    const localizedAnswer = currentLang === 'id' ? faq.answer : (
                      faq.id === 'f-01'
                        ? (currentLang === 'zh' ? '当然。所有进入展厅的车辆都经过了 Form A、发票、原装 STNK 和 BPKB 的物理检查，并通过了 Samsat Polda Metro Jaya 的防伪验证。如果文件出现问题，我们承诺 100% 回购。' : currentLang === 'ar' ? 'بالتأكيد. تخضع كل سيارة تدخل صالتنا لفحوصات مادية لـ Form A، الفاتورة، وأوراق STNK و BPKB الأصلية، مع اجتياز التحقق من التزوير لدى Samsat Polda Metro Jaya. ونضمن إعادة الشراء بنسبة 100% في حال حدوث أي مشاكل بالمستندات.' : currentLang === 'ja' ? 'もちろんです。ショールームに入庫するすべての車両は、Form A、請求書、オリジナルのSTNK、BPKBの物理的な検査を受け、Samsat Polda Metro Jayaの偽造検証に合格しています。書類に問題が発生した場合は、100%買戻しを保証します。' : 'Absolutely. Every unit entering our showroom has undergone physical checks of Form A, invoice, original STNK, and BPKB, passing forgery verification from Samsat Polda Metro Jaya. We guarantee a 100% buyback if document issues occur.')
                        : (currentLang === 'zh' ? '我们的智能 WhatsApp 路由系统将根据车辆可用情况及您最近的展厅分支机构位置，将您的数据发送给最专业的销售顾问，以确保您享受到一流的私人定制服务。' : currentLang === 'ar' ? 'يقوم نظام توجيه واتساب الذكي لدينا بتوجيه بياناتك إلى مستشار خبير بناءً على توفر السيارة وموقع أقرب فرع صالة عرض إليك لضمان تقديم خدمة خاصة من الدرجة الأولى.' : currentLang === 'ja' ? '当社のインテリジェントなWhatsApp転送システムは、車両の空き状況と最寄りのショールーム店舗 of Auto Veloceの場所に基づいて、お客様のデータを専門のアドバイザーに転送し、一流のプライベートサービスを保証します。' : 'Our data routing system routes your request to an expert Advisor specialized in that brand and branch to guarantee a private service.')
                    );

                    return (
                      <div key={faq.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all">
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-neutral-200 hover:text-white"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-red-500" />
                            <span>{localizedQuestion}</span>
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-450" /> : <ChevronDown className="w-4 h-4 text-neutral-450" />}
                        </button>
                        {isOpen && (
                          <div className="px-10 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-950 pt-3 bg-neutral-950/20">
                            {localizedAnswer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Testimonials */}
              <div id="testimoni-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="text-center mb-10">
                  <span className="text-xs font-black text-red-500 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-block">
                    {t.reviews}
                  </span>
                  <h3 className="text-3xl font-black text-white mt-3">{t.collectorTitle}</h3>
                  <p className="text-xs text-neutral-400 mt-2">{t.collectorSub}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {INITIAL_TESTIMONIALS.map((testi) => {
                    const localizedProfession = currentLang === 'id' ? testi.profession : (
                      testi.id === 't-01' ? (currentLang === 'zh' ? '房地产财务总监' : currentLang === 'ar' ? 'مدير الشؤون المالية العقارية' : currentLang === 'ja' ? '不動産财务取締役' : 'Property Finance Director') :
                      testi.id === 't-02' ? (currentLang === 'zh' ? '艺术收藏家与创意人' : currentLang === 'ar' ? 'جامعة فنون وناشطة إبداعية' : currentLang === 'ja' ? 'アートコレクター兼クリエイター' : 'Art Collector & Creative Enthusiast') :
                      testi.id === 't-03' ? (currentLang === 'zh' ? '科技创始人与天使投资人' : currentLang === 'ar' ? 'مؤسس تكنولوجي ومستثمر ملاك' : currentLang === 'ja' ? 'テックファウンダー兼エンジェル投資家' : 'Tech Founder & Angel Investor') :
                      (currentLang === 'zh' ? '专科医生与诊所企业家' : currentLang === 'ar' ? 'طبيبة أخصائية وسيدة أعمال عيادات' : currentLang === 'ja' ? '専門医兼クリニック経営者' : 'Medical Specialist & Clinic Entrepreneur')
                    );
                    const localizedFeedback = currentLang === 'id' ? testi.feedback : (
                      testi.id === 't-01' ? (currentLang === 'zh' ? '阿尔法（Alphard）的置换过程非常快速且透明。他们的独立评估师非常专业，余款立刻由 BCA Finance 资助，利率非常友好。' : currentLang === 'ar' ? 'كانت عملية استبدال سيارة Alphard سريعة وشفافة للغاية. وكان المقيم المستقل لديهم محترفاً جداً، وتم تمويل المبلغ المتبقي على الفور من قبل BCA Finance بأسعار فائدة مناسبة.' : currentLang === 'ja' ? 'アルファードの下取りプロセスは非常に迅速で透明性がありました。独立した査定士は非常にプロフェッショナルで、残金はすぐにBCA Financeから低金利で融資されました。' : 'The Alphard trade-in process was very fast and transparent. Their independent appraiser was highly professional, and the remaining balance was immediately funded by BCA Finance with friendly interest rates.') :
                      testi.id === 't-02' ? (currentLang === 'zh' ? '低里程的宝马 5 系珍藏车。内饰极其干净，就像刚出厂的新车一样。' : currentLang === 'ar' ? 'سيارة بي إم دبليو الفئة الخامسة المخزنة بعداد قليل جداً. حالة المقصورة الداخلية نظيفة للغاية وكأنها سيارة جديدة خرجت للتو من المصنع.' : currentLang === 'ja' ? '低走行のBMW 5シリーズの極上車。インテリアは非常に清潔で、まるで工場から出たばかりの新車のようです。' : 'Low mileage BMW 5 Series garage queen. The interior is pristine and immaculate, just like a brand new car fresh from the factory.') :
                      testi.id === 't-03' ? (currentLang === 'zh' ? 'Auto Veloce 的 VIP 租车服务令人惊叹。送车及时，司机着装整洁，且非常清楚雅加达至万隆的最快路线。' : currentLang === 'ar' ? 'خدمة تأجير السيارات لكبار الشخصيات (VIP) في أوتو فيلوتشي رائعة ومذهلة حقاً. توصيل في الوقت المحدد مع سائق يرتدي ملابس أنيقة ويفهم تماماً أسرع الطرق بين جاكرتا وباندونغ.' : currentLang === 'ja' ? 'Auto VeloceのVIPレンタルサービスは本当に素晴らしいです。時間に正確な配送で、身だしなみの整った運転手がジャカルタ〜バンドン間の最速ルートを熟知していました。' : 'The VIP Rental service at Auto Veloce is absolutely incredible. Prompt delivery with a sharply-dressed chauffeur who knows the fastest Jakarta-Bandung routes.') :
                      (currentLang === 'zh' ? '我为我的 SUV 预订了白金级纳米陶瓷涂层。做工精度极高，疏水荷叶效应非常出色，还免费清洗了发动机舱！' : currentLang === 'ar' ? 'لقد طلبت طلاء نانو سيراميك البلاتيني لسيارتي الرياضية متعددة الاستخدامات (SUV). دقة العمل مذهلة، وتأثير طرد المياه رائع للغاية، مع تنظيف مجاني لحجرة المحرك!' : currentLang === 'ja' ? 'SUV用にプラチナナノセラミックコーティングを注文しました。仕上がりは精密で、疎水効果（撥水）は素晴らしく、エンジンルームの無料清掃まで付いていました！' : 'I ordered the Platinum Nano Ceramic Coating for my SUV. The precision of workmanship is amazing, the hydrophobic water-beading effect is outstanding, and it came with a free engine bay cleaning!')
                    );

                    return (
                      <div key={testi.id} className="p-4 sm:p-6 bg-neutral-900 border border-neutral-800 rounded-3xl relative shadow-xl hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between group">
                        <div className="absolute top-4 right-4 text-neutral-800 group-hover:text-red-500/10 transition-colors pointer-events-none">
                          <Quote className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                        </div>
                        <div className="space-y-2 sm:space-y-4">
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: testi.rating }).map((_, i) => (
                              <ThumbsUp key={i} className="w-3 h-3 text-amber-500 fill-current" />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed italic">
                            "{localizedFeedback}"
                          </p>
                        </div>
                        <div className="border-t border-neutral-850 pt-4 mt-4 sm:mt-6 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-600/10 flex items-center justify-center border border-red-500/20">
                            <User className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <span className="block font-bold text-xs text-white">{testi.customerName}</span>
                            <span className="block text-[10px] text-neutral-500">{localizedProfession}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section: Call To Action (CTA) paling bawah */}
              <div id="cta-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
                <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 group">
                  {/* Decorative glowing gradient */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/15 transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="space-y-4 max-w-2xl z-10">
                    <span className="text-xs font-black tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-block uppercase">
                      {currentLang === 'id' ? 'KONSULTASI VIP GRATIS' : 'FREE VIP CONSULTATION'}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                      {t.finalCTATitle || 'Siap menemukan kendaraan terbaik untuk kebutuhan Anda?'}
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {t.finalCTASub || 'Hubungi Sales kami sekarang atau jadwalkan kunjungan Anda ke cabang terdekat.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto z-10 shrink-0">
                    <button
                      onClick={() => {
                        setActiveTab('showroom');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                      <Search className="w-4 h-4" />
                      <span>{t.viewCars || 'Lihat Semua Unit'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('ai-assistant');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-4 bg-neutral-950 hover:bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                      <span>{t.aiMatch || 'Konsultasi AI Matchmaker'}</span>
                    </button>
                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Auto%20Veloce%20Motor%2C%20saya%20tertarik%20dengan%20koleksi%20mobil%20premium%20Anda."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{currentLang === 'id' ? 'Hubungi Sales VIP' : 'Contact VIP Sales'}</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'showroom' && (
            <Showroom
              vehicles={vehicles}
              leasingPartners={INITIAL_LEASING_PARTNERS}
              currentLang={currentLang}
              onBookingSubmitted={(b) => triggerNewBookingOnServer(b)}
              onLeadSubmitted={(l) => triggerNewLeadOnServer(l)}
            />
          )}

          {activeTab === 'rentals' && (
            <RentalService
              rentals={INITIAL_RENTAL_VEHICLES}
              currentLang={currentLang}
              onBookingSubmitted={(b) => triggerNewBookingOnServer(b)}
              onLeadSubmitted={(l) => triggerNewLeadOnServer(l)}
            />
          )}

          {activeTab === 'detailing' && (
            <DetailingService
              services={INITIAL_DETAILING_SERVICES}
              currentLang={currentLang}
              onBookingSubmitted={(b) => triggerNewBookingOnServer(b)}
              onLeadSubmitted={(l) => triggerNewLeadOnServer(l)}
            />
          )}

          {activeTab === 'trade-in' && (
            <TradeInWizard
              vehicles={vehicles}
              currentLang={currentLang}
              onLeadSubmitted={(l) => triggerNewLeadOnServer(l)}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <div className="py-12 bg-neutral-950 text-white min-h-[60vh] flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                
                <div className="text-center mb-8">
                  <span className="text-xs tracking-widest font-extrabold text-red-500 uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded-full inline-block">
                    SMART GEN-AI SALES ASSISTANT
                  </span>
                  <h2 className="text-3xl font-black mt-3">Interactive AI <span className="text-red-500">Matchmaker Console</span></h2>
                  <p className="text-xs text-neutral-400 mt-2">Pencocokan representasi mobil tangguh berdasarkan pertimbangan dinamis AI Gemini Server kami.</p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">Maksimal Anggaran Dana (IDR)</label>
                      <input
                        type="number"
                        value={aiBudget}
                        onChange={(e) => setAiBudget(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500"
                        placeholder="Contoh: 1200000000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">Kebutuhan Jumlah Kursi Penumpang</label>
                      <select
                        value={aiPassengers}
                        onChange={(e) => setAiPassengers(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none"
                      >
                        <option value="2">2 Seat (Roadster / Coupe)</option>
                        <option value="5">4-5 Seat (Sedan / Crossover)</option>
                        <option value="7">7 Seat (Premium Family SUV/MPV)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">Preferensi Bahan Bakar</label>
                      <select
                        value={aiFuel}
                        onChange={(e) => setAiFuel(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none"
                      >
                        <option value="Any">Apa Saja (Petrol / Hybrid / EV)</option>
                        <option value="Petrol">Bensin (Petrol)</option>
                        <option value="Electric">Listrik Murni (EV)</option>
                        <option value="Hybrid">Hybrid System</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5">Preferensi Sistem Transmisi</label>
                      <select
                        value={aiTrans}
                        onChange={(e) => setAiTrans(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none"
                      >
                        <option value="Any">Apa Saja (Auto / CVT / PDK / Manual)</option>
                        <option value="Automatic">Automatic (Torque Converter)</option>
                        <option value="PDK">Porsche Doppelkupplung (PDK Dual Clutch)</option>
                        <option value="CVT">CVT Smooth Drive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1.5 font-bold">Terangkan Kebutuhan Khusus / Agenda Berkendara Anda</label>
                    <textarea
                      value={aiPurpose}
                      onChange={(e) => setAiPurpose(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder={t.aiExplainPrompt || "Contoh: Saya membutuhkan mobil keluarga premium berkapasitas lega untuk perjalanan mudik tetapi stylish dikendarai harian ke kantor."}
                    ></textarea>
                  </div>

                  <button
                    onClick={handleAIQueryMatch}
                    className="w-full py-3 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>{aiSearching ? (t.aiSearchingText || 'AI ANALYSING FLEETS DATABASE...') : (t.aiGeminiButton || 'Minta Analisis AI Gemini')}</span>
                  </button>

                  {/* Recommendation output results page */}
                  {aiMatches.length > 0 && (
                    <div className="pt-6 border-t border-neutral-850 space-y-4">
                      <span className="text-[10px] uppercase font-black text-[#fbbf24] tracking-wider block">{t.aiRecommendationTitle || 'Daftar Rekomendasi Kendaraan Teroptimal:'}</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiMatches.map((res) => {
                          const item = vehicles.find((v) => v.id === res.id) || vehicles[0];

                          return (
                            <div key={res.id} className="p-4 bg-neutral-950 border border-neutral-850 rounded-2xl flex gap-4 hover:border-red-500/20 transition-all">
                              <div className="w-20 h-16 rounded overflow-hidden bg-neutral-900 flex-shrink-0">
                                <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-white">{item.name}</h4>
                                <span className="block text-[9px] text-[#fbbf24] mt-0.5">Rp {item.price.toLocaleString('id-ID')}</span>
                                <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">{res.inlineMatchReason}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {aiProse && (
                        <div className="p-4 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-red-500/10 rounded-xl">
                          <h5 className="text-[10px] font-bold text-neutral-400 mb-1 flex items-center gap-1 uppercase">💬 AI Advisor Summary:</h5>
                          <p className="text-xs text-neutral-300 leading-relaxed font-sans">{aiProse}</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* Global Contact & Sticky Routing WhatsApp Footer */}
      <footer className="bg-neutral-950 border-t border-semi border-neutral-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="p-1.5 bg-red-650 bg-red-600 rounded">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg text-white">AUTO <span className="text-red-500">VELOCE</span> MOTOR</span>
          </div>

          <p className="text-xs text-neutral-500 max-w-lg mx-auto">
            {t.whatsAppRouting}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">
            <span>Jakarta Outlet</span>
            <span className="text-neutral-600">•</span>
            <span>BSD Showroom</span>
            <span className="text-neutral-600">•</span>
            <span>Surabaya Hub</span>
            <span className="text-neutral-600">•</span>
            <span>Bandung Service SPA</span>
          </div>

          <div className="h-px bg-neutral-900 my-4 max-w-sm mx-auto"></div>

          <p className="text-[11px] text-neutral-500">
            © 2026 Auto Veloce Motor Group. All rights reserved. Premium Automotive Experience, Smarter Buying Journey.
          </p>
          <p className="text-[10px] text-neutral-600">
            Dibuat oleh <a href="https://contech.id" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline hover:text-red-400 font-bold transition-all">Contech ID</a>
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={currentLang}
      />

    </div>
  );
}
