// apps/bar-dashboard/src/app/(dashboard)/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useBarStore } from '@/store/barStore';
import { barsApi } from '@/lib/api';
import { Power, Plus, Store, ChevronRight, AlertTriangle, CheckCircle, Crown, Shield, Users as UsersIcon, Eye } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { setBars, setSelectedBar } = useBarStore();

  // Rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Charger les bars
  const { data: bars, isLoading } = useQuery({
    queryKey: ['my-bars'],
    queryFn: async () => {
      const { data } = await barsApi.getMyBars();
      return data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (bars) {
      setBars(bars);
      // Sélectionner le premier bar par défaut
      if (bars.length > 0) {
        setSelectedBar(bars[0]);
      }
    }
  }, [bars, setBars, setSelectedBar]);

  // Helper pour les icônes de rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return Crown;
      case 'MANAGER': return Shield;
      case 'STAFF': return UsersIcon;
      case 'VIEWER': return Eye;
      default: return Eye;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Propriétaire';
      case 'MANAGER': return 'Manager';
      case 'STAFF': return 'Staff';
      case 'VIEWER': return 'Viewer';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MANAGER': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'STAFF': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'VIEWER': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Mes Bars
            </h1>
            <p className="text-slate-400">
              {bars?.length || 0} bar{bars && bars.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {bars && bars.length === 0 ? (
          // État vide
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Store size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Aucun bar créé
            </h2>
            <p className="text-slate-400 mb-6">
              Créez votre premier bar pour commencer à gérer vos commandes
            </p>
            <button
              onClick={() => router.push('/bars/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Créer mon premier bar
            </button>
          </div>
        ) : (
          // Liste des bars
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bars?.map((bar: any) => {
              const RoleIcon = getRoleIcon(bar.role);
              
              return (
                <Link
                  key={bar.id}
                  href={`/bars/${bar.id}`}
                  className="group bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Store className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                          {bar.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{bar.city}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                  </div>

                  {/* ⭐ Badges statut + rôle */}
                  <div className="flex gap-2 mb-4">
                    {/* Badge statut */}
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${
                        bar.active
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      {bar.active ? (
                        <>
                          <CheckCircle size={12} />
                          Actif
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          Inactif
                        </>
                      )}
                    </span>

                    {/* Badge rôle */}
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleColor(bar.role)}`}>
                      <RoleIcon size={12} />
                      {getRoleLabel(bar.role)}
                    </span>
                  </div>

                  <div className="text-slate-400 text-sm mb-4">
                    📍 {bar.address}
                  </div>

                  {/* ⭐ Message si inactif et owner */}
                  {!bar.active && bar.role === 'OWNER' && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-orange-400 text-xs flex items-center gap-2">
                        <Power size={14} />
                        Cliquez pour activer votre bar
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}