"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EspacePersoPage() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<{username:string; email:string}|null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      setAuthed(true);
      fetch('http://localhost:5000/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setUser(d); })
        .catch(() => {});
    }
  }, []);

  if (!authed) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Espace personnel</h1>
        <p className="text-[var(--text-soft)] mb-4">Vous devez être connecté pour accéder à cette page.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-5 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">Login</Link>
          <Link href="/register" className="px-5 py-2 rounded border border-[var(--border)] bg-[var(--bg-soft)] font-medium">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-8">Espace personnel</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-surface p-6">
          <h2 className="font-semibold mb-2">Profil</h2>
          <p className="text-sm text-[var(--text-faint)] mb-2">Nom d'utilisateur</p>
          <p className="text-[var(--text)] font-medium">{user?.username}</p>
          <p className="text-sm text-[var(--text-faint)] mt-4 mb-1">Email</p>
          <p className="text-[var(--text)] font-medium">{user?.email}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-surface p-6">
          <h2 className="font-semibold mb-2">Activité</h2>
          <p className="text-sm text-[var(--text-faint)]">Historique des actions (à implémenter).</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-surface p-6">
            <h2 className="font-semibold mb-2">Tâches</h2>
            <p className="text-sm text-[var(--text-faint)]">Intégration Celery à venir.</p>
        </div>
      </div>
    </div>
  );
}
