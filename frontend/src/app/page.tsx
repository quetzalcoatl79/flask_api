'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <main>
      {isAuthenticated ? (
        <>
          <h1 className="text-3xl font-bold mb-4">Bienvenue 👋</h1>
          <p className="mb-4">Ceci est la page d'accueil de votre app Flask avec Next.js !</p>
          {user && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">Informations utilisateur</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Nom d'utilisateur:</span> {user.username}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Prénom:</span> {user.first_name}</p>
                <p><span className="font-medium">Nom:</span> {user.last_name}</p>
                {user.address && <p><span className="font-medium">Adresse:</span> {user.address}</p>}
                {user.phone && <p><span className="font-medium">Téléphone:</span> {user.phone}</p>}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">Bienvenue sur Flask App</h1>
          <p className="mb-4">Connectez-vous pour accéder à votre compte.</p>
          <div className="space-y-4">
            <a
              href="/login"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
            >
              Se connecter
            </a>
            <a
              href="/register"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition ml-4"
            >
              Créer un compte
            </a>
          </div>
        </>
      )}
    </main>
  );
}
