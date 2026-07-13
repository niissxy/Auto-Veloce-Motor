import React from 'react';
import { User, Mail, Phone, Lock, Camera, Check, AlertCircle, Save, Sparkles } from 'lucide-react';
import { UserSession } from '../types';

interface UserProfileProps {
  user: UserSession;
  onUpdateUser: (updatedUser: UserSession) => void;
  lang: 'id' | 'en' | 'zh' | 'ar' | 'ja';
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
];

export function UserProfile({ user, onUpdateUser, lang }: UserProfileProps) {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [phone, setPhone] = React.useState(user.phone);
  const [password, setPassword] = React.useState('');
  const [photo, setPhoto] = React.useState(user.photo || AVATAR_PRESETS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = React.useState('');
  const [showPhotoSelector, setShowPhotoSelector] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const t = {
    id: {
      title: 'Profil Anggota VIP',
      sub: 'Kelola kredensial akun eksklusif dan preferensi profil Anda.',
      labelName: 'Nama Lengkap',
      labelEmail: 'Alamat Email',
      labelPhone: 'Nomor HP',
      labelPassword: 'Kata Sandi Baru (kosongkan jika tidak diubah)',
      placeholderPassword: 'Sandi baru minimal 6 karakter',
      btnSave: 'Simpan Perubahan',
      photoTitle: 'Ubah Foto Profil',
      photoSub: 'Pilih preset avatar VIP atau masukkan URL foto kustom.',
      customUrlLabel: 'Masukkan URL Foto Kustom',
      customUrlPlaceholder: 'https://example.com/foto.jpg',
      invalidUrl: 'Harap masukkan URL gambar yang valid.',
      successUpdate: 'Profil Anda berhasil diperbarui!',
      userRoleAdmin: 'Akun Administrator VIP',
      userRoleCustomer: 'Anggota VIP Auto Veloce'
    },
    en: {
      title: 'VIP Member Profile',
      sub: 'Manage your exclusive account credentials and profile preferences.',
      labelName: 'Full Name',
      labelEmail: 'Email Address',
      labelPhone: 'Phone Number',
      labelPassword: 'New Password (leave blank to keep current)',
      placeholderPassword: 'At least 6 characters',
      btnSave: 'Save Changes',
      photoTitle: 'Change Profile Picture',
      photoSub: 'Select a premium VIP avatar preset or enter a custom photo URL.',
      customUrlLabel: 'Custom Photo URL',
      customUrlPlaceholder: 'https://example.com/photo.jpg',
      invalidUrl: 'Please provide a valid image URL.',
      successUpdate: 'Your profile has been updated successfully!',
      userRoleAdmin: 'VIP Administrator Account',
      userRoleCustomer: 'Auto Veloce VIP Member'
    }
  }[lang === 'id' ? 'id' : 'en'];

  // Sync state if user prop changes
  React.useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setPhoto(user.photo || AVATAR_PRESETS[0]);
  }, [user]);

  const handlePresetSelect = (p: string) => {
    setPhoto(p);
    setCustomPhotoUrl('');
  };

  const handleCustomPhotoApply = () => {
    if (customPhotoUrl.trim() && (customPhotoUrl.startsWith('http://') || customPhotoUrl.startsWith('https://'))) {
      setPhoto(customPhotoUrl.trim());
      setShowPhotoSelector(false);
    } else {
      setError(t.invalidUrl);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: any = {
        id: user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photo: photo
      };

      if (password.trim()) {
        if (password.trim().length < 6) {
          throw new Error(lang === 'id' ? 'Sandi minimal harus 6 karakter.' : 'Password must be at least 6 characters.');
        }
        payload.password = password.trim();
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui profil.');
      }

      onUpdateUser(data);
      setSuccess(t.successUpdate);
      setPassword('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Koneksi ke server terputus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-neutral-950 text-white min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center mb-10">
          <span className="text-xs font-black tracking-widest text-red-500 uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded-full inline-block">
            {user.isAdmin ? 'ADMIN CONCIERGE' : 'VIP MEMBER'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-3 tracking-tight">
            {t.title}
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            {t.sub}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl flex items-start gap-3 animate-pulse">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Picture editor & Status */}
          <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-between space-y-6">
            <div className="text-center w-full">
              {/* Profile Avatar */}
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                <img
                  src={photo}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover border-4 border-red-600/30 group-hover:border-red-600 transition-all duration-300 shadow-xl"
                  onError={(e) => {
                    // Fallback avatar
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPhotoSelector(!showPhotoSelector)}
                  className="absolute bottom-1 right-1 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full border-2 border-neutral-900 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                  title={t.photoTitle}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-lg font-bold text-white leading-tight truncate">{name}</h4>
              <p className="text-xs text-red-500 font-extrabold tracking-wider uppercase mt-1">
                {user.isAdmin ? t.userRoleAdmin : t.userRoleCustomer}
              </p>
              <div className="mt-2 text-xs text-neutral-500 font-mono">
                ID: {user.id}
              </div>
            </div>

            {/* Photo Picker Drawer */}
            {showPhotoSelector && (
              <div className="w-full bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-4">
                <div>
                  <h5 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-1">{t.photoTitle}</h5>
                  <p className="text-[10px] text-neutral-500">{t.photoSub}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                        photo === preset ? 'border-red-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`preset-${i}`} className="w-full h-full object-cover" />
                      {photo === preset && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-900">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{t.customUrlLabel}</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder={t.customUrlPlaceholder}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleCustomPhotoApply}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full pt-4 border-t border-neutral-850 text-center text-xs text-neutral-400">
              <Sparkles className="w-5 h-5 text-red-500 mx-auto mb-2 animate-pulse" />
              <span>Auto Veloce VIP concierge provides custom buying consultations tailored directly to your preferences.</span>
            </div>
          </div>

          {/* Right Column: Editable Forms */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                    {t.labelName}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                    {t.labelEmail}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                    {t.labelPhone}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                    {t.labelPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.placeholderPassword}
                      minLength={6}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-red-500 placeholder-neutral-600 transition-all"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/10 flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : t.btnSave}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
