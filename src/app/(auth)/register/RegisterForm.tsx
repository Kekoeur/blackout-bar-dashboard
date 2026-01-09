// apps/bar-dashboard/src/app/register/RegisterForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi, invitationsApi } from '@/lib/api';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Vérifier le token
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['verify-invitation', token],
    queryFn: async () => {
      if (!token) throw new Error('Token manquant');
      const { data } = await invitationsApi.verifyInvitation(token);
      return data;
    },
    enabled: !!token,
    retry: false,
  });

  // Mutation register
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Token manquant');
      const { data } = await authApi.register({ token, name, password });
      return data;
    },
    onSuccess: (data) => {
      // Stocker le token
      localStorage.setItem('bar_dashboard_token', data.token);
      // Rediriger vers le dashboard
      router.push('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    registerMutation.mutate();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-4">❌ Invitation invalide</h1>
          <p className="text-slate-400 mb-6">
            Le lien d'invitation est manquant ou invalide.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Vérification de l'invitation...</div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-4">❌ Invitation invalide</h1>
          <p className="text-slate-400 mb-6">
            Cette invitation est expirée, a déjà été utilisée, ou n'existe pas.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎉 Créer votre compte
          </h1>
          <p className="text-slate-400">
            Vous avez été invité à rejoindre <span className="text-orange-400 font-semibold">{invitation.barName}</span>
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium">
            Rôle: {invitation.role}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={invitation.email}
              readOnly
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retapez votre mot de passe"
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
          >
            {registerMutation.isPending ? 'Création du compte...' : 'Créer mon compte'}
          </button>

          {/* Error */}
          {registerMutation.error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {(registerMutation.error as any).response?.data?.message || 'Une erreur est survenue'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}