// apps/bar-dashboard/src/app/(dashboard)/bars/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { barsApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const createBarMutation = useMutation({
    mutationFn: (data: { name: string; city: string; address: string }) =>
      barsApi.createBar(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['my-bars'] });
      router.push(`/bars/${response.data.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !city || !address) {
      setError('Tous les champs sont requis');
      return;
    }

    createBarMutation.mutate({ name, city, address });
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </Link>
          <h1 className="text-3xl font-bold text-white">Créer un nouveau bar</h1>
          <p className="text-slate-400 mt-2">
            Remplissez les informations de votre établissement
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom du bar *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Le Shooter Paradise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ville *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Angers"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="12 Rue des Lices"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createBarMutation.isPending}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                {createBarMutation.isPending ? 'Création...' : 'Créer le bar'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              ℹ️ Une fois créé, vous recevrez une clé API et un QR code pour votre bar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}