// apps/bar-dashboard/src/app/(dashboard)/bars/[barId]/orders/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useState } from 'react';

interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'VALIDATED' | 'CANCELLED';
  createdAt: string;
  user: {
    username: string;
  };
  items: Array<{
    id: string;
    drink: {
      name: string;
      imageUrl: string;
    };
    assignments?: Array<{
      friendId: string | null;
      friend?: {
        name: string;
      };
    }>;
  }>;
}

export default function OrdersPage() {
  const params = useParams();
  const barId = params.barId as string;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED' | 'CANCELLED'>('PENDING');

  // Récupérer les commandes
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['bar-orders', barId, filter],
    queryFn: async () => {
      const { data } = await api.get(`/orders/bar/${barId}`, {
        params: { status: filter === 'ALL' ? undefined : filter },
      });
      return data;
    },
  });

  // Valider une commande
  const validateMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await api.patch(`/orders/${orderId}/validate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-orders', barId] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats', barId] });
    },
  });

  // Annuler une commande
  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await api.patch(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-orders', barId] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats', barId] });
    },
  });

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
            <h1 className="text-3xl font-bold text-white mb-2">Commandes</h1>
            <p className="text-slate-400">Validez ou annulez les commandes</p>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            {(['ALL', 'PENDING', 'VALIDATED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {status === 'ALL'
                  ? 'Toutes'
                  : status === 'PENDING'
                  ? 'En attente'
                  : status === 'VALIDATED'
                  ? 'Validées'
                  : 'Annulées'}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des commandes */}
        {!orders || orders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <Clock size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Aucune commande
            </h2>
            <p className="text-slate-400">
              Les commandes {filter === 'PENDING' && 'en attente'} apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {order.user.username}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {new Date(order.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Badge status */}
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      order.status === 'VALIDATED'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {order.status === 'VALIDATED'
                      ? '✓ Validée'
                      : order.status === 'PENDING'
                      ? '⏳ En attente'
                      : '✗ Annulée'}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-slate-700/50 rounded-lg p-4"
                    >
                      <img
                        src={item.drink.imageUrl}
                        alt={item.drink.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {item.drink.name}
                        </div>
                        {item.assignments && item.assignments.length > 0 && (
                          <div className="text-slate-400 text-sm mt-1">
                            Pour :{' '}
                            {item.assignments.map((a, i) => (
                              <span key={i}>
                                {a.friendId === null
                                  ? 'Moi'
                                  : a.friend?.name || 'Invité'}
                                {i < item.assignments!.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {order.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={() => validateMutation.mutate(order.id)}
                      disabled={validateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      <CheckCircle size={20} />
                      Valider
                    </button>
                    <button
                      onClick={() => cancelMutation.mutate(order.id)}
                      disabled={cancelMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      <XCircle size={20} />
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}