import React from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
  lang: 'id' | 'en' | 'zh' | 'ar' | 'ja';
}

export function AuthModal({ isOpen, onClose, onLoginSuccess, lang }: AuthModalProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  if (!isOpen) return null;

  const t = {
    id: {
      loginTitle: 'Masuk Akun VIP',
      registerTitle: 'Daftar Akun Baru',
      loginSub: 'Akses portofolio mobil eksklusif dan konsultasi VIP.',
      registerSub: 'Bergabunglah untuk memesan unit dan melacak pengajuan Anda.',
      labelName: 'Nama Lengkap',
      labelEmail: 'Alamat Email',
      labelPhone: 'Nomor HP',
      labelPassword: 'Kata Sandi',
      placeholderName: 'cth. John Doe',
      placeholderEmail: 'cth. john@example.com',
      placeholderPhone: 'cth. 081234567890',
      placeholderPassword: 'Sandi minimal 6 karakter',
      btnSubmitLogin: 'Masuk Sekarang',
      btnSubmitRegister: 'Daftar & Buat Akun',
      toggleToRegister: 'Belum punya akun? Daftar gratis',
      toggleToLogin: 'Sudah punya akun? Masuk di sini',
      successLogin: 'Selamat datang kembali! Berhasil masuk.',
      successRegister: 'Registrasi berhasil! Silakan masuk ke akun Anda.'
    },
    en: {
      loginTitle: 'VIP Sign In',
      registerTitle: 'Create VIP Account',
      loginSub: 'Access exclusive premium vehicle portfolio and direct VIP consultations.',
      registerSub: 'Join to reserve premium units and track all your custom submissions.',
      labelName: 'Full Name',
      labelEmail: 'Email Address',
      labelPhone: 'Phone Number',
      labelPassword: 'Password',
      placeholderName: 'e.g. John Doe',
      placeholderEmail: 'e.g. john@example.com',
      placeholderPhone: 'e.g. +6281234567890',
      placeholderPassword: 'At least 6 characters',
      btnSubmitLogin: 'Sign In Now',
      btnSubmitRegister: 'Register & Create Account',
      toggleToRegister: "Don't have an account? Sign up free",
      toggleToLogin: 'Already have an account? Sign in here',
      successLogin: 'Welcome back! Sign in successful.',
      successRegister: 'Registration successful! Please login to your account.'
    }
  }[lang === 'id' ? 'id' : 'en'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Terjadi kesalahan saat masuk.');
        }

        setSuccess(t.successLogin);
        setTimeout(() => {
          onLoginSuccess(data);
          onClose();
          // Reset fields
          setPassword('');
          setEmail('');
          setSuccess('');
        }, 1200);
      } else {
        // Register flow
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Terjadi kesalahan saat registrasi.');
        }

        setSuccess(t.successRegister);
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
          setPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi ke server gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl z-10 p-6 md:p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-red-600/10 border border-red-500/20 rounded-full text-red-500 mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white">{isLogin ? t.loginTitle : t.registerTitle}</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
            {isLogin ? t.loginSub : t.registerSub}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t.labelName}</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.placeholderName}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t.labelEmail}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholderEmail}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t.labelPhone}</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.placeholderPhone}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{t.labelPassword}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.placeholderPassword}
                minLength={6}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-all"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/10 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Processing...</span>
              </span>
            ) : (
              isLogin ? t.btnSubmitLogin : t.btnSubmitRegister
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-900 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-red-500 hover:text-red-400 hover:underline transition-all font-semibold"
          >
            {isLogin ? t.toggleToRegister : t.toggleToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}
