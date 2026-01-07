// apps/bar-dashboard/src/app/(dashboard)/bars/[barId]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { barsApi } from '@/lib/api';
import { useBarStore } from '@/store/barStore';
import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Camera, 
  Users,
  Star,
  Package,
} from 'lucide-react';

export default function BarDetailPage() {
  const params = useParams();
  const barId = params.barId as string;
  const { bars, setSelectedBar } = useBarStore();

  // Sélectionner le bar courant
  useEffect(() => {
    const bar = bars.find((b) => b.id === barId);
    if (bar) {
      setSelectedBar(bar);
    }
  }, [barId, bars, setSelectedBar]);

  // Charger les stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['bar-stats', barId],
    queryFn: async () => {
      const { data } = await barsApi.getBarStats(barId);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de bord
          </h1>
          <p className="text-slate-400">
            Vue d'ensemble de votre activité
          </p>
          <Link
            href={`/bars/${barId}/qrcode`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <QrCode size={20} />
            Voir le QR Code
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Commandes */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Package size={24} />
              </div>
              <TrendingUp size={20} className="text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.totalOrders || 0}
            </div>
            <div className="text-orange-100 text-sm">Commandes validées</div>
          </div>

          {/* Revenu */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign size={24} />
              </div>
              <TrendingUp size={20} className="text-white/60" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.totalRevenue?.toFixed(2) || '0.00'}€
            </div>
            <div className="text-green-100 text-sm">Revenu estimé</div>
          </div>

          {/* Commandes en attente */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.pendingOrders || 0}
            </div>
            <div className="text-yellow-100 text-sm">En attente de validation</div>
          </div>

          {/* Photos en attente */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Camera size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {stats?.pendingPhotos || 0}
            </div>
            <div className="text-purple-100 text-sm">Photos à valider</div>
          </div>
        </div>

        {/* Top Drinks */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6">
            🏆 Top 5 des shooters
          </h2>
          
          {stats?.topDrinks && stats.topDrinks.length > 0 ? (
            <div className="space-y-4">
              {stats.topDrinks.map((drink: any, index: number) => (
                <div
                  key={drink.drinkId}
                  className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {/* Badge de position */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-yellow-900'
                        : index === 1
                        ? 'bg-slate-400 text-slate-900'
                        : index === 2
                        ? 'bg-orange-600 text-orange-100'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* ⭐ Image du shooter */}
                  {drink.drinkImage && (
                    <img 
                      src={drink.drinkImage} 
                      alt={drink.drinkName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}

                  {/* ⭐ Nom du shooter */}
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {drink.drinkName}
                    </div>
                    <div className="text-slate-400 text-sm">
                      ID: {drink.drinkId.substring(0, 8)}...
                    </div>
                  </div>

                  {/* Nombre de commandes */}
                  <div className="text-right">
                    <div className="text-orange-400 font-bold text-2xl">
                      {drink.count}
                    </div>
                    <div className="text-slate-400 text-xs">
                      commande{drink.count > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}