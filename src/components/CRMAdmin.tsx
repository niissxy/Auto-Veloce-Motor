import React from 'react';
import { Shield, Sparkles, CheckSquare, Trash2, CalendarCheck, FileText, CheckCircle2, RefreshCw, Send, MessageSquare, AlertCircle, Plus, Edit3, User as UserIcon } from 'lucide-react';
import { Lead, Booking, AuditLog, UserSession } from '../types';
import { SupportedLanguage } from '../translations';
import { UserProfile } from './UserProfile';

interface CRMAdminProps {
  initialLeads: Lead[];
  initialBookings: Booking[];
  currentLang: SupportedLanguage;
  onLeadUpdated: (lead: Lead) => void;
  onBookingUpdated: (booking: Booking) => void;
  currentUser: UserSession | null;
  onUpdateUser: (user: UserSession) => void;
}

export function CRMAdmin({
  initialLeads,
  initialBookings,
  currentLang,
  onLeadUpdated,
  onBookingUpdated,
  currentUser,
  onUpdateUser
}: CRMAdminProps) {
  // Lists state
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  React.useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  React.useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);
  
  // Selection states
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<string>('Director');
  const [showProfileSettings, setShowProfileSettings] = React.useState(false);

  // AI interactive processing states
  const [aiScoring, setAiScoring] = React.useState<Record<string, { rating: string; probability: number; triggers: string[]; strategy: string }>>({});
  const [scoringLoadingId, setScoringLoadingId] = React.useState<string | null>(null);
  const [followupDraft, setFollowupDraft] = React.useState<string>('');
  const [followupLoadingId, setFollowupLoadingId] = React.useState<string | null>(null);

  // Filters state
  const [leadFilterType, setLeadFilterType] = React.useState<string>('All');
  const [leadFilterStatus, setLeadFilterStatus] = React.useState<string>('All');

  // Load audit logs and data fresh from API on mount
  const refreshBackendData = async () => {
    try {
      const resLeads = await fetch('/api/leads');
      const dataLeads = await resLeads.json();
      setLeads(dataLeads);

      const resBookings = await fetch('/api/bookings');
      const dataBookings = await resBookings.json();
      setBookings(dataBookings);

      const resLogs = await fetch('/api/audit-logs');
      const dataLogs = await resLogs.json();
      setAuditLogs(dataLogs);
    } catch (e) {
      console.error('Failed to grab fresh API server state', e);
    }
  };

  React.useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 10000); // Poll database state every 10s
    return () => clearInterval(interval);
  }, []);

  // Update a Lead Status directly
  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const targetLead = leads.find((l) => l.id === leadId);
      if (!targetLead) return;

      const updated = { ...targetLead, status: newStatus };
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      onLeadUpdated(data);
      refreshBackendData();
    } catch (e) {
      console.error('Lead status update failed', e);
    }
  };

  // Trigger server-side AI Lead Scoring
  const handleScoreLeadWithAI = async (lead: Lead) => {
    setScoringLoadingId(lead.id);
    try {
      const res = await fetch('/api/ai/lead-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadDetails: lead })
      });
      const scored = await res.json();
      setAiScoring((prev) => ({ ...prev, [lead.id]: scored }));
    } catch {
      // Rule-based fallback
      setAiScoring((prev) => ({
        ...prev,
        [lead.id]: {
          rating: 'Hot',
          probability: 80,
          triggers: ['Kontak HP terdaftar aktif', 'Telah mengalkulasi cicilan DP rendah'],
          strategy: 'Segera telepon dalam waktu 1 jam.'
        }
      }));
    } finally {
      setScoringLoadingId(null);
    }
  };

  // Trigger server-side AI follow-up WhatsApp composer
  const handleCreateFollowupDraft = async (lead: Lead) => {
    setFollowupLoadingId(lead.id);
    setFollowupDraft('');
    try {
      const res = await fetch('/api/ai/follow-up-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: lead.name,
          interestedUnit: lead.details?.vehicleName || 'Katalog Premium',
          leadType: lead.type,
          salesName: 'Nadia (Sales Executive)'
        })
      });
      const data = await res.json();
      setFollowupDraft(data.draft);
      setSelectedLead(lead);
    } catch {
      setFollowupDraft('Halo Bapak/Ibu, terima kasih sudah menghubungi Auto Veloce. Adakah waktu luang hari ini untuk berdiskusi?');
      setSelectedLead(lead);
    } finally {
      setFollowupLoadingId(null);
    }
  };

  // Approve or complete booking
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const targetB = bookings.find((b) => b.id === bookingId);
      if (!targetB) return;

      const updated = { ...targetB, status: newStatus };
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      onBookingUpdated(data);
      refreshBackendData();
    } catch (e) {
      console.error('Booking approval update failed', e);
    }
  };

  // Clear audit center logs
  const handleClearAuditLogs = async () => {
    try {
      await fetch('/api/audit-logs/clear', { method: 'POST' });
      refreshBackendData();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter lists
  const filteredLeads = leads.filter((l) => {
    const typeMatch = leadFilterType === 'All' || l.type === leadFilterType;
    const statusMatch = leadFilterStatus === 'All' || l.status === leadFilterStatus;
    return typeMatch && statusMatch;
  });

  return (
    <div id="crm-admin-portal" className="bg-neutral-950 min-h-screen py-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Dashboard Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow">
          <div>
            <span className="text-xs uppercase font-extrabold text-red-500 tracking-wider">Internal Command Control Console</span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">AUTO VELOCE <span className="text-red-500">MANAGEMENT SUITE</span></h1>
            <p className="text-xs text-neutral-400 mt-1">Platform monitor pipeline penjualan, test drive booking, dan audit log legal.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 font-bold uppercase">Akses Sebagai:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-bold text-red-500 focus:outline-none"
            >
              <option value="Director">Dealer Principal / Direktur</option>
              <option value="SalesManager">Sales Manager</option>
              <option value="ServiceAdmin">Service Detailing Admin</option>
            </select>

            <button
              onClick={() => setShowProfileSettings(!showProfileSettings)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold tracking-wide rounded-lg border transition-all ${
                showProfileSettings
                  ? 'bg-red-650 bg-red-600 border-red-500 text-white shadow-lg'
                  : 'bg-neutral-950 border-neutral-850 hover:border-red-500 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-red-500" />
              <span>{showProfileSettings ? 'Kembali ke Dashboard' : 'Pengaturan Profil Admin'}</span>
            </button>

            <button
              onClick={refreshBackendData}
              title="Refresh Data"
              className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showProfileSettings ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-2 shadow-xl">
            <UserProfile
              user={currentUser!}
              onUpdateUser={onUpdateUser}
              lang={currentLang}
            />
          </div>
        ) : (
          <>
            {/* System telemetry counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Estimasi Pipeline</span>
            <span className="text-2xl font-black text-white mt-1">Rp 4.870.000.000</span>
            <div className="text-[9px] text-emerald-500 font-semibold mt-1">▲ +12% Bulan ini</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Booking Aktif</span>
            <span className="text-2xl font-black text-white mt-1">{bookings.length} Aktivitas</span>
            <div className="text-[9px] text-neutral-400 mt-1">Menunggu approval: {bookings.filter(b => b.status === 'Pending').length}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Conversion Rate (Leads)</span>
            <span className="text-2xl font-black text-red-500 mt-1">78.4 %</span>
            <div className="text-[9px] text-[#fbbf24] font-semibold mt-1">Target Sales: 80%</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Staff Sales Aktif</span>
            <span className="text-2xl font-black text-white mt-1">6 Agent</span>
            <div className="text-[9px] text-neutral-400 mt-1">Jakarta | BSD | Surabaya | Bdg</div>
          </div>
        </div>

        {/* SECTION 1: CRM Leads database */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Header Action toolbar */}
          <div className="p-5 border-b border-neutral-800 bg-neutral-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              <span className="font-bold text-base">Pipeline Prospek Pelanggan (Leads Management)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Type filter */}
              <select
                value={leadFilterType}
                onChange={(e) => setLeadFilterType(e.target.value)}
                className="bg-neutral-950 border border-neutral-850 p-2 rounded text-xs focus:outline-none"
              >
                <option value="All">Semua Kategori</option>
                <option value="Test Drive">Test Drive</option>
                <option value="Trade-In">Trade-In</option>
                <option value="Rental">Rental</option>
                <option value="Detailing">Detailing</option>
              </select>

              {/* Status filter */}
              <select
                value={leadFilterStatus}
                onChange={(e) => setLeadFilterStatus(e.target.value)}
                className="bg-neutral-950 border border-neutral-850 p-2 rounded text-xs"
              >
                <option value="All">Semua Status</option>
                <option value="New">Baru (New)</option>
                <option value="Contacted">Telah Dihubungi</option>
                <option value="Closed Won">Closed Won (Deal)</option>
                <option value="Closed Lost">Closed Lost (Gagal)</option>
              </select>
            </div>
          </div>

          {/* Leads list table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 border-b border-neutral-850 text-[10px] font-black uppercase text-neutral-500 tracking-wider">
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Kategori Layanan</th>
                  <th className="p-4">Tertarik Unit / Detail</th>
                  <th className="p-4 text-center">AI Lead Scoring</th>
                  <th className="p-4">Status & Staff</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredLeads.map((lead) => {
                  const leadScore = aiScoring[lead.id];

                  return (
                    <tr key={lead.id} className="hover:bg-neutral-950/40 text-xs">
                      {/* Cust Name detail */}
                      <td className="p-4">
                        <span className="block font-bold text-white text-sm">{lead.name}</span>
                        <span className="block text-neutral-400 mt-1">📞 {lead.whatsApp}</span>
                        <span className="block text-[10px] text-neutral-500 mt-0.5">{lead.email}</span>
                      </td>

                      {/* Cate badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          lead.type === 'Test Drive' ? 'bg-red-600/10 text-red-500 border border-red-500/20' :
                          lead.type === 'Trade-In' ? 'bg-indigo-600/10 text-indigo-500 border border-indigo-500/20' :
                          lead.type === 'Rental' ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20' :
                          'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {lead.type}
                        </span>
                      </td>

                      {/* Interested items */}
                      <td className="p-4 max-w-xs truncate">
                        <span className="font-bold text-neutral-300">
                          {lead.details?.vehicleName || lead.details?.detailingServiceName || 'Katalog Umum'}
                        </span>
                        <p className="text-[10px] text-neutral-500 mt-0.5 whitespace-pre-wrap">{lead.details?.comment || lead.details?.message}</p>
                      </td>

                      {/* AI Lead qualification analyzer display */}
                      <td className="p-4 text-center">
                        {leadScore ? (
                          <div className="inline-block text-left p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg">
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                leadScore.rating === 'Hot' ? 'bg-red-600 text-white animate-pulse' :
                                leadScore.rating === 'Warm' ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {leadScore.rating} ({leadScore.probability}%)
                              </span>
                            </div>
                            <span className="block text-[8px] text-neutral-500 mt-1 max-w-[150px] leading-relaxed italic">
                              💡 Strategy: {leadScore.strategy}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleScoreLeadWithAI(lead)}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/30 text-[10px] uppercase font-bold text-red-500 rounded transition-all flex items-center gap-1.5 mx-auto"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>{scoringLoadingId === lead.id ? 'Menguji...' : 'Uji AI Scoring'}</span>
                          </button>
                        )}
                      </td>

                      {/* Status select dropdown */}
                      <td className="p-4 space-y-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                          className={`p-1.5 rounded text-[10px] font-bold border ${
                            lead.status === 'Closed Won' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                            lead.status === 'Closed Lost' ? 'bg-red-950/40 border-red-500/30 text-red-400' :
                            lead.status === 'Contacted' ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' :
                            'bg-neutral-950 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          <option value="New">Baru (New)</option>
                          <option value="Contacted">Sedang Follow Up</option>
                          <option value="Closed Won">Closed Won (Deal)</option>
                          <option value="Closed Lost">Closed Lost (Gagal)</option>
                        </select>
                        <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wide">
                          Handled by: {lead.assignedTo === 'sa-01' ? 'Adrian' : lead.assignedTo === 'sa-02' ? 'Nadia' : 'Customer Service'}
                        </span>
                      </td>

                      {/* Composer triggers */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleCreateFollowupDraft(lead)}
                          className="px-3 py-2 bg-neutral-950 hover:bg-red-650 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg inline-flex items-center gap-1 text-[10px] font-bold"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                          <span>{followupLoadingId === lead.id ? 'Membuat...' : 'Draft Follow Up'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-10 text-center text-neutral-500">
              Belum ada data leads untuk filter kategori ini.
            </div>
          )}
        </div>

        {/* Follow Up Drawer Side Overlay */}
        {selectedLead && followupDraft && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative shadow-2xl max-w-2xl mx-auto space-y-4">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-base"
            >
              ✖
            </button>

            <span className="text-[10px] font-bold uppercase text-red-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>AI COMPOSER: DRAF PESAN FOLLOW UP WHATSAPP</span>
            </span>

            <h4 className="font-bold text-sm">Target Penerima: {selectedLead.name} ({selectedLead.whatsApp})</h4>

            <textarea
              value={followupDraft}
              onChange={(e) => setFollowupDraft(e.target.value)}
              rows={8}
              className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-4 text-xs text-white leading-relaxed font-mono focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">
                Tip: Anda dapat langsung menyalin teks pemicu interaksi di atas dan mengirimkannya ke kontak klien.
              </span>
              <a
                href={`https://wa.me/${selectedLead.whatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(followupDraft)}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim WhatsApp Sekarang</span>
              </a>
            </div>
          </div>
        )}

        {/* SECTION 2: Bookings approvals table planner */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-red-500" />
              <span className="font-bold">Konfirmasi Jadwal Booking & Aktivitas</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 border-b border-neutral-850 text-[10px] font-black uppercase text-neutral-500 tracking-wider">
                  <th className="p-4">Customer PIC</th>
                  <th className="p-4">Tipe Booking</th>
                  <th className="p-4">Item Pilihan</th>
                  <th className="p-4">Jadwal Sesi</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Penetapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-950/40 text-xs">
                    <td className="p-4 font-bold">{b.customerName} <span className="block text-[10px] text-neutral-400 font-normal">📞 {b.customerPhone}</span></td>
                    <td className="p-4">
                      <span className="p-1 px-2.5 bg-neutral-950 border border-neutral-850 rounded-full font-bold text-[10px] text-white">
                        {b.type}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-neutral-300">{b.itemName}</td>
                    <td className="p-4">
                      <span className="block font-black">{b.date}</span>
                      <span className="block text-[9px] text-neutral-500 uppercase font-black">{b.time || 'All Day'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                        b.status === 'Confirmed' || b.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' :
                        b.status === 'Pending' ? 'bg-yellow-950 text-yellow-500 animate-pulse font-bold' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {b.status === 'Pending' ? (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-wide rounded text-white"
                        >
                          Approve (Setujui)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'Pending')}
                          className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 font-bold text-[10px] uppercase text-neutral-400 rounded"
                        >
                          Mark Pending
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: Legal Audit logging center */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span className="font-bold">Logs Audit Penjualan Showroom & Keamanan Sesi</span>
            </div>

            <button
              onClick={handleClearAuditLogs}
              className="px-3.5 py-1.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 shadow transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Logs</span>
            </button>
          </div>

          <div className="p-4 max-h-56 overflow-y-auto bg-neutral-950/60 font-mono text-[11px] leading-relaxed select-text space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-start gap-2 border-b border-neutral-900 pb-2">
                <span className="text-red-500 font-bold">[{log.timestamp.slice(0, 19).replace('T', ' ')}]</span>
                <span className="text-[#a3a3a3]">USER:</span>
                <span className="text-[#fbbf24] font-black">{log.user}</span>
                <span className="text-neutral-400">({log.ip})</span>
                <span className="text-white font-semibold">ACTION: {log.action}</span>
                <span className="text-neutral-500 italic">| Details: {log.details}</span>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="text-center py-6 text-neutral-500">
                Log audit bersih/kosong.
              </div>
            )}
          </div>
        </div>

          </>
        )}

      </div>
    </div>
  );
}
