"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState<'fr'|'en'>('fr');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('app_lang');
    if (stored === 'en' || stored === 'fr') setLang(stored);
  }, []);

  const t = (key: string) => {
    const dict: Record<string, {fr:string; en:string}> = {
      title: { fr: 'Connexion', en: 'Login' },
      username: { fr: "Nom d'utilisateur", en: 'Username' },
      password: { fr: 'Mot de passe', en: 'Password' },
      submit: { fr: 'Se connecter', en: 'Sign in' },
      noAccount: { fr: "Pas de compte ? S'inscrire", en: 'No account? Register' },
      error: { fr: 'Erreur de connexion', en: 'Login failed' }
    };
    return dict[key]?.[lang] || key;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/login", { username, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.msg || t('error'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <form
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-surface p-8 shadow-sm backdrop-blur-sm"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text)]">{t('title')}</h2>
        <input
          type="text"
          placeholder={t('username')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-4 rounded border border-[var(--border-strong)] bg-soft px-3 py-2 text-[var(--text)] placeholder-[var(--text-faint)] focus:border-[var(--focus)]"
          required
        />
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 rounded border border-[var(--border-strong)] bg-soft px-3 py-2 text-[var(--text)] placeholder-[var(--text-faint)] focus:border-[var(--focus)]"
          required
        />
        <button
          type="submit"
          className="w-full rounded bg-gradient-to-r from-blue-600 to-purple-600 py-2 font-medium text-white transition hover:from-blue-700 hover:to-purple-700 focus-visible:outline-none"
        >
          {t('submit')}
        </button>
        {error && (
          <div className="mt-4 rounded border border-[var(--border-strong)] bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-500">
            {error}
          </div>
        )}
        <div className="mt-5 text-center">
          <a
            href="/register"
            className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            {t('noAccount')}
          </a>
        </div>
      </form>
    </div>
  );
}
