"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lang, setLang] = useState<'fr'|'en'>('fr');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('app_lang');
    if (stored === 'en' || stored === 'fr') setLang(stored);
  }, []);

  const t = (key: string) => {
    const dict: Record<string,{fr:string; en:string}> = {
      title: { fr: 'Inscription', en: 'Register' },
      username: { fr: "Nom d'utilisateur", en: 'Username' },
      email: { fr: 'Email', en: 'Email' },
      password: { fr: 'Mot de passe', en: 'Password' },
      submit: { fr: "S'inscrire", en: 'Sign up' },
      success: { fr: 'Inscription réussie ! Vous pouvez vous connecter.', en: 'Registration successful! You can now login.' },
      error: { fr: "Erreur d'inscription", en: 'Registration error' },
      haveAccount: { fr: 'Déjà inscrit ? Se connecter', en: 'Already registered? Login' }
    };
    return dict[key]?.[lang] || key;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/register", { username, email, password });
      setSuccess(t('success'));
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-changed'));
        }
        router.push("/");
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.msg || t('error'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <form
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-surface p-8 shadow-sm backdrop-blur-sm"
        onSubmit={handleRegister}
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
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          className="w-full rounded bg-gradient-to-r from-blue-600 to-purple-600 py-2 font-medium text-white transition hover:from-blue-700 hover:to-purple-700"
        >
          {t('submit')}
        </button>
        {error && (
          <div className="mt-4 rounded border border-[var(--border-strong)] bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded border border-[var(--border-strong)] bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-500">
            {success}
          </div>
        )}
        <div className="mt-5 text-center">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            {t('haveAccount')}
          </a>
        </div>
      </form>
    </div>
  );
}
