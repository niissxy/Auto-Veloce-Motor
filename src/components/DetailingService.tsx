import React from 'react';
import { Sparkles, Calendar, Zap, RefreshCw, Layers, CheckCircle2, Sliders } from 'lucide-react';
import { DetailingService as DetailingServiceType } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../translations';

interface DetailingServiceProps {
  services: DetailingServiceType[];
  currentLang: SupportedLanguage;
  onBookingSubmitted: (booking: any) => void;
  onLeadSubmitted: (lead: any) => void;
}

export function DetailingService({
  services,
  currentLang,
  onBookingSubmitted,
  onLeadSubmitted
}: DetailingServiceProps) {
  const t = TRANSLATIONS[currentLang];

  // UI state
  const [carSize, setCarSize] = React.useState<'Small' | 'Large'>('Small');
  const [selectedService, setSelectedService] = React.useState<DetailingServiceType | null>(null);
  const [sliderVal, setSliderVal] = React.useState<number>(50); // Before / After Slider

  // Booking state
  const [custName, setCustName] = React.useState('');
  const [custPhone, setCustPhone] = React.useState('');
  const [appDate, setAppDate] = React.useState('');
  const [appTime, setAppTime] = React.useState('09:00');
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  // AI Detailing advisor state
  const [issueQuery, setIssueQuery] = React.useState(currentLang === 'id' ? 'Mobil memiliki baret halus dan terlihat kusam' : 'Car has light scratch marks and looks dull');
  const [aiMatchedService, setAiMatchedService] = React.useState<DetailingServiceType | null>(null);
  const [aiJustify, setAiJustify] = React.useState('');
  const [aiMatching, setAiMatching] = React.useState(false);

  const triggerAIDetailingMatch = async () => {
    setAiMatching(true);
    setAiMatchedService(null);
    setAiJustify('');
    try {
      const res = await fetch('/api/ai/detailing-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: issueQuery })
      });
      const data = await res.json();
      setAiMatchedService(data.matchedService);
      setAiJustify(data.justification);
    } catch {
      const fallback = services.find((s) => s.id === 'dt-03') || services[2];
      setAiMatchedService(fallback);
      setAiJustify(currentLang === 'id' ? 'Kami menyarankan paket Koreksi Cat & Poles guna mencerahkan kembali cat yang kusam serta menghilangkan baret halus.' : 'We recommend the Paint Correction & Polish package to brighten dull paint and remove light scratches.');
    } finally {
      setAiMatching(false);
    }
  };

  const submitDetailingBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const price = carSize === 'Small' ? selectedService.priceSmall : selectedService.priceLarge;
    const payload = {
      customerName: custName,
      customerPhone: custPhone,
      type: 'Detailing',
      itemId: selectedService.id,
      itemName: `${selectedService.name} (${carSize === 'Small' ? 'Sedan/City Car' : 'SUV/MPV'})`,
      branchName: 'Auto Veloce Bandung (Service Center)',
      date: appDate,
      time: appTime,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    onBookingSubmitted(payload);

    // Register into CRM leads
    onLeadSubmitted({
      name: custName,
      whatsApp: custPhone,
      email: `${custName.toLowerCase().replace(/\s/g, '')}@example-service.com`,
      type: 'Detailing',
      score: 'Hot',
      details: {
        detailingServiceId: selectedService.id,
        detailingServiceName: selectedService.name,
        expectedPrice: price,
        message: currentLang === 'id' 
          ? `Mendaftar salon detailing untuk tipe mobil size ${carSize} pada tanggal ${appDate} pukul ${appTime}.`
          : `Registering for detailing service for ${carSize} car size on ${appDate} at ${appTime}.`
      }
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedService(null);
    }, 3000);
  };

  return (
    <div id="detailing-service-portal" className="bg-neutral-950 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-xs tracking-widest font-extrabold text-red-500 uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded-full">
            VIP AUTO DETAIL SPARES
          </span>
          <h2 className="text-4xl font-black text-white mt-4 tracking-tight">
            {currentLang === 'id' || currentLang === 'en' ? (
              <>
                SERVICE & <span className="text-red-500">DETAILING</span> RESTORATION
              </>
            ) : currentLang === 'zh' ? (
              <>
                售后与<span className="text-red-500">美容</span>修复
              </>
            ) : currentLang === 'ar' ? (
              <>
                خدمات الصيانة و<span className="text-red-500">الترميم الاحترافي</span>
              </>
            ) : currentLang === 'ja' ? (
              <>
                サービス＆<span className="text-red-500">ディテイリング</span> レストア
              </>
            ) : (
              t.serviceDetailingTitle
            )}
          </h2>
          <p className="text-neutral-400 mt-2 text-sm max-w-xl mx-auto">
            {t.serviceDetailingSub}
          </p>
        </div>

        {/* Dynamic Before/After interactive slider container */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Visual description */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-red-500 tracking-wider">Showroom Results</span>
              <h3 className="text-2xl font-black text-white tracking-tight">{t.beforeAfter}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t.detailingBeforeAfterDesc}
              </p>

              <div id="before-after-labels" className="flex items-center justify-between text-xs font-black uppercase text-neutral-500 mt-2">
                <span>{t.labelBefore}</span>
                <span>{t.labelAfter}</span>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => setSliderVal(parseInt(e.target.value))}
                className="w-full accent-red-600 h-2 bg-neutral-950 rounded bg-neutral-950 border border-neutral-800 cursor-pointer"
              />
            </div>

            {/* Slider visual canvas component */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 select-none shadow">
              {/* After Image (Full background) */}
              <img
                src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200"
                className="absolute inset-0 w-full h-full object-cover"
                alt="After Detailing"
              />
              <div className="absolute bottom-3 right-3 bg-red-650 bg-red-600 text-[10px] font-black uppercase px-2 py-1 rounded shadow">
                {currentLang === 'id' ? 'SESUDAH (ULTRA HYDROPHOBIC KILAP)' : currentLang === 'zh' ? '美容后 (超疏水光泽)' : currentLang === 'ar' ? 'بعد (لمعان فائق)' : currentLang === 'ja' ? '施工後 (超撥水光沢)' : 'AFTER (ULTRA HYDROPHOBIC GLOSS)'}
              </div>

              {/* Before Image (Cropped overlay via width) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${100 - sliderVal}%`, borderRight: '2px solid red' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200"
                  className="absolute inset-y-0 left-0 w-full h-full object-cover grayscale brightness-50"
                  alt="Before Detailing"
                  style={{ width: '100%', maxWidth: 'none' }}
                />
                <div className="absolute bottom-3 left-3 bg-neutral-950 text-neutral-500 text-[10px] font-black uppercase px-2 py-1 rounded border border-neutral-800">
                  {currentLang === 'id' ? 'SEBELUM COATING' : currentLang === 'zh' ? '美容前' : currentLang === 'ar' ? 'قبل المعالجة' : currentLang === 'ja' ? '施工前' : 'BEFORE COATING'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* AI Auto-detailing Diagnostic Advisor Section */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-red-500/15 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-extrabold text-white tracking-wide">AI Detailing Diagnostic Assistant</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                {currentLang === 'id' 
                  ? 'Deskripsikan keluhan kondisi fisik mobil Anda (jamur kaca, baret melingkar, interior berdebu) untuk dicarikan paket restorasi salon detailing paling presisi.'
                  : 'Describe your car\'s physical condition complaints (glass mold, swirl marks, dusty interior) to find the most precise detailing restoration package.'}
              </p>
              
              <textarea
                value={issueQuery}
                onChange={(e) => setIssueQuery(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />

              <button
                onClick={triggerAIDetailingMatch}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wide rounded-lg transition-all"
              >
                {aiMatching ? (currentLang === 'id' ? 'Mendiagnosa Kerusakan...' : currentLang === 'zh' ? '正在诊断损伤...' : currentLang === 'ar' ? 'جاري تشخيص التلف...' : currentLang === 'ja' ? '損傷を診断中...' : 'Diagnosing damage...') : (currentLang === 'id' ? 'Diagnosa dengan Al' : currentLang === 'zh' ? 'AI 智能诊断' : currentLang === 'ar' ? 'تشخيص بالذكاء الاصطناعي' : currentLang === 'ja' ? 'AI診断' : 'Diagnose with AI')}
              </button>
            </div>

            {/* Advisor Outcome */}
            <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-850 h-full flex flex-col justify-center">
              {aiMatchedService ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#fbbf24]">{currentLang === 'id' ? 'Rekomendasi Paket Restorasi' : currentLang === 'zh' ? '修复方案推荐' : currentLang === 'ar' ? 'توصية باقة الترميم' : currentLang === 'ja' ? 'レストアパッケージ推奨' : 'Restoration Package Recommendation'}</span>
                  </div>
                  <h4 className="font-bold text-base text-white">{aiMatchedService.name}</h4>
                  <p className="text-xs text-neutral-400 italic">
                    "{aiJustify}"
                  </p>
                  <button
                    onClick={() => setSelectedService(aiMatchedService)}
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-808 hover:bg-neutral-800 border border-neutral-800 text-red-500 font-extrabold text-xs uppercase tracking-wide rounded-lg transition-all"
                  >
                    {currentLang === 'id' ? 'Booking Paket AI Ini' : currentLang === 'zh' ? '预订此AI推荐套餐' : currentLang === 'ar' ? 'حجز هذه الباقة الموصى بها' : currentLang === 'ja' ? 'AI推奨パッケージを予約' : 'Book This AI Package'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-500 space-y-1.5 col-span-2">
                  <Sliders className="w-8 h-8 mx-auto text-neutral-603 opacity-60" />
                  <p className="text-xs">{currentLang === 'id' ? 'Diagnosa AI Anda akan diproses di panel ini.' : currentLang === 'zh' ? '您的 AI 诊断结果将显示在此面板中。' : currentLang === 'ar' ? 'سيتم معالجة تشخيص الذكاء الاصطناعي الخاص بك في هذه اللوحة.' : currentLang === 'ja' ? 'AI診断の結果がここに表示されます。' : 'Your AI diagnostic will be processed in this panel.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing selector and lists grids */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-bold tracking-tight">{t.detailingListTitle}</h3>
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCarSize('Small')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  carSize === 'Small' ? 'bg-red-600 text-white shadow' : 'text-neutral-400'
                }`}
              >
                {t.detailingSizeSmall}
              </button>
              <button
                type="button"
                onClick={() => setCarSize('Large')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  carSize === 'Large' ? 'bg-red-600 text-white shadow' : 'text-neutral-400'
                }`}
              >
                {t.detailingSizeLarge}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const activePrice = carSize === 'Small' ? svc.priceSmall : svc.priceLarge;
              const nameKey = (svc.id.replace('-', '') + 'Name') as keyof typeof t;
              const descKey = (svc.id.replace('-', '') + 'Desc') as keyof typeof t;
              const catKey = ('detailingCategory' + svc.category) as keyof typeof t;
              const durationMap: Record<string, keyof typeof t> = {
                '1.5 Jam': 'detailingDuration15',
                '3 Jam': 'detailingDuration3',
                '5 Jam': 'detailingDuration5',
                '24 Jam (Butuh rawat inap)': 'detailingDuration24',
              };
              const durKey = durationMap[svc.duration];

              return (
                <div
                  key={svc.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-red-500/20 transition-all shadow-md"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest text-red-500 uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10">
                      {t[catKey] || svc.category}
                    </span>
                    <h4 className="font-bold text-lg text-white mt-1.5">{t[nameKey] || svc.name}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{t[descKey] || svc.description}</p>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider py-1.5">
                      ⏱ {t.detailingDurationLabel}: <strong className="text-white">{t[durKey] || svc.duration}</strong>
                    </div>
                  </div>

                  <div className="border-t border-neutral-850 pt-3 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-neutral-500 uppercase font-black block">{t.detailingPriceLabel}</span>
                      <span className="text-xl font-black text-red-500">Rp {activePrice.toLocaleString('id-ID')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(svc);
                        setAppDate('');
                      }}
                      className="px-4 py-2 bg-neutral-950 hover:bg-red-650 hover:bg-red-600 hover:text-white border border-neutral-800 hover:border-red-500 text-neutral-400 text-xs font-extrabold uppercase tracking-wide rounded-lg transition-all"
                    >
                      {t.detailingBtnBuy}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailing Appt Dialog Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl">
              
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg animate-pulse"
              >
                ✖
              </button>

              <h3 className="text-xl font-black mb-1">{t.detailingModalTitle}</h3>
              <p className="text-xs text-neutral-400 mb-6">{t.detailingModalSub} <strong>{selectedService.name}</strong></p>

              {bookingSuccess ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                  <span className="block font-bold text-lg text-white">{t.detailingModalSuccessTitle}</span>
                  <p className="text-xs text-neutral-400">
                    {t.detailingModalSuccessDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitDetailingBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">{t.detailingModalCustName}</label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Naufal Rasyid"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">{t.detailingModalCustPhone}</label>
                      <input
                        type="text"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+62812..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">{currentLang === 'id' ? 'Tanggal Salon Detailing' : currentLang === 'zh' ? '预约日期' : currentLang === 'ar' ? 'تاريخ الموعد' : currentLang === 'ja' ? '予約日' : 'Appointment Date'}</label>
                      <input
                        type="date"
                        required
                        value={appDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setAppDate(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">{currentLang === 'id' ? 'Waktu Kedatangan' : currentLang === 'zh' ? '预计到达时间' : currentLang === 'ar' ? 'وقت الوصول' : currentLang === 'ja' ? 'ご来店時間' : 'Arrival Time'}</label>
                      <select
                        value={appTime}
                        onChange={(e) => setAppTime(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="09:00">09:00 {currentLang === 'id' ? 'Pagi (WIB)' : currentLang === 'zh' ? '上午' : currentLang === 'ar' ? 'صباحاً' : currentLang === 'ja' ? '午前' : 'AM'}</option>
                        <option value="11:00">11:00 {currentLang === 'id' ? 'Siang' : currentLang === 'zh' ? '中午' : currentLang === 'ar' ? 'ظهراً' : currentLang === 'ja' ? '昼' : 'AM'}</option>
                        <option value="13:30">13:30 {currentLang === 'id' ? 'Siang' : currentLang === 'zh' ? '下午' : currentLang === 'ar' ? 'ظهراً' : currentLang === 'ja' ? '午後' : 'PM'}</option>
                        <option value="15:30">15:30 {currentLang === 'id' ? 'Sore' : currentLang === 'zh' ? '下午' : currentLang === 'ar' ? 'مساءً' : currentLang === 'ja' ? '午後' : 'PM'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-400">{currentLang === 'id' ? 'Total Harga Estimasi' : currentLang === 'zh' ? '预计总费用' : currentLang === 'ar' ? 'إجمالي التكلفة المتوقعة' : currentLang === 'ja' ? 'お見積り合計金額' : 'Estimated Total Price'} ({carSize === 'Small' ? t.detailingSizeSmall : t.detailingSizeLarge}):</span>
                      <span className="text-lg font-black text-red-500">
                        Rp {(carSize === 'Small' ? selectedService.priceSmall : selectedService.priceLarge).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-650 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all"
                  >
                    {t.detailingModalBookingBtn}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
