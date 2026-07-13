import React from 'react';
import { Mail, Lock, User as UserIcon, Phone, AlertCircle, CheckCircle2, Eye, EyeOff, Shield } from 'lucide-react';
import { UserSession } from '../types';

interface AdminAuthProps {
  onLoginSuccess: (user: UserSession) => void;
  lang: 'id' | 'en' | 'zh' | 'ar' | 'ja';
}

export function AdminAuth({ onLoginSuccess, lang }: AdminAuthProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const t = {
    id: {
      loginTitle: 'Masuk Portal Administrator',
      registerTitle: 'Registrasi Akun Staff Baru',
      loginSub: 'Kelola pipeline CRM, database, booking test drive, dan pantau log audit sistem.',
      registerSub: 'Isi data di bawah ini untuk membuat kredensial administrator baru.',
      labelName: 'Nama Lengkap',
      labelEmail: 'Alamat Email',
      labelPhone: 'Nomor Handphone',
      labelPassword: 'Kata Sandi',
      placeholderName: 'cth. Alexander Wijaya',
      placeholderEmail: 'cth. admin@autoveloce.com',
      placeholderPhone: 'cth. 08123456789',
      placeholderPassword: 'Sandi minimal 6 karakter',
      btnSubmitLogin: 'Masuk ke Sistem',
      btnSubmitRegister: 'Daftar Kredensial',
      toggleToRegister: 'Belum punya akun admin? Daftar di sini',
      toggleToLogin: 'Sudah memiliki akun admin? Masuk di sini',
      successLogin: 'Autentikasi berhasil! Mengalihkan ke Dashboard...',
      successRegister: 'Akun admin berhasil didaftarkan! Silakan masuk.'
    },
    en: {
      loginTitle: 'Admin Portal Login',
      registerTitle: 'Staff Account Registration',
      loginSub: 'Manage CRM pipelines, databases, test drive schedules, and monitor system audit logs.',
      registerSub: 'Fill in the form below to register new administrative staff credentials.',
      labelName: 'Full Name',
      labelEmail: 'Email Address',
      labelPhone: 'Phone Number',
      labelPassword: 'Password',
      placeholderName: 'e.g. Alexander Wijaya',
      placeholderEmail: 'e.g. admin@autoveloce.com',
      placeholderPhone: 'e.g. 08123456789',
      placeholderPassword: 'At least 6 characters',
      btnSubmitLogin: 'Authenticate Now',
      btnSubmitRegister: 'Register Credentials',
      toggleToRegister: "Don't have an admin account? Register here",
      toggleToLogin: 'Already registered? Log in here',
      successLogin: 'Authentication successful! Loading control suite...',
      successRegister: 'Admin account created successfully! Please log in.'
    }
  }[lang === 'id' ? 'id' : 'en'];

  const handleQuickLogin = async (selectedEmail: string, selectedPassword: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmail, password: selectedPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Autentikasi gagal.');
      }

      if (!data.isAdmin) {
        throw new Error('Akses ditolak. Akun Anda tidak memiliki hak akses administrator.');
      }

      setSuccess(t.successLogin);
      setTimeout(() => {
        onLoginSuccess(data);
        // Reset fields
        setPassword('');
        setEmail('');
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Autentikasi gagal.');
        }

        if (!data.isAdmin) {
          throw new Error('Akses ditolak. Akun Anda tidak memiliki hak akses administrator.');
        }

        setSuccess(t.successLogin);
        setTimeout(() => {
          onLoginSuccess(data);
          // Reset fields
          setPassword('');
          setEmail('');
          setSuccess('');
        }, 1200);
      } else {
        // Register Flow
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Terjadi kesalahan saat pendaftaran.');
        }

        setSuccess(t.successRegister);
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
          setPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-auth-gate" className="max-w-md mx-auto my-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative side badge */}
      <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-bl-lg uppercase">
        SECURE GATEWAY
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500 mb-3">
          <Shield className="w-6 h-6" />
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

      {/* Seed credentials helper */}
      {isLogin && (
        <div className="mb-6 p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Akun Demo Seed (Klik untuk masuk instan):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@autoveloce.com', 'admin')}
              className="p-2 text-left bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg transition-all disabled:opacity-50"
            >
              <p className="text-xs font-black text-red-500">Super Admin</p>
              <p className="text-[10px] text-neutral-400 truncate">admin@autoveloce.com</p>
              <p className="text-[9px] text-neutral-500 font-mono">Sandi: admin</p>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('staff@autoveloce.com', 'staff123')}
              className="p-2 text-left bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg transition-all disabled:opacity-50"
            >
              <p className="text-xs font-black text-amber-500">Staff Supervisor</p>
              <p className="text-[10px] text-neutral-400 truncate">staff@autoveloce.com</p>
              <p className="text-[9px] text-neutral-500 font-mono">Sandi: staff123</p>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('sales@autoveloce.com', 'sales123')}
              className="p-2 text-left bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg transition-all disabled:opacity-50"
            >
              <p className="text-xs font-black text-sky-500">Sales Specialist</p>
              <p className="text-[10px] text-neutral-400 truncate">sales@autoveloce.com</p>
              <p className="text-[9px] text-neutral-500 font-mono">Sandi: sales123</p>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('finance@autoveloce.com', 'finance123')}
              className="p-2 text-left bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg transition-all disabled:opacity-50"
            >
              <p className="text-xs font-black text-emerald-500">Finance Admin</p>
              <p className="text-[10px] text-neutral-400 truncate">finance@autoveloce.com</p>
              <p className="text-[9px] text-neutral-500 font-mono">Sandi: finance123</p>
            </button>
          </div>
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
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all font-sans"
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
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all font-sans"
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
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all font-sans"
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
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all font-mono"
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
          className="w-full py-3.5 mt-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-red-600/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (isLogin ? t.btnSubmitLogin : t.btnSubmitRegister)}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-neutral-800/60 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}
          className="text-xs text-red-500 hover:text-red-400 font-bold transition-all"
        >
          {isLogin ? t.toggleToRegister : t.toggleToLogin}
        </button>
      </div>
    </div>
  );
}
