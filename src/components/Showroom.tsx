import React from 'react';
import { Search, Compass, Calendar, Sparkles, SlidersHorizontal, Calculator, MessageSquare, ShieldCheck, FileText, CheckCircle2, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { Vehicle, LeasingPartner } from '../types';
import { SupportedLanguage, TRANSLATIONS, getLocalizedVehicle } from '../translations';

interface ShowroomProps {
  vehicles: Vehicle[];
  leasingPartners: LeasingPartner[];
  currentLang: SupportedLanguage;
  onBookingSubmitted: (booking: any) => void;
  onLeadSubmitted: (lead: any) => void;
}

export function Showroom({
  vehicles,
  leasingPartners,
  currentLang,
  onBookingSubmitted,
  onLeadSubmitted
}: ShowroomProps) {
  const t = TRANSLATIONS[currentLang];

  const localizedVehicles = React.useMemo(() => {
    return vehicles.map((v) => getLocalizedVehicle(v, currentLang));
  }, [vehicles, currentLang]);

  // Dynamic filter state
  const [search, setSearch] = React.useState('');
  const [selectedBrand, setSelectedBrand] = React.useState('Any');
  const [selectedCondition, setSelectedCondition] = React.useState('Any');
  const [selectedTransmission, setSelectedTransmission] = React.useState('Any');
  const [selectedFuel, setSelectedFuel] = React.useState('Any');
  const [selectedBranch, setSelectedBranch] = React.useState('Any');
  const [sortOption, setSortOption] = React.useState('newest');

  // Modal displays
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);
  const selectedVehicle = React.useMemo(() => {
    if (!selectedVehicleId) return null;
    return localizedVehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [selectedVehicleId, localizedVehicles]);
  const [showCalculator, setShowCalculator] = React.useState(false);
  const [showBooking, setShowBooking] = React.useState(false);

  // Credit calculator inputs
  const [calcDP, setCalcDP] = React.useState<number>(250000000);
  const [calcTenor, setCalcTenor] = React.useState<number>(36);
  const [selectedLeasing, setSelectedLeasing] = React.useState<string>('lp-01');
  const [aiExplainText, setAiExplainText] = React.useState('');
  const [aiExplaining, setAiExplaining] = React.useState(false);

  // Booking scheduler inputs
  const [bookingDate, setBookingDate] = React.useState('');
  const [bookingTime, setBookingTime] = React.useState('10:00');
  const [bookingBranch, setBookingBranch] = React.useState('Auto Veloce Jakarta Selatan');
  const [custName, setCustName] = React.useState('');
  const [custPhone, setCustPhone] = React.useState('');
  const [custEmail, setCustEmail] = React.useState('');
  const [custMethod, setCustMethod] = React.useState('Credit');
  const [bookingNotes, setBookingNotes] = React.useState('');
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  // AI SEO state
  const [seoTags, setSeoTags] = React.useState<{ title: string; description: string } | null>(null);
  const [generatingSeo, setGeneratingSeo] = React.useState(false);

  // Unique list generators for filter dropdowns
  const brands = ['Any', ...new Set(localizedVehicles.map((v) => v.brand))];
  const conditions = ['Any', 'New', 'Used'];
  const transmissions = ['Any', 'Automatic', 'CVT', 'PDK'];
  const fuels = ['Any', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const branches = ['Any', ...new Set(localizedVehicles.map((v) => v.branchName))];

  // Apply filters
  const filteredVehicles = localizedVehicles
    .filter((v) => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.brand.toLowerCase().includes(search.toLowerCase());
      const matchBrand = selectedBrand === 'Any' || v.brand === selectedBrand;
      const matchCond = selectedCondition === 'Any' || v.condition === selectedCondition;
      const matchTrans = selectedTransmission === 'Any' || v.transmission === selectedTransmission;
      const matchFuel = selectedFuel === 'Any' || v.fuel === selectedFuel;
      const matchBranch = selectedBranch === 'Any' || v.branchName === selectedBranch;

      return matchSearch && matchBrand && matchCond && matchTrans && matchFuel && matchBranch;
    })
    .sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return (b.promoPrice || b.price) - (a.promoPrice || a.price);
      if (sortOption === 'km-low') return a.km - b.km;
      return b.year - a.year; // newest
    });

  // Calculate values for financial table
  const carPrice = selectedVehicle ? (selectedVehicle.promoPrice || selectedVehicle.price) : 0;
  const activeLeasing = leasingPartners.find((l) => l.id === selectedLeasing) || leasingPartners[0];
  const baseRate = parseFloat(activeLeasing?.interestRate.split('-')[0]) || 4.25;
  const totalLoan = Math.max(0, carPrice - calcDP);
  const totalInterest = totalLoan * (baseRate / 100) * (calcTenor / 12);
  const mathInstallment = Math.round((totalLoan + totalInterest) / calcTenor);

  const triggerAIExplanation = async () => {
    if (!selectedVehicle) return;
    setAiExplaining(true);
    setAiExplainText('');
    try {
      const res = await fetch('/api/ai/credit-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleName: selectedVehicle.name,
          price: carPrice,
          dp: calcDP,
          tenor: calcTenor,
          monthlyInstallment: mathInstallment,
          interestRate: activeLeasing.interestRate,
          leasingName: activeLeasing.name
        })
      });
      const data = await res.json();
      setAiExplainText(data.explanation);
    } catch {
      setAiExplainText('Koneksi AI mengalami kendala. Mohon periksa jaringan Anda atau coba sesaat lagi.');
    } finally {
      setAiExplaining(false);
    }
  };

  const triggerAISeo = async () => {
    if (!selectedVehicle) return;
    setGeneratingSeo(true);
    try {
      const res = await fetch('/api/ai/seo-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carName: selectedVehicle.name,
          branchName: selectedVehicle.branchName
        })
      });
      const data = await res.json();
      setSeoTags(data);
    } catch {
      setSeoTags({
        title: `${selectedVehicle.name} Bekas Premium | Auto Veloce`,
        description: `Miliki ${selectedVehicle.name} dengan kondisi istimewa. Hubungi tim marketing kami sekarang untuk konsultasi.`
      });
    } finally {
      setGeneratingSeo(false);
    }
  };

  const submitBookingForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const payload = {
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      type: 'Test Drive',
      itemId: selectedVehicle.id,
      itemName: selectedVehicle.name,
      branchName: bookingBranch,
      date: bookingDate,
      time: bookingTime,
      assignedTo: 'sa-01', // Adrian default
      purchaseMethod: custMethod,
      notes: bookingNotes
    };

    onBookingSubmitted(payload);

    // Also register lead inside CRM
    onLeadSubmitted({
      name: custName,
      whatsApp: custPhone,
      email: custEmail,
      type: 'Test Drive',
      score: 'Hot',
      assignedTo: 'sa-01',
      details: {
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        message: `Booking Test Drive dijadwalkan pada ${bookingDate} jam ${bookingTime}. Pilihan metode beli: ${custMethod}. Notes: ${bookingNotes}`
      }
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBooking(false);
    }, 3000);
  };

  return (
    <div id="showroom-portal" className="bg-neutral-950 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="showroom-header" className="text-center mb-10">
          <span className="text-xs tracking-widest font-extrabold text-red-500 uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded-full">
            VIP EXCLUSIVE GARAGE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mt-4 tracking-tight">
            {t.veloceCollectionTitle.includes('VELOCE') ? (
              <>
                {t.veloceCollectionTitle.split('VELOCE')[0]}
                <span className="text-red-500 bg-clip-text">VELOCE</span>
                {t.veloceCollectionTitle.split('VELOCE')[1]}
              </>
            ) : (
              t.veloceCollectionTitle
            )}
          </h1>
          <p className="text-neutral-400 mt-3 text-base max-w-2xl mx-auto">
            {t.veloceCollectionSub}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div id="filter-wrapper" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-5 h-5 text-red-500" />
            <span className="font-bold tracking-wide">Advanced Filtering & Real-time Database Search</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1.5">{t.searchPlaceholder}</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="BMW, Alphard, SUV..."
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1.5">{t.brand}</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-3 text-sm focus:border-red-500 focus:outline-none transition-all"
              >
                <option value="Any">{currentLang === 'id' ? 'Semua Merek' : currentLang === 'zh' ? '所有品牌' : currentLang === 'ar' ? 'جميع الماركات' : currentLang === 'ja' ? 'すべてのブランド' : 'All Brands'}</option>
                {brands.slice(1).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1.5">{t.condition}</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-3 text-sm focus:border-red-500 focus:outline-none transition-all"
              >
                <option value="Any">{t.any}</option>
                {conditions.slice(1).map((c) => (
                  <option key={c} value={c}>
                    {c === 'Used'
                      ? (currentLang === 'id' ? 'Mobil Bekas' : currentLang === 'zh' ? '二手车' : currentLang === 'ar' ? 'مستعملة' : currentLang === 'ja' ? '中古車' : 'Used Car')
                      : (currentLang === 'id' ? 'Mobil Baru' : currentLang === 'zh' ? '全新车' : currentLang === 'ar' ? 'جديدة' : currentLang === 'ja' ? '新車' : 'New Car')}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1.5">
                {currentLang === 'id' ? 'URUTKAN' : currentLang === 'zh' ? '排序' : currentLang === 'ar' ? 'ترتيب' : currentLang === 'ja' ? '並び替え' : 'SORT BY'}
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-3 text-sm focus:border-red-500 focus:outline-none transition-all"
              >
                <option value="newest">
                  {currentLang === 'id' ? 'Tahun Terbaru' : currentLang === 'zh' ? '最新年份' : currentLang === 'ar' ? 'الأحدث سنة' : currentLang === 'ja' ? '最新年式' : 'Newest Year'}
                </option>
                <option value="price-low">
                  {currentLang === 'id' ? 'Harga Terendah' : currentLang === 'zh' ? '价格从低到高' : currentLang === 'ar' ? 'السعر من الأقل' : currentLang === 'ja' ? '価格の安い順' : 'Lowest Price'}
                </option>
                <option value="price-high">
                  {currentLang === 'id' ? 'Harga Tertinggi' : currentLang === 'zh' ? '价格从高到低' : currentLang === 'ar' ? 'السعر من الأعلى' : currentLang === 'ja' ? '価格の高い順' : 'Highest Price'}
                </option>
                <option value="km-low">
                  {currentLang === 'id' ? 'KM Terendah' : currentLang === 'zh' ? '最低里程' : currentLang === 'ar' ? 'أقل كيلومترات' : currentLang === 'ja' ? '走行距離の短い順' : 'Lowest KM'}
                </option>
              </select>
            </div>
          </div>

          {/* Collapsible details for branch, trans, fuel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-800/60">
            {/* Branch */}
            <div>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs focus:border-red-500 focus:outline-none transition-all"
              >
                <option value="Any">
                  {currentLang === 'id' ? 'Semua Cabang' : currentLang === 'zh' ? '所有门店' : currentLang === 'ar' ? 'جميع الفروع' : currentLang === 'ja' ? 'すべての店舗' : 'All Branches'}
                </option>
                {branches.slice(1).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div>
              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs focus:border-red-500 focus:outline-none transition-all"
              >
                <option value="Any">
                  {currentLang === 'id' ? 'Semua Transmisi' : currentLang === 'zh' ? '所有变速箱' : currentLang === 'ar' ? 'جميع أنواع الناقل' : currentLang === 'ja' ? 'すべてのトランスミッション' : 'All Transmissions'}
                </option>
                {transmissions.slice(1).map((tValue) => (
                  <option key={tValue} value={tValue}>
                    {tValue === 'Automatic' ? (currentLang === 'id' ? 'Otomatis' : currentLang === 'zh' ? '自动挡' : currentLang === 'ar' ? 'أوتوماتيك' : currentLang === 'ja' ? 'オートマ' : 'Automatic') :
                     tValue === 'Manual' ? (currentLang === 'id' ? 'Manual' : currentLang === 'zh' ? '手动挡' : currentLang === 'ar' ? 'يدوي' : currentLang === 'ja' ? 'マニュアル' : 'Manual') : tValue}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel */}
            <div>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs focus:border-red-500 focus:outline-none transition-all"
              >
                <option value="Any">
                  {currentLang === 'id' ? 'Semua Bahan Bakar' : currentLang === 'zh' ? '所有能源动力' : currentLang === 'ar' ? 'جميع أنواع الوقود' : currentLang === 'ja' ? 'すべての燃料タイプ' : 'All Fuel Types'}
                </option>
                {fuels.slice(1).map((f) => (
                  <option key={f} value={f}>
                    {f === 'Petrol' ? (currentLang === 'id' ? 'Bensin' : currentLang === 'zh' ? '汽油' : currentLang === 'ar' ? 'بنزين' : currentLang === 'ja' ? 'ガソリン' : 'Petrol') :
                     f === 'Diesel' ? (currentLang === 'id' ? 'Solar' : currentLang === 'zh' ? '柴油' : currentLang === 'ar' ? 'ديزل' : currentLang === 'ja' ? 'ディーゼル' : 'Diesel') :
                     f === 'Electric' ? (currentLang === 'id' ? 'Listrik' : currentLang === 'zh' ? '纯电动' : currentLang === 'ar' ? 'كهربائية' : currentLang === 'ja' ? '電気' : 'Electric') :
                     f === 'Hybrid' ? (currentLang === 'id' ? 'Hibrida' : currentLang === 'zh' ? '油电混合' : currentLang === 'ar' ? 'هجين' : currentLang === 'ja' ? 'ハイブリッド' : 'Hybrid') : f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div id="showroom-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => {
            const hasPromo = !!vehicle.promoPrice;
            const displayPrice = hasPromo ? vehicle.promoPrice : vehicle.price;

            return (
              <div
                key={vehicle.id}
                id={`vehicle-card-${vehicle.id}`}
                className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all duration-300 shadow-xl flex flex-col hover:-translate-y-1.5"
              >
                {/* Images Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <img
                    src={vehicle.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Badge Row */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded shadow-lg ${vehicle.condition === 'New' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                      {vehicle.displayCondition || vehicle.condition}
                    </span>
                    {vehicle.badges.map((b) => (
                      <span key={b} className="text-[9px] font-extrabold uppercase bg-neutral-900/90 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded">
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-neutral-950/80 text-[10px] tracking-wide px-2.5 py-1 rounded-full border border-neutral-800 backdrop-blur-sm">
                    📍 {vehicle.branchName}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-neutral-500 uppercase">{vehicle.brand}</span>
                    <h3 className="text-xl font-bold mt-1 tracking-tight text-white group-hover:text-red-500 transition-colors">
                      {vehicle.name}
                    </h3>
                  </div>

                  {/* Quick specs grid */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-neutral-950 rounded-xl border border-neutral-900 text-center">
                    <div>
                      <span className="block text-[9px] text-neutral-400 font-extrabold uppercase">{t.specYear || 'Year'}</span>
                      <span className="text-xs font-black">{vehicle.year}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-neutral-400 font-extrabold uppercase">{t.specTrans || 'Trans'}</span>
                      <span className="text-xs font-black">{vehicle.displayTransmission || vehicle.transmission}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-neutral-400 font-extrabold uppercase">{t.specKm || 'KM'}</span>
                      <span className="text-xs font-black">
                        {vehicle.condition === 'New' ? '0' : vehicle.km.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Prices & CTA */}
                  <div className="mt-auto border-t border-neutral-900 pt-4 flex items-center justify-between">
                    <div>
                      {hasPromo && (
                        <span className="text-xs text-neutral-500 line-through block">
                          Rp {vehicle.price.toLocaleString('id-ID')}
                        </span>
                      )}
                      <span className="text-xl font-black text-red-500 tracking-tight">
                        Rp {displayPrice?.toLocaleString('id-ID')}
                      </span>
                      <span className="block text-[9px] leading-3 text-neutral-400 mt-1">
                        {t.estimatedInstallment || 'Est. Cicilan'}: <strong>Rp {vehicle.installmentFrom.toLocaleString('id-ID')}/{currentLang === 'id' ? 'bln' : 'mo'}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        setCalcDP(vehicle.dpMin);
                        setShowCalculator(false);
                        setShowBooking(false);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all border border-red-500/20 shadow-md flex items-center gap-1.5"
                    >
                      <span>{t.btnViewDetail || 'Lihat Detail'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-3xl">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <span className="text-xl font-bold tracking-wide">Unit Tidak Ditemukan</span>
            <p className="text-neutral-500 max-w-sm mx-auto mt-2 text-sm">
              Kami tidak dapat menemukan stok kendaraan yang cocok dengan filter yang Anda pilih. Silakan reset parameter pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedBrand('Any');
                setSelectedCondition('Any');
                setSelectedTransmission('Any');
                setSelectedFuel('Any');
                setSelectedBranch('Any');
              }}
              className="mt-6 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs tracking-wider uppercase font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* RETHINK SPECTACULAR DETAIL DRAWER MODAL */}
      {selectedVehicle && (
        <div id="detail-vehicle-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Header Sticky */}
            <div className="sticky top-0 z-10 bg-neutral-950 border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-red-500">{selectedVehicle.brand}</span>
                <h2 className="text-2xl font-black text-white">{selectedVehicle.name}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedVehicleId(null);
                  setAiExplainText('');
                  setSeoTags(null);
                }}
                className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Image & Main stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                    <img
                      src={selectedVehicle.images[0] || 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800'}
                      alt={selectedVehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVehicle.images.slice(1).map((img, i) => (
                      <div key={i} className="aspect-video w-full rounded-lg overflow-hidden border border-neutral-900">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs parameters */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedVehicle.badges.map((b) => (
                      <span key={b} className="text-[10px] font-extrabold tracking-widest uppercase bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded">
                        {b}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {selectedVehicle.description}
                  </p>

                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800/80 grid grid-cols-2 gap-4 text-sm font-semibold">
                    <div>
                      <span className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider">{t.specFuel || 'FUEL'}</span>
                      <span className="text-white">{selectedVehicle.displayFuel || selectedVehicle.fuel}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider">{t.specCapacity || 'CAPACITY'}</span>
                      <span className="text-white">
                        {selectedVehicle.id === 'v-01' 
                          ? (currentLang === 'id' ? '7 Kursi (Captain Row)' : currentLang === 'zh' ? '7座 (豪华独立座椅)' : currentLang === 'ar' ? '7 مقاعد (صف كابتن)' : currentLang === 'ja' ? '7席（キャプテンシート）' : '7 Seats (Captain Row)') 
                          : (currentLang === 'id' ? '5 Kursi (Sports Row)' : currentLang === 'zh' ? '5座 (运动座椅)' : currentLang === 'ar' ? '5 مقاعد (رياضية)' : currentLang === 'ja' ? '5席（スポーツシート）' : '5 Seats (Sports Row)')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider">{t.specWarranty || 'WARRANTY EXCLUSIVE'}</span>
                      <span className="text-emerald-500">{selectedVehicle.warranty}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider">{t.specBranch || 'LOCATION BRANCH'}</span>
                      <span className="text-white">{selectedVehicle.branchName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCalculator(!showCalculator);
                        setShowBooking(false);
                      }}
                      className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/40 text-sm font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Calculator className="w-4 h-4 text-red-500" />
                      <span>{showCalculator ? (t.btnCloseCalc || 'Tutup Kalkulator') : (t.btnCalcInstallment || 'Hitung Cicilan')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowBooking(!showBooking);
                        setShowCalculator(false);
                      }}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t.btnBookTestDrive || 'Booking Test Drive'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Loan Calculator Container */}
              {showCalculator && (
                <div id="calculator-section" className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-red-500" />
                    <div>
                      <h4 className="font-extrabold text-lg tracking-tight">{t.calcTitle || 'Kalkulator Simulasi Kredit Premium'}</h4>
                      <p className="text-xs text-neutral-500">{t.calcSubtitle || 'Estimasi angsuran bulanan fleksibel berdasarkan DP dinamis & Tenor'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* DP Selector */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">{(t.calcDpLabel || 'UANG MUKA (DP)')}: Rp {calcDP.toLocaleString('id-ID')}</label>
                      <input
                        type="range"
                        min={selectedVehicle.dpMin}
                        max={carPrice * 0.8}
                        step={10000000}
                        value={calcDP}
                        onChange={(e) => setCalcDP(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                      <span className="block text-[10px] text-neutral-500 text-right mt-1.5 font-bold">DP Min: Rp {selectedVehicle.dpMin.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Tenor Period */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">{(t.calcTenorLabel || 'TENOR')}: {calcTenor} {currentLang === 'id' ? 'Bulan' : 'Months'}</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[12, 24, 36, 48, 60].map((tVal) => (
                          <button
                            key={tVal}
                            type="button"
                            onClick={() => setCalcTenor(tVal)}
                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                              calcTenor === tVal
                                ? 'bg-red-600 border-red-500 text-white'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                            }`}
                          >
                            {tVal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Leasing Select */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">{t.calcLeasingLabel || 'MITRA LEASING PARTNER'}</label>
                      <select
                        value={selectedLeasing}
                        onChange={(e) => setSelectedLeasing(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        {leasingPartners.map((lp) => (
                          <option key={lp.id} value={lp.id}>
                            {lp.name} ({currentLang === 'id' ? 'Bunga' : currentLang === 'zh' ? '利率' : currentLang === 'ar' ? 'الفائدة' : currentLang === 'ja' ? '金利' : 'Interest'} ~{lp.interestRate})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-850 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block">
                        {currentLang === 'id' ? 'ESTIMASI KREDIT BULANAN' : currentLang === 'zh' ? '预计月供金额' : currentLang === 'ar' ? 'القسط الشهري المتوقع' : currentLang === 'ja' ? '毎月のお支払い目安' : 'ESTIMATED MONTHLY INSTALLMENT'}
                      </span>
                      <span className="text-3xl font-black text-red-500 tracking-tight">
                        Rp {mathInstallment.toLocaleString('id-ID')} <span className="text-sm font-semibold text-neutral-400">/ {currentLang === 'id' ? 'Bulan' : currentLang === 'zh' ? '月' : currentLang === 'ar' ? 'شهر' : currentLang === 'ja' ? '月' : 'Month'}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={triggerAIExplanation}
                        className="px-5 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-bold rounded-xl text-xs uppercase transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>
                          {aiExplaining 
                            ? (currentLang === 'id' ? 'AI Menghitung...' : currentLang === 'zh' ? 'AI正在计算...' : currentLang === 'ar' ? 'AI جاري الحساب...' : currentLang === 'ja' ? 'AIが計算中...' : 'AI Calculating...') 
                            : (currentLang === 'id' ? 'AI Jelaskan Hasil' : currentLang === 'zh' ? 'AI解释结果' : currentLang === 'ar' ? 'شرح النتائج بالذكاء الاصطناعي' : currentLang === 'ja' ? 'AIで結果を解説' : 'AI Explain Results')}
                        </span>
                      </button>

                      <a
                        href={`https://wa.me/6281211111001?text=Halo%20Auto%20Veloce%20Motor%2C%20saya%20sudah%20menghitung%20estimasi%20cicilan%20untuk%20${encodeURIComponent(selectedVehicle.name)}%20dengan%20DP%20Rp%20${calcDP.toLocaleString('id-ID')}%20dan%20tenor%20${calcTenor}%20bulan.%20Mohon%20konsultasi.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>
                          {currentLang === 'id' ? 'Kirim Info ke WA Sales' : currentLang === 'zh' ? '发送信息到销售' : currentLang === 'ar' ? 'إرسال إلى واتساب المبيعات' : currentLang === 'ja' ? '営業担当に送る' : 'Send to Sales WA'}
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* AI Explanation Result Output */}
                  {aiExplainText && (
                    <div className="p-5 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-red-500/10 rounded-xl relative">
                      <div className="absolute top-3 right-3 text-[9px] font-extrabold uppercase bg-red-600/20 text-red-500 border border-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse text-red-500" />
                        <span>AI GENERATED INSIGHT</span>
                      </div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
                        {currentLang === 'id' ? '💬 ASISTEN KEUANGAN AUTO VELOCE AI' : currentLang === 'zh' ? '💬 AUTO VELOCE AI 财务助理建议' : currentLang === 'ar' ? '💬 مساعد التمويل الذكي أوتو فيلوتشي' : currentLang === 'ja' ? '💬 AUTO VELOCE AI 財務アシスタントのアドバイス' : '💬 AUTO VELOCE AI FINANCE ASSISTANT INSIGHT'}
                      </h5>
                      <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {aiExplainText}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-neutral-500 leading-normal">
                    {t.disclaimerCredit}
                  </p>
                </div>
              )}

              {/* Collapsible Sales Viewing Form */}
              {showBooking && (
                <form onSubmit={submitBookingForm} className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <span className="font-extrabold text-sm uppercase tracking-wider">
                      {currentLang === 'id' ? 'Form Booking Jadwal Test Drive / Viewing' : currentLang === 'zh' ? '预约试驾和看车表单' : currentLang === 'ar' ? 'نموذج حجز موعد تجربة القيادة والمعاينة' : currentLang === 'ja' ? '試乗・車両見学予約フォーム' : 'Book Test Drive / Viewing Appointment'}
                    </span>
                  </div>

                  {bookingSuccess ? (
                    <div id="booking-success-msg" className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                      <span className="block font-bold text-lg text-white">
                        {currentLang === 'id' ? 'Booking Terkirim!' : currentLang === 'zh' ? '预约已发送！' : currentLang === 'ar' ? 'تم إرسال الحجز!' : currentLang === 'ja' ? '予約が送信されました！' : 'Booking Submitted!'}
                      </span>
                      <p className="text-xs text-neutral-400">
                        {currentLang === 'id' ? 'Jadwal Anda telah kedaftar ke sistem Auto Veloce CRM. Advisor Sales akan menghubungi untuk mengonfirmasi ketersediaan unit secepatnya.' :
                         currentLang === 'zh' ? '您的日程已注册到 Auto Veloce CRM 系统。销售顾问将尽快与您联系以确认车辆可用性。' :
                         currentLang === 'ar' ? 'تم تسجيل موعدك في نظام إدارة علاقات العملاء أوتو فيلوتشي. سيتصل بك مستشار المبيعات لتأكيد توفر المركبة في أقرب وقت ممكن.' :
                         currentLang === 'ja' ? '予約スケジュールが Auto Veloce CRM システムに登録されました。車両の手配を確認するため、営業アドバイザーから追ってご連絡いたします。' :
                         'Your schedule has been registered in the Auto Veloce CRM system. A Sales Advisor will contact you to confirm vehicle availability shortly.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            {currentLang === 'id' ? 'Nama Anda' : currentLang === 'zh' ? '您的姓名' : currentLang === 'ar' ? 'اسمك' : currentLang === 'ja' ? 'お名前' : 'Your Name'}
                          </label>
                          <input
                            type="text"
                            required
                            value={custName}
                            onChange={(e) => setCustName(e.target.value)}
                            placeholder={currentLang === 'id' ? 'Contoh: Jonathan Wijaya' : 'e.g. Jonathan Wijaya'}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            {currentLang === 'id' ? 'No WhatsApp' : 'WhatsApp Number'}
                          </label>
                          <input
                            type="text"
                            required
                            value={custPhone}
                            onChange={(e) => setCustPhone(e.target.value)}
                            placeholder={currentLang === 'id' ? 'Contoh: +6281290001001' : 'e.g. +6281290001001'}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            {currentLang === 'id' ? 'Surel / Email' : 'Email Address'}
                          </label>
                          <input
                            type="email"
                            required
                            value={custEmail}
                            onChange={(e) => setCustEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            {currentLang === 'id' ? 'Tanggal Kunjungan' : currentLang === 'zh' ? '访问日期' : currentLang === 'ar' ? 'تاريخ الزيارة' : currentLang === 'ja' ? 'ご来店日' : 'Visit Date'}
                          </label>
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            {currentLang === 'id' ? 'Waktu Slot Jam' : currentLang === 'zh' ? '预约时间段' : currentLang === 'ar' ? 'فترة الحجز' : currentLang === 'ja' ? 'ご予約時間' : 'Time Slot'}
                          </label>
                          <select
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="09:00">09:00 {currentLang === 'id' ? 'WIB (Pagi)' : 'AM'}</option>
                            <option value="11:00">11:00 {currentLang === 'id' ? 'WIB' : 'AM'}</option>
                            <option value="14:00">14:00 {currentLang === 'id' ? 'WIB (Siang)' : 'PM'}</option>
                            <option value="16:00">16:00 {currentLang === 'id' ? 'WIB' : 'PM'}</option>
                            <option value="18:30">18:30 {currentLang === 'id' ? 'WIB (Malam)' : 'PM'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                            {currentLang === 'id' ? 'Rencana Pembelian' : currentLang === 'zh' ? '购买计划' : currentLang === 'ar' ? 'طريقة الشراء المخططة' : currentLang === 'ja' ? '購入方法の予定' : 'Purchase Plan'}
                          </label>
                          <select
                            value={custMethod}
                            onChange={(e) => setCustMethod(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="Cash">{currentLang === 'id' ? 'Tunai Keras (Cash)' : currentLang === 'zh' ? '全款现金' : currentLang === 'ar' ? 'نقدًا' : currentLang === 'ja' ? '一括現金' : 'Cash'}</option>
                            <option value="Credit">{currentLang === 'id' ? 'Leasing / Kredit' : currentLang === 'zh' ? '金融贷款/分期' : currentLang === 'ar' ? 'تمويل / تقسيط' : currentLang === 'ja' ? 'ローン／分割' : 'Leasing / Credit'}</option>
                            <option value="Trade-In">{currentLang === 'id' ? 'Tukar Tambah (Trade-In)' : currentLang === 'zh' ? '置换购车' : currentLang === 'ar' ? 'استبدال' : currentLang === 'ja' ? '下取り' : 'Trade-In'}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                          {currentLang === 'id' ? 'Catatan Khusus' : currentLang === 'zh' ? '特殊备注' : currentLang === 'ar' ? 'ملاحظات خاصة' : currentLang === 'ja' ? '特別ご要望・備考' : 'Special Notes'}
                        </label>
                        <textarea
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder={currentLang === 'id' ? 'Minta dibawakan riwayat servis lengkap...' : 'e.g. Request full service history records...'}
                          rows={2}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                        ></textarea>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded border border-neutral-900">
                        <input type="checkbox" id="user-consent" required className="accent-red-600" />
                        <label htmlFor="user-consent" className="text-[10px] text-neutral-400">{t.consentMsg}</label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-red-600 hover:bg-red-700 font-bold uppercase text-xs tracking-wider rounded-xl transition-all"
                      >
                        {currentLang === 'id' ? 'Konfirmasi Booking Test Drive' : currentLang === 'zh' ? '确认预约试驾' : currentLang === 'ar' ? 'تأكيد حجز تجربة القيادة' : currentLang === 'ja' ? '試乗予約を確定する' : 'Confirm Test Drive Booking'}
                      </button>
                    </>
                  )}
                </form>
              )}

              {/* Certified Used Car Inspection Details */}
              {selectedVehicle.condition === 'Used' && (
                <div className="p-6 bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-850 rounded-xl space-y-4 shadow">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="font-extrabold text-sm uppercase tracking-wider text-white">
                      {currentLang === 'id' ? 'Laporan Sertifikasi Inspeksi Emas' : currentLang === 'zh' ? '黄金级认证检测报告' : currentLang === 'ar' ? 'تقرير فحص شهادة الضمان الذهبية' : currentLang === 'ja' ? 'ゴールド認定検査報告書' : 'Gold Certified Inspection Report'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-900">
                      <span className="text-emerald-500 font-black text-lg">
                        {currentLang === 'id' ? 'LOLOS' : currentLang === 'zh' ? '合格' : currentLang === 'ar' ? 'ناجح' : currentLang === 'ja' ? '合格' : 'PASSED'}
                      </span>
                      <p className="text-[9px] text-neutral-500 uppercase font-black tracking-wide mt-0.5">
                        {currentLang === 'id' ? 'Histori Bebas Banjir' : currentLang === 'zh' ? '无水泡/水淹历史' : currentLang === 'ar' ? 'خالية من الغرق' : currentLang === 'ja' ? '水没・冠水歴なし' : 'No Flood History'}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-900">
                      <span className="text-emerald-500 font-black text-lg">
                        {currentLang === 'id' ? 'LOLOS' : currentLang === 'zh' ? '合格' : currentLang === 'ar' ? 'ناجح' : currentLang === 'ja' ? '合格' : 'PASSED'}
                      </span>
                      <p className="text-[9px] text-neutral-500 uppercase font-black tracking-wide mt-0.5">
                        {currentLang === 'id' ? 'Struktur Sasis Kokoh' : currentLang === 'zh' ? '车架结构完好' : currentLang === 'ar' ? 'هيكل سليم وقوي' : currentLang === 'ja' ? 'フレーム構造歪みなし' : 'Solid Chassis Structure'}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-900">
                      <span className="text-emerald-500 font-black text-lg">STNK & BPKB</span>
                      <p className="text-[9px] text-neutral-500 uppercase font-black tracking-wide mt-0.5">
                        {currentLang === 'id' ? 'Fisik Dokumen Asli' : currentLang === 'zh' ? '证件原件真实' : currentLang === 'ar' ? 'وثائق أصلية ومكتملة' : currentLang === 'ja' ? '登録書類・原本完備' : 'Original Legal Documents'}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-900">
                      <span className="text-emerald-500 font-black text-lg">
                        {currentLang === 'id' ? 'TERUJI' : currentLang === 'zh' ? '已测试' : currentLang === 'ar' ? 'مختبر' : currentLang === 'ja' ? '動作確認済' : 'TESTED'}
                      </span>
                      <p className="text-[9px] text-neutral-500 uppercase font-black tracking-wide mt-0.5">
                        {currentLang === 'id' ? 'Kompresi Silinder Baik' : currentLang === 'zh' ? '气缸压力正常' : currentLang === 'ar' ? 'ضغط الأسطوانة ممتاز' : currentLang === 'ja' ? 'シリンダー圧縮良好' : 'Good Cylinder Compression'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-emerald-500 bg-neutral-950 rounded text-xs text-neutral-400">
                    <strong>{currentLang === 'id' ? 'Pernyataan Hukum (Showroom Disclaimer):' : currentLang === 'zh' ? '法律声明 (展厅免责声明):' : currentLang === 'ar' ? 'إخلاء المسؤولية القانوني للمعرض:' : currentLang === 'ja' ? '免責事項・法的声明:' : 'Legal Disclaimer:'}</strong> {currentLang === 'id' ? 'Kami siap membuktikan transparansi uji kelayakan dengan memberikan hak penuh bagi customer untuk memboyong unit ke bengkel pabrikan resmi pilihan pada saat agenda test drive dijadwalkan.' :
                     currentLang === 'zh' ? '我们随时准备证明检测的透明度，在试驾日程安排中，允许客户将车辆带至所选的官方授权品牌售后店进行全面检测。' :
                     currentLang === 'ar' ? 'نحن على استعداد لإثبات شفافية اختبار الصلاحية من خلال منح العميل الحق الكامل في فحص المركبة لدى ورشة الشركة المصнعة الرسمية التي يختارها أثناء موعد تجربة القيادة.' :
                     currentLang === 'ja' ? '当ショールームは、鑑定・検査の透明性を証明するため、試乗の際にお客様ご自身で指定の正規ディーラー工場へ車両を持ち込んで点検いただくことを歓迎いたします。' :
                     'We are ready to demonstrate roadworthiness transparency by granting customers full rights to take the vehicle to their preferred brand authorized service center during the scheduled test drive.'}
                  </div>
                </div>
              )}

              {/* Intelligent SEO Console Tool */}
              <div className="border-t border-neutral-900 pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">SEO Crawler & Google Metadata Preview</span>
                </div>

                <button
                  onClick={triggerAISeo}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 text-neutral-300"
                >
                  <Sparkles className="w-3 h-3 text-red-500" />
                  <span>{generatingSeo ? 'Generasi...' : 'Generate AI SEO Tags'}</span>
                </button>
              </div>

              {seoTags && (
                <div id="seo-preview-box" className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                  <span className="block text-[9px] font-extrabold tracking-widest uppercase text-yellow-500">Google SERP Simulator</span>
                  <div className="p-3 bg-white text-black rounded font-sans leading-tight">
                    <span className="text-[#1a0dab] hover:underline text-lg font-medium block cursor-pointer">{seoTags.title}</span>
                    <span className="text-[#006621] text-xs block mt-0.5">https://autoveloce.id/showroom/{selectedVehicle.id}</span>
                    <p className="text-[#545454] text-xs mt-1">{seoTags.description}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
