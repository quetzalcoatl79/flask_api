"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface Stat { value: string; label: string; desc?: string }
interface Service { title: string; description: string; features: string[] }

const stats: Stat[] = [
  { value: '99.99%', label: 'Uptime', desc: 'Disponibilité API' },
  { value: '<50ms', label: 'Latence', desc: 'Réponse moyenne' },
  { value: '1.2k', label: 'Req/s', desc: 'Charge soutenue' },
  { value: '100%', label: 'TLS', desc: 'Chiffrement' },
];

const services: Service[] = [
  { title: 'API Sécurisée', description: 'JWT, refresh tokens, CORS contrôlé.', features: ['JWT', 'Refresh', 'CORS', 'Rate-limit (à venir)'] },
  { title: 'Tasks Async', description: 'Exécution différée & distribuée via Celery.', features: ['Redis broker', 'Retry', 'Monitoring (future)'] },
  { title: 'Base Postgres', description: 'Stockage fiable relationnel & migrations.', features: ['SQLAlchemy', 'Migrations', 'Index'] },
  { title: 'Front Next.js', description: 'UI moderne réactive Tailwind.', features: ['App Router', 'Hydration', 'Optimisation'] },
  { title: 'Docker Stack', description: 'Environnements isolés reproductibles.', features: ['Compose', 'Multi-services', 'Isolation'] },
  { title: 'Extensible', description: 'Architecture modulaire prête pour scaling.', features: ['Blueprints', 'Services', 'Hooks'] },
];

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'ok' | 'down' | 'loading'>('loading');
  const [dbStatus, setDbStatus] = useState<'ok' | 'down' | 'unknown'>('unknown');
  const [celeryStatus, setCeleryStatus] = useState<'ok' | 'down' | 'unknown'>('unknown');
    const [me, setMe] = useState<any>(null);
    const [version, setVersion] = useState<string>('');
    const [uptime, setUptime] = useState<number>(0);
    const [warming, setWarming] = useState<boolean>(false);
  const [authError, setAuthError] = useState('');

  

  // Charge API + utilisateur initial (avec retries)
  const loadMe = useCallback((attempt: number = 1) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { setMe(null); setAuthError(''); return; }
    axios.get('http://localhost:5000/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { 
        setMe(res.data); 
        setAuthError(''); 
      })
      .catch(error => {
        // Vérifier le type d'erreur
        if (error.response && (error.response.status === 422 || error.response.status === 401)) {
          // Token invalide ou expiré - nettoyer immédiatement
          localStorage.removeItem('access_token');
          setMe(null);
          setAuthError('');
          // Dispatcher un événement pour que les autres composants se mettent à jour
          window.dispatchEvent(new Event('auth-changed'));
        } else if (attempt < 3) {
          // Erreur de réseau ou autre - retry
          setTimeout(() => loadMe(attempt + 1), attempt * 400);
        } else {
          setAuthError('Erreur de connexion');
          setMe(null);
        }
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchHealth = async () => {
      const maxAttempts = 4;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const res = await axios.get('http://localhost:5000/health');
          if (cancelled) return;
          setApiStatus('ok');
          const h = res.data;
            setDbStatus(h.db ? 'ok' : 'down');
            setCeleryStatus(h.celery ? 'ok' : 'down');
            setVersion(h.version || '');
            setUptime(h.uptime_seconds || 0);
            setWarming(!!h.startup_grace);
          break;
        } catch (e) {
          if (attempt === maxAttempts) {
            if (cancelled) return;
            setApiStatus('down');
            setDbStatus('down');
            setCeleryStatus('down');
          } else {
            await new Promise(r => setTimeout(r, attempt * 300));
          }
        }
      }
    };
    fetchHealth();
    loadMe();
    return () => { cancelled = true; };
  }, [loadMe]);

  // (definition loadMe déjà déplacée au-dessus)

  // Écoute des changements d'auth (logout / login ailleurs)
  useEffect(() => {
  const onAuthChange = () => loadMe(1);
    const onStorage = (e: StorageEvent) => {
  if (e.key === 'access_token') loadMe(1);
    };
    window.addEventListener('auth-changed', onAuthChange as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth-changed', onAuthChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadMe]);

  return (
    <div className="relative">      
  <Hero apiStatus={apiStatus} dbStatus={dbStatus} celeryStatus={celeryStatus} me={me} authError={authError} version={version} warming={warming} />
      <HighlightStats />
      <ServiceGrid />
      <CTA />
    </div>
  );
}

function Hero({ apiStatus, dbStatus, celeryStatus, me, authError, version, warming }: { apiStatus: string; dbStatus: string; celeryStatus: string; me: any; authError: string; version: string; warming: boolean }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const target = React.useRef({ x: 0, y: 0 });
  const current = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      target.current.x = nx;
      target.current.y = ny;
      if (!rafRef.current) raf();
    }
    function raf() {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      document.documentElement.style.setProperty('--parallax-x', current.current.x.toString());
      document.documentElement.style.setProperty('--parallax-y', current.current.y.toString());
      rafRef.current = requestAnimationFrame(raf);
      const dx = Math.abs(current.current.x - target.current.x);
      const dy = Math.abs(current.current.y - target.current.y);
      if (dx < 0.0005 && dy < 0.0005) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative flex items-center overflow-hidden pt-28 pb-24">
      <BackgroundGlow />
      <ParallaxDecor />
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_.9fr] gap-14 w-full">
        <div className="space-y-10">
          <div className="glass stripes inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-wider uppercase font-medium shadow-sm">
            <span className={`w-2 h-2 rounded-full ${apiStatus==='ok' ? (warming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400') : apiStatus==='down' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'}`}></span>
            <span className="text-[var(--text-soft)]">API {apiStatus === 'ok' ? (warming ? 'WARM' : 'OK') : apiStatus === 'down' ? 'KO' : '...'}</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-semibold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">Starter Fullstack</span>
            <span className="block text-[var(--text-soft)] text-xl mt-4 font-normal">Flask • Next.js • Celery • Postgres</span>
          </h1>
          {me && (
            <p className="text-sm text-[var(--text-soft)]">Bonjour <span className="font-semibold text-[var(--text)]">{me.username}</span> 👋</p>
          )}
          <p className="max-w-xl text-[var(--text-soft)] leading-relaxed text-base md:text-lg">
            Base épurée, rapide à étendre. Auth JWT, tâches asynchrones, design système minimal glass. Conçue pour scaler proprement sans surcharge visuelle.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] tracking-wide">
            {['JWT','Refresh','Postgres','Redis','Celery','Tailwind','Docker','Scale'].map(t => (
              <span key={t} className="glass px-3 py-1 rounded-full shadow-sm text-[var(--text-soft)] border border-white/40 dark:border-white/10">{t}</span>
            ))}
          </div>
          <div>
            {me ? (
              <div className="glass stripes p-4 rounded-xl text-sm inline-flex flex-col gap-1 min-w-[260px]">
                <span className="text-[var(--text-faint)]">Connecté</span>
                <span className="font-medium text-[var(--text)]">{me.username} <span className="text-[var(--text-faint)]">({me.email})</span></span>
              </div>
            ) : (
              <div className="glass p-4 rounded-xl text-sm inline-block min-w-[260px] text-[var(--text-faint)]">Non connecté. Login / Register {authError && <span className="text-rose-500 ml-1">{authError}</span>}</div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass stripes rounded-2xl p-8">
            <h3 className="font-medium mb-6 tracking-wide text-[var(--text-soft)]">Statut système</h3>
            <div className="space-y-4 text-sm">
              <StatusRow label="Backend" value={apiStatus === 'ok' ? (warming ? 'WARM' : 'OK') : apiStatus === 'down' ? 'KO' : '...'} color={apiStatus==='ok' ? (warming ? 'amber' : 'emerald') : apiStatus==='down' ? 'rose' : 'gray'} />
              <StatusRow label="DB" value={dbStatus === 'ok' ? 'OK' : dbStatus === 'down' ? 'KO' : '?'} color={dbStatus==='ok' ? 'purple' : dbStatus==='down' ? 'rose' : 'gray'} />
              <StatusRow label="Tasks" value={celeryStatus === 'ok' ? 'OK' : celeryStatus === 'down' ? 'KO' : '?'} color={celeryStatus==='ok' ? 'blue' : celeryStatus==='down' ? 'rose' : 'gray'} />
              <StatusRow label="Auth" value={me ? 'Connecté' : (authError ? 'Expiré' : 'Anonyme')} color={me ? 'emerald' : authError ? 'rose' : 'gray'} />
              {version && <StatusRow label="Version" value={version} color={'gray'} />}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <MiniMetric value="47ms" label="Latency" />
              <MiniMetric value="1.2k" label="Req/s" />
              <MiniMetric value="16" label="Workers" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-semibold">v0.1</span>
              <span className="text-[10px] tracking-wider text-[var(--text-faint)] mt-1">BUILD</span>
            </div>
            <div className="glass p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-semibold">24</span>
              <span className="text-[10px] tracking-wider text-[var(--text-faint)] mt-1">ENDPOINTS*</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ParallaxDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <div className="parallax-layer absolute top-[-18%] left-[-10%] w-[620px] h-[620px] rounded-full blur-3xl bg-gradient-to-br from-blue-500/22 via-cyan-400/15 to-transparent" style={{ transform: 'translate3d(calc(var(--parallax-x)*-50px),calc(var(--parallax-y)*-60px),0)' }} />
      <div className="parallax-layer absolute bottom-[-25%] right-[-15%] w-[680px] h-[680px] rounded-full blur-3xl bg-gradient-to-tr from-fuchsia-500/20 via-purple-500/15 to-transparent" style={{ transform: 'translate3d(calc(var(--parallax-x)*70px),calc(var(--parallax-y)*80px),0)' }} />
      <div className="parallax-layer absolute top-[50%] left-[55%] w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl bg-gradient-to-tr from-emerald-400/25 via-teal-400/10 to-transparent" style={{ transform: 'translate3d(calc(var(--parallax-x)*40px),calc(var(--parallax-y)*-45px),0)' }} />
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_40%,rgba(255,255,255,0.65),transparent_60%)] dark:bg-[radial-gradient(circle_at_35%_40%,rgba(255,255,255,0.08),transparent_60%)] transition-colors" />
  );
}

function StatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string,string> = {
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-400',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-400'
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="flex items-center gap-2 font-medium text-gray-800">
        <span className={`w-2 h-2 rounded-full ${colorMap[color] || 'bg-gray-400'}`}></span>{value}
      </span>
    </div>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-3 rounded-lg glass text-sm">
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">{label}</div>
    </div>
  );
}

function HighlightStats() {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="group relative p-6 rounded-2xl glass hover:shadow-lg transition-all">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">{s.value}</div>
            <div className="text-sm font-medium text-[var(--text)] mt-1">{s.label}</div>
            {s.desc && <div className="text-xs text-[var(--text-faint)] mt-1">{s.desc}</div>}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-blue-400/40 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceGrid() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Capacités intégrées</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(s => (
            <div key={s.title} className="relative group p-6 rounded-2xl glass hover:shadow-xl transition-all overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_60%)]" />
              <h3 className="font-semibold text-lg mb-2 tracking-wide relative z-10">{s.title}</h3>
              <p className="text-sm text-[var(--text-soft)] mb-4 leading-relaxed relative z-10">{s.description}</p>
              <ul className="text-xs space-y-1 relative z-10">
                {s.features.map(f => <li key={f} className="flex items-center gap-2"><span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/70" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.18),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
      <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">Construis plus vite</h2>
        <p className="text-base md:text-lg text-[var(--text-soft)] leading-relaxed">Ajoute ensuite ACL, rate limiting, observabilité, multi-tenancy, workers dédiés. Cette base reste légère et lisible tout en couvrant le socle.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/register" className="glass px-8 py-3 rounded-full font-medium text-[var(--text)] hover:shadow-lg transition">Créer un compte</a>
          <a href="/login" className="px-8 py-3 rounded-full border border-[var(--border)] bg-soft font-medium text-[var(--text-soft)] hover:text-[var(--text)] transition">Se connecter</a>
        </div>
      </div>
    </section>
  );
}



