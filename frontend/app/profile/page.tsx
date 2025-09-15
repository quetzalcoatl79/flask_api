"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<'fr'|'en'>('fr');
  const router = useRouter();

  useEffect(() => {
  const stored = localStorage.getItem('app_lang');
  if (stored === 'en' || stored === 'fr') setLang(stored);
  const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    axios.get("http://localhost:5000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data))
      .catch(() => {
        setError(lang === 'fr' ? "Session expirée ou non autorisée." : 'Session expired or unauthorized.');
        localStorage.removeItem("access_token");
        router.push("/login");
      });
  }, [router, lang]);

  const t = (key: string) => {
    const dict: Record<string,{fr:string; en:string}> = {
      title: { fr: 'Profil', en: 'Profile' },
      username: { fr: "Nom d'utilisateur", en: 'Username' },
      email: { fr: 'Email', en: 'Email' },
      logout: { fr: 'Se déconnecter', en: 'Logout' },
      loading: { fr: 'Chargement...', en: 'Loading...' }
    };
    return dict[key]?.[lang] || key;
  };

  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 dark:text-red-400 bg-gray-50 dark:bg-gray-950">{error}</div>;
  if (!user) return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-200">{t('loading')}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">{t('title')}</h2>
        <div className="mb-4 text-gray-800 dark:text-gray-200"><strong>{t('username')} :</strong> {user.username}</div>
        <div className="mb-4 text-gray-800 dark:text-gray-200"><strong>{t('email')} :</strong> {user.email}</div>
        <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 rounded hover:from-red-700 hover:to-pink-700 transition font-medium" onClick={() => {
          localStorage.removeItem("access_token");
          router.push("/login");
        }}>{t('logout')}</button>
      </div>
    </div>
  );
}
