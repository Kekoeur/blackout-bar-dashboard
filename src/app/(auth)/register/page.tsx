// apps/bar-dashboard/src/app/(auth)/register/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.register(email, password, name);
      login(data.token, data.user);
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🍸 Créer un compte
          </h1>
          <p className="text-slate-400">Commencez à gérer votre bar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="vous@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}