import React from 'react';
import { Shield, Globe, Menu, X, Flame, LogOut, Key, Sun, Moon, ChevronDown } from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../translations';
import { UserSession } from '../types';

interface NavbarProps {
  currentLang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onNavClick?: (id: string) => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export function Navbar({
  currentLang,
  setLang,
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  onNavClick,
  currentUser,
  onLogout,
  theme,
  setTheme
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const t = TRANSLATIONS[currentLang];

  const primaryNavItems = [
    { id: 'home', label: t.home || 'Beranda' },
    { id: 'masalah-solusi', label: currentLang === 'id' ? 'Masalah & Solusi' : 'Problems & Solutions' },
    { id: 'video-demo', label: currentLang === 'id' ? 'Video Demo' : 'Video Demo' },
    { id: 'showroom', label: t.listings || 'Stok Mobil' },
    { id: 'testimoni', label: t.reviews || 'Testimoni' }
  ];

  const dropdownItems = [
    { id: 'rentals', label: t.rentals || 'Rental Mobil' },
    { id: 'detailing', label: t.detailing || 'Detailing' },
    { id: 'trade-in', label: t.submitTradeIn || 'Trade-In' }
  ];

  const navItems = [...primaryNavItems, ...dropdownItems];

  const isDropdownActive = dropdownItems.some(item => item.id === activeTab) && !isAdmin;
  const moreLabel = currentLang === 'id' ? 'Lainnya' :
                    currentLang === 'zh' ? '更多' :
                    currentLang === 'ar' ? 'المزيد' :
                    currentLang === 'ja' ? 'その他' : 'More';

  const languages: Array<{ code: SupportedLanguage; name: string; flag: string }> = [
    { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const handleAdminClick = () => {
    setActiveTab('admin');
    setIsAdmin(true);
    setMobileOpen(false);
  };

  return (
    <nav 
      id="nav-header" 
      className={`sticky top-0 z-50 transition-all duration-200 backdrop-blur-md border-b ${
        theme === 'dark' 
          ? 'bg-neutral-950/90 border-neutral-900 text-white' 
          : 'bg-white/90 border-slate-200 text-slate-950 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('home'); setIsAdmin(false); }}>
            <div className="relative p-2 bg-gradient-to-br from-red-600 to-black rounded-lg border border-red-500/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <div>
              <span className={`text-xl sm:text-2xl font-black tracking-wider bg-clip-text ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                AUTO <span className="text-red-500">VELOCE</span>
              </span>
              <p className={`text-[10px] tracking-widest uppercase font-bold ${theme === 'dark' ? 'text-neutral-500' : 'text-slate-400'}`}>M O T O R</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center lg:gap-0.5 xl:gap-2">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id && !isAdmin;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    if (onNavClick) {
                      onNavClick(item.id);
                    } else {
                      setActiveTab(item.id);
                      setIsAdmin(false);
                    }
                  }}
                  className={`px-2 xl:px-4 py-2 text-xs xl:text-[13px] font-semibold tracking-wide rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? theme === 'dark'
                        ? 'text-red-500 bg-red-500/10 border border-red-500/20'
                        : 'text-red-600 bg-red-50 border border-red-100'
                      : theme === 'dark'
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Dropdown "Lainnya" / "More" */}
            <div className="relative group">
              <button
                id="nav-more-btn"
                className={`flex items-center gap-1.5 px-2 xl:px-4 py-2 text-xs xl:text-[13px] font-semibold tracking-wide rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isDropdownActive
                    ? theme === 'dark'
                      ? 'text-red-500 bg-red-500/10 border border-red-500/20'
                      : 'text-red-600 bg-red-50 border border-red-100'
                    : theme === 'dark'
                      ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{moreLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-48 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className={`border rounded-xl shadow-2xl py-1.5 overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-neutral-950 border-neutral-900'
                    : 'bg-white border-slate-200'
                }`}>
                  {dropdownItems.map((item) => {
                    const isSubActive = activeTab === item.id && !isAdmin;
                    return (
                      <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        onClick={() => {
                          if (onNavClick) {
                            onNavClick(item.id);
                          } else {
                            setActiveTab(item.id);
                            setIsAdmin(false);
                          }
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs xl:text-[13px] font-semibold transition-all duration-200 ${
                          isSubActive
                            ? theme === 'dark'
                              ? 'text-red-500 bg-neutral-900 font-bold'
                              : 'text-red-600 bg-red-50 font-bold'
                            : theme === 'dark'
                              ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right utilities: Lang Switcher & Admin Suite Access */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Selection Dropdown */}
            <div className="relative group">
              <button 
                id="lang-switch-btn" 
                className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-neutral-400 hover:text-white bg-neutral-900 border-neutral-800'
                    : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-sm'
                }`}
              >
                <Globe className="w-4 h-4 text-red-500" />
                <span className="font-medium">{languages.find((l) => l.code === currentLang)?.name}</span>
              </button>
              <div className="absolute right-0 top-full pt-2 w-40 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className={`border rounded-xl shadow-2xl py-1 overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-white border-slate-200'
                }`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-200 ${
                        currentLang === l.code
                          ? theme === 'dark'
                            ? 'text-red-500 bg-neutral-900 font-bold'
                            : 'text-red-600 bg-red-50 font-bold'
                          : theme === 'dark'
                            ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 border rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-400 hover:text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
              }`}
              title={theme === 'dark' ? t.themeLight || 'Tema Terang' : t.themeDark || 'Tema Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-500" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-500" />
              )}
            </button>

            {/* Admin Console Entry (Only session status indicator & logout, accessed via /admin URL) */}
            {currentUser && (
              <div className="flex items-center gap-3">
                {/* Admin Session Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                    : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  <img
                    src={currentUser.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-red-500/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop';
                    }}
                  />
                  <span className={`text-xs max-w-[100px] truncate font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Log Out Admin"
                  className={`p-2.5 border rounded-xl transition-all active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-neutral-900 hover:bg-red-950/40 hover:text-red-500 border-neutral-800 hover:border-red-500/20 text-neutral-400'
                      : 'bg-white hover:bg-red-50 hover:text-red-600 border-slate-200 hover:border-red-200 text-slate-500 shadow-sm'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => {
                const nextLangMap: Record<SupportedLanguage, SupportedLanguage> = {
                  id: 'en',
                  en: 'zh',
                  zh: 'ar',
                  ar: 'ja',
                  ja: 'id'
                };
                setLang(nextLangMap[currentLang]);
              }}
              className={`px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 border rounded-lg transition-all ${
                theme === 'dark'
                  ? 'text-neutral-400 border-neutral-850 bg-neutral-900'
                  : 'text-slate-600 border-slate-200 bg-white shadow-sm'
              }`}
            >
              <span>🌐</span>
              <span className="uppercase">{currentLang}</span>
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 border rounded-lg flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-850 text-neutral-400'
                  : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}
              title={theme === 'dark' ? t.themeLight || 'Tema Terang' : t.themeDark || 'Tema Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 border rounded-lg transition-all ${
                theme === 'dark'
                  ? 'text-neutral-400 hover:text-white bg-neutral-900 border-neutral-800'
                  : 'text-slate-600 hover:text-slate-950 bg-white border-slate-200 shadow-sm'
              }`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div 
          id="mobile-menu" 
          className={`lg:hidden border-t px-4 pt-4 pb-6 space-y-4 shadow-2xl transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-neutral-950 border-neutral-900'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id && !isAdmin;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onNavClick) {
                      onNavClick(item.id);
                    } else {
                      setActiveTab(item.id);
                      setIsAdmin(false);
                    }
                    setMobileOpen(false);
                  }}
                  className={`py-3 px-4 text-sm font-semibold rounded-xl text-left transition-all ${
                    isActive
                      ? 'text-white bg-red-600'
                      : theme === 'dark'
                        ? 'text-neutral-400 bg-neutral-900/50 hover:bg-neutral-900 hover:text-white'
                        : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className={`pt-4 border-t flex flex-col gap-3 ${
            theme === 'dark' ? 'border-neutral-900' : 'border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold tracking-widest uppercase ${
                theme === 'dark' ? 'text-neutral-500' : 'text-slate-400'
              }`}>
                {t.languageSelect || 'Pilih Bahasa'}
              </span>
              <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-850'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setMobileOpen(false);
                    }}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      currentLang === l.code ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {l.flag}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex items-center justify-between mb-2 pt-2 border-t ${
              theme === 'dark' ? 'border-neutral-900/40' : 'border-slate-100'
            }`}>
              <span className={`text-xs font-bold tracking-widest uppercase ${
                theme === 'dark' ? 'text-neutral-500' : 'text-slate-400'
              }`}>
                {theme === 'dark' ? t.themeDark || 'Tema Gelap' : t.themeLight || 'Tema Terang'}
              </span>
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setMobileOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs border rounded-lg font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-850 text-neutral-300 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.themeLight || 'Tema Terang'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t.themeDark || 'Tema Gelap'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Auth and Action Section (Only session status indicator & logout, accessed via /admin URL) */}
            {currentUser && (
              <div className="flex flex-col gap-3">
                <div className={`flex items-center gap-3 border p-3 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-850'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <img
                    src={currentUser.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-red-500/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    setMobileOpen(false);
                  }}
                  className={`w-full py-3 flex items-center justify-center gap-2 border font-bold text-sm rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-neutral-900 hover:bg-red-950/20 hover:text-red-500 border-neutral-850 hover:border-red-500/20 text-neutral-400'
                      : 'bg-white hover:bg-red-50 hover:text-red-600 border-slate-200 hover:border-red-200 text-slate-500'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
