import React from 'react';
import { RefreshCcw, Landmark, SlidersHorizontal, ArrowLeftRight, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Vehicle } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../translations';

interface TradeInWizardProps {
  vehicles: Vehicle[];
  currentLang: SupportedLanguage;
  onLeadSubmitted: (lead: any) => void;
}

export function TradeInWizard({
  vehicles,
  currentLang,
  onLeadSubmitted
}: TradeInWizardProps) {
  const t = TRANSLATIONS[currentLang];

  // Wizard state
  const [custName, setCustName] = React.useState('');
  const [custPhone, setCustPhone] = React.useState('');
  const [oldCarName, setOldCarName] = React.useState('');
  const [oldCarYear, setOldCarYear] = React.useState<number>(2018);
  const [oldCarKM, setOldCarKM] = React.useState<number>(65000);
  const [oldCarCond, setOldCarCond] = React.useState('Sangat Baik, Terawat, Servis Rutin');
  const [oldCarValuation, setOldCarValuation] = React.useState<number>(180000000);
  const [targetId, setTargetId] = React.useState<string>('');

  // Execution states
  const [proposalSuccess, setProposalSuccess] = React.useState(false);
  const [appraiserBrief, setAppraiserBrief] = React.useState('');
  const [generatingBrief, setGeneratingBrief] = React.useState(false);

  // Target vehicle calculations
  const targetVehicle = vehicles.find((v) => v.id === targetId);
  const targetPrice = targetVehicle ? (targetVehicle.promoPrice || targetVehicle.price) : 0;
  const netDueBalance = targetVehicle ? Math.max(0, targetPrice - oldCarValuation) : 0;

  const triggerAIBrief = async () => {
    if (!targetVehicle) return;
    setGeneratingBrief(true);
    setAppraiserBrief('');
    try {
      const res = await fetch('/api/ai/trade-in-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName || 'Calon Customer',
          oldCar: oldCarName || 'Mobil Avanza/Innova Lama',
          newCar: targetVehicle.name,
          km: oldCarKM,
          condition: oldCarCond,
          expectedPrice: oldCarValuation
        })
      });
      const data = await res.json();
      setAppraiserBrief(data.brief);
    } catch {
      setAppraiserBrief('Sistem AI mengalami kendala sesaat. Anda dapat menyelesaikan pengajuan untuk dibantu tim appraiser fisik showroom kami.');
    } finally {
      setGeneratingBrief(false);
    }
  };

  const submitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVehicle) return;

    // Register Inside CRM
    onLeadSubmitted({
      name: custName,
      whatsApp: custPhone,
      email: `${custName.toLowerCase().replace(/\s/g, '')}@example-exchange.com`,
      type: 'Trade-In',
      score: 'Hot',
      assignedTo: 'sa-02', // Nadia Agent
      details: {
        oldVehicleName: oldCarName,
        oldVehicleYear: oldCarYear,
        oldVehicleKM: oldCarKM,
        targetVehicleId: targetVehicle.id,
        targetVehicleName: targetVehicle.name,
        targetVehiclePrice: targetPrice,
        customerExpectedPrice: oldCarValuation,
        netDue: netDueBalance,
        comment: `Pengajuan tukar tambah unit lama ${oldCarName} (${oldCarYear}) dengan estimasi harga Rp ${oldCarValuation.toLocaleString('id-ID')}. Sisa bayar: Rp ${netDueBalance.toLocaleString('id-ID')}`
      }
    });

    setProposalSuccess(true);
    setTimeout(() => {
      setProposalSuccess(false);
      // Reset form
      setCustName('');
      setCustPhone('');
      setOldCarName('');
      setTargetId('');
      setAppraiserBrief('');
    }, 4500);
  };

  return (
    <div id="trade-in-wizard-portal" className="bg-neutral-950 py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs tracking-widest font-extrabold text-red-500 uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded-full">
            SMART TRADE-IN PORTAL
          </span>
          <h2 className="text-4xl font-black text-white mt-4 tracking-tight">
            {currentLang === 'id' ? (
              <>
                TUKAR TAMBAH <span className="text-red-500">EKSPRES</span>
              </>
            ) : currentLang === 'en' ? (
              <>
                EXPRESS <span className="text-red-500">TRADE-IN</span>
              </>
            ) : currentLang === 'zh' ? (
              <>
                <span className="text-red-500">极速</span>置换服务
              </>
            ) : currentLang === 'ar' ? (
              <>
                استبدال <span className="text-red-500">سريع</span>
              </>
            ) : currentLang === 'ja' ? (
              <>
                エクスプレス <span className="text-red-500">下取り</span>
              </>
            ) : (
              t.tradeInTitle
            )}
          </h2>
          <p className="text-neutral-400 mt-2 text-sm max-w-xl mx-auto">
            {t.tradeInSub}
          </p>
        </div>

        {/* Wizard Form Wrapper */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-10 shadow-2xl max-w-4xl mx-auto">
          {proposalSuccess ? (
            <div id="trade-in-success-v" className="text-center py-20 space-y-4 animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-white">{t.tradeInSuccessTitle}</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {t.tradeInSuccessDesc}
              </p>
            </div>
          ) : (
            <form onSubmit={submitProposal} className="space-y-8">
              
              {/* Grid 1: Customer Identifications & Old Car details */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{t.tradeInStep1}</span>
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInCustName}</label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="Jonathan Wijaya"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInCustPhone}</label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="Contoh: +6281290001001"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInOldCarName}</label>
                    <input
                      type="text"
                      required
                      value={oldCarName}
                      onChange={(e) => setOldCarName(e.target.value)}
                      placeholder="Honda Civic Turbo Hatchback"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInOldCarYear}</label>
                    <input
                      type="number"
                      required
                      value={oldCarYear}
                      onChange={(e) => setOldCarYear(parseInt(e.target.value) || 2018)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInOldCarKm}</label>
                    <input
                      type="number"
                      required
                      value={oldCarKM}
                      onChange={(e) => setOldCarKM(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInOldCarDesc}</label>
                    <input
                      type="text"
                      value={oldCarCond}
                      onChange={(e) => setOldCarCond(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">{t.tradeInOldCarValuation}: Rp {oldCarValuation.toLocaleString('id-ID')}</label>
                    <input
                      type="range"
                      min="30000000"
                      max="1500000000"
                      step="10000000"
                      value={oldCarValuation}
                      onChange={(e) => setOldCarValuation(parseInt(e.target.value))}
                      className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-650 accent-red-600 mt-3"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Target Vehicle Selection */}
              <div className="space-y-4 pt-6 border-t border-neutral-800">
                <span className="text-xs font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" />
                  <span>{t.tradeInStep2}</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-2">{t.tradeInTargetVehicle}</label>
                    <select
                      value={targetId}
                      required
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="">{t.tradeInSelectDream}</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.name} ({v.year}) - Rp {v.price.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 flex items-center gap-4">
                    {targetVehicle ? (
                      <>
                        <div className="w-16 h-12 rounded overflow-hidden bg-neutral-900 flex-shrink-0">
                          <img src={targetVehicle.images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-neutral-500">{t.tradeInTargetPriceLabel}</span>
                          <span className="block text-sm font-black text-white">Rp {targetPrice.toLocaleString('id-ID')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-neutral-500 italic py-2">
                        {t.tradeInTargetSelectPrompt}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 3: Offset Math calculations list */}
              <div className="p-6 bg-neutral-950 border border-neutral-850 rounded-2xl space-y-4">
                <span className="block text-[10px] font-black uppercase text-neutral-500 tracking-widest">{t.tradeInCalcTitle}</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <span className="block text-[9px] font-bold text-neutral-500 uppercase">{t.tradeInCalcTarget}</span>
                    <span className="text-base font-bold text-white">Rp {targetPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <span className="block text-[9px] font-bold text-neutral-500 uppercase">{t.tradeInCalcOld}</span>
                    <span className="text-base font-bold text-white text-emerald-500">- Rp {oldCarValuation.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-950/20 to-neutral-900 rounded-xl border border-red-500/10">
                    <span className="block text-[9px] font-bold text-red-500 uppercase">{t.tradeInCalcNet}</span>
                    <span className="text-lg font-black text-red-500">Rp {netDueBalance.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={triggerAIBrief}
                    disabled={!targetId || !oldCarName || generatingBrief}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold uppercase rounded-lg transition-all text-neutral-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 text-red-500" />
                    <span>{generatingBrief ? t.tradeInCalcBtnAIActive : t.tradeInCalcBtnAI}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!targetId}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.tradeInSubmitBtn}
                  </button>
                </div>
              </div>

              {/* Appraiser generated brief display */}
              {appraiserBrief && (
                <div className="p-5 bg-gradient-to-r from-neutral-950 to-neutral-900 border border-neutral-850 rounded-2xl relative space-y-3">
                  <div className="absolute top-4 right-4 text-[9px] font-bold uppercase bg-red-650 bg-red-600/20 text-red-500 border border-red-500/10 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-red-500 animate-pulse" />
                    <span>{t.tradeInReportHeader}</span>
                  </div>
                  
                  <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>{t.tradeInReportTitle}</span>
                  </h5>
                  
                  <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {appraiserBrief}
                  </div>
                </div>
              )}

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
