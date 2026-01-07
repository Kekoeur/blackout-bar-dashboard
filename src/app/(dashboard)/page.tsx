// apps/bar-dashboard/src/app/(dashboard)/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useBarStore } from '@/store/barStore';
import { barsApi } from '@/lib/api';
import { Plus, Store, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { bars, setBars, selectedBar, setSelectedBar } = useBarStore();

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Charger les bars
  const { data, isLoading } = useQuery({
    queryKey: ['my-bars'],
    queryFn: async () => {
      const { data } = await barsApi.getMyBars();
      return data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (data) {
      setBars(data);
      // Sélectionner le premier bar par défaut
      if (data.length > 0 && !selectedBar) {
        setSelectedBar(data[0]);
      }
    }
  }, [data, setBars, selectedBar, setSelectedBar]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🍸 Bar Dashboard
              </h1>
              <p className="text-slate-400 text-sm">
                Bienvenue, {user?.name}
              </p>
            </div>
            <Link
              href="/bars/new"
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Nouveau bar
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {bars.length === 0 ? (
          // État vide
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Store size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Aucun bar créé
            </h2>
            <p className="text-slate-400 mb-6">
              Créez votre premier bar pour commencer à gérer vos commandes
            </p>
            <Link
              href="/bars/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Créer mon premier bar
            </Link>
          </div>
        ) : (
          // Liste des bars
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bars.map((bar) => (
              <Link
                key={bar.id}
                href={`/bars/${bar.id}`}
                className="group bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                      {bar.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {bar.city} • {bar.address}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bar.role === 'OWNER'
                        ? 'bg-purple-500/20 text-purple-400'
                        : bar.role === 'MANAGER'
                        ? 'bg-blue-500/20 text-blue-400'
                        : bar.role === 'STAFF'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {bar.role === 'OWNER'
                      ? '👑 Propriétaire'
                      : bar.role === 'MANAGER'
                      ? '👔 Gérant'
                      : bar.role === 'STAFF'
                      ? '👨‍💼 Staff'
                      : '👁️ Lecteur'}
                  </span>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                      <Clock size={16} />
                      <span className="text-xs font-medium">En attente</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {bar.pendingOrders || 0}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <Users size={16} />
                      <span className="text-xs font-medium">Photos</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {bar.pendingPhotos || 0}
                    </div>
                  </div>
                </div>

                {/* Badge actif/inactif */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <span
                    className={`inline-flex items-center gap-2 text-sm ${
                      bar.active ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        bar.active ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                    {bar.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}