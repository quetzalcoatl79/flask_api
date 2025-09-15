"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Lang = 'fr' | 'en';

export default function NavBar() {
  const [authed, setAuthed] = useState(false);
  const [lang, setLang] = useState<Lang>('fr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<{username:string; email:string} | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  function fetchUser(token: string | null) {
    if (!token) { setUser(null); return; }
    fetch('http://localhost:5000/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUser(d); })
      .catch(() => {});
  }

  function syncAuth() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const isAuthed = !!token;
    if (authed !== isAuthed) {
      setAuthed(isAuthed);
    }
    if (isAuthed && !user) fetchUser(token);
  }

  useEffect(() => {
    // Initial load
    syncAuth();
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('app_lang') as Lang | null;
      if (storedLang) setLang(storedLang);
      const storedTheme = localStorage.getItem('app_theme') as 'light' | 'dark' | null;
      if (storedTheme) applyTheme(storedTheme);
    }
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    }
    function handleAuthChanged() { syncAuth(); }
    function handleStorage(ev: StorageEvent) { if (ev.key === 'access_token') syncAuth(); }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('auth-changed', handleAuthChanged as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('auth-changed', handleAuthChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling de sécurité (si un onglet ne dispatch pas correctement l'event)
  useEffect(() => {
    const id = setInterval(() => {
      try { syncAuth(); } catch(_) {}
    }, 4000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check auth on route change (pathname)
  useEffect(() => { syncAuth(); }, [pathname]);

  const logout = () => {
    try {
      console.debug('[logout] start');
      const token = localStorage.getItem('access_token');
      const call = token ? fetch('http://localhost:5000/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(()=>{}) : Promise.resolve();
      Promise.resolve(call).finally(() => {
        // Sauvegarde préférences à conserver
        const keepLang = localStorage.getItem('app_lang');
        const keepTheme = localStorage.getItem('app_theme');
        // Purge large: localStorage + sessionStorage
        try { localStorage.clear(); } catch(_) {}
        try { sessionStorage.clear(); } catch(_) {}
        // Restaure préférences UI
        if (keepLang) localStorage.setItem('app_lang', keepLang);
        if (keepTheme) localStorage.setItem('app_theme', keepTheme);
        // Double sécurité: re-supprime clés token résiduelles
        ['access_token','refresh_token','token','jwt','auth_token'].forEach(k => { try { localStorage.removeItem(k); } catch(_) {} });
        Object.keys(localStorage).forEach(k => { if (/token|auth|jwt/i.test(k)) { try { localStorage.removeItem(k); } catch(_) {} } });
        setUser(null);
        setAuthed(false);
        setOpenMenu(false);
        window.dispatchEvent(new Event('auth-changed'));
        router.push('/');
        setTimeout(() => { try { router.refresh(); } catch(_){} }, 30);
        setTimeout(() => {
          const still = localStorage.getItem('access_token');
            if (still) {
              console.warn('[logout] token persiste, reload forcé');
              window.location.replace('/');
            } else {
              console.debug('[logout] terminé');
              // Hard reload de sûreté si l’état UI n’a pas reflechi (rare)
              setTimeout(() => {
                const anyToken = Object.keys(localStorage).some(k => /token|auth|jwt/i.test(k));
                if (anyToken) {
                  console.warn('[logout] résidu après second check, hard reload');
                  window.location.href='/'
                }
              }, 160);
            }
        }, 110);
      });
    } catch (e) {
      console.error('[logout] exception', e);
      window.location.href = '/';
    }
  };

  function toggleLang() {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    localStorage.setItem('app_lang', next);
  }

  function applyTheme(t: 'light' | 'dark') {
    setTheme(t);
    localStorage.setItem('app_theme', t);
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      if (t === 'dark') html.classList.add('dark'); else html.classList.remove('dark');
    }
  }

  function toggleTheme() {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  }

  const labels = {
    home: lang === 'fr' ? 'Accueil' : 'Home',
    profile: lang === 'fr' ? 'Profil' : 'Profile',
    espace: lang === 'fr' ? 'Espace' : 'Space',
    login: lang === 'fr' ? 'Login' : 'Login',
    register: lang === 'fr' ? 'Inscription' : 'Register',
    logout: lang === 'fr' ? 'Déconnexion' : 'Logout',
    lang: lang === 'fr' ? 'FR' : 'EN',
    dark: lang === 'fr' ? 'Sombre' : 'Dark',
    light: lang === 'fr' ? 'Clair' : 'Light'
  };

  return (
  <nav className="w-full bg-[var(--bg-alt)]/90 dark:bg-[var(--bg-alt)]/80 backdrop-blur text-[var(--text)] px-6 py-3 flex items-center justify-between border-b border-[var(--border)] dark:border-[var(--border)]">
      <div className="font-semibold text-lg flex items-center gap-3">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Flask/Next Starter</Link>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 uppercase tracking-wider text-blue-700 dark:text-blue-300">v0.1</span>
      </div>
      <div className="flex gap-5 items-center text-sm">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">{labels.home}</Link>
        {authed && <Link href="/espace" className="hover:text-blue-600 dark:hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">{labels.espace}</Link>}
        {!authed && (
          <>
            <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">{labels.login}</Link>
            <Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">{labels.register}</Link>
          </>
        )}
        {authed && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu(o => !o)}
              className="flex items-center gap-2 rounded px-3 py-1 bg-[var(--bg-soft)] border border-[var(--border)] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-haspopup="menu"
              aria-expanded={openMenu}
              type="button"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-[10px] font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="max-w-[90px] truncate text-[var(--text-soft)]">{user?.username || 'user'}</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className={`transition ${openMenu ? 'rotate-180' : ''}`}> <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg>
            </button>
            {openMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-lg border border-[var(--border)] bg-[var(--bg-alt)] shadow-md z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-xs text-[var(--text-faint)] mb-1">{user?.email}</p>
                  <p className="text-sm font-medium text-[var(--text)]">{user?.username}</p>
                </div>
                <ul className="py-1 text-sm">
                  <li>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-[var(--bg-soft)] transition">{labels.profile}</Link>
                  </li>
                  <li>
                    <Link href="/espace" className="block px-4 py-2 hover:bg-[var(--bg-soft)] transition">{labels.espace}</Link>
                  </li>
                  <li>
                    <button type="button" onClick={logout} className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition">{labels.logout}</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 pl-3 ml-2 border-l border-[var(--border)]">
          <button onClick={toggleLang} aria-label="toggle language" className="px-2 py-1 rounded text-xs font-semibold bg-[var(--bg-soft)] hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-[var(--border)] text-[var(--text-soft)] hover:text-blue-700 dark:text-[var(--text-soft)] dark:hover:text-blue-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {labels.lang}
          </button>
          <button onClick={toggleTheme} aria-label="toggle theme" className="px-2 py-1 rounded text-xs font-semibold bg-[var(--bg-soft)] hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-[var(--border)] text-[var(--text-soft)] hover:text-blue-700 dark:hover:text-blue-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {theme === 'light' ? labels.dark : labels.light}
          </button>
        </div>
      </div>
    </nav>
  );
}
