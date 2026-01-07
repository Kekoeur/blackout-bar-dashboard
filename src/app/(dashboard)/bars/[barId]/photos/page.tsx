// apps/bar-dashboard/src/app/(dashboard)/bars/[barId]/photos/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CheckCircle, XCircle, Camera, User, Calendar } from 'lucide-react';
import { useState } from 'react';

interface PhotoSubmission {
  id: string;
  userId: string;
  photoUrl: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
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
    friendId: string | null;
    friend?: {
      name: string;
    };
  }>;
}

export default function PhotosPage() {
  const params = useParams();
  const barId = params.barId as string;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED'>('PENDING');

  // Récupérer les soumissions de photos
  const { data: photos, isLoading } = useQuery<PhotoSubmission[]>({
    queryKey: ['bar-photos', barId, filter],
    queryFn: async () => {
      const { data } = await api.get(`/photos/bar/${barId}`, {
        params: { status: filter === 'ALL' ? undefined : filter },
      });
      return data;
    },
  });

  // Valider une photo
  const validateMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await api.post(`/photos/${photoId}/validate-dashboard`, { barId }); // ⭐ MODIFIER
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-photos', barId] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats', barId] });
    },
  });

  // Rejeter une photo
  const rejectMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await api.post(`/photos/${photoId}/reject-dashboard`, { barId }); // ⭐ MODIFIER
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-photos', barId] });
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
            <h1 className="text-3xl font-bold text-white mb-2">Photos</h1>
            <p className="text-slate-400">Validez les photos des clients</p>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            {(['ALL', 'PENDING', 'VALIDATED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {status === 'ALL'
                  ? 'Toutes'
                  : status === 'PENDING'
                  ? 'En attente'
                  : status === 'VALIDATED'
                  ? 'Validées'
                  : 'Rejetées'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de photos */}
        {!photos || photos.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <Camera size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Aucune photo
            </h2>
            <p className="text-slate-400">
              Les photos {filter === 'PENDING' && 'en attente'} apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
              >
                {/* Photo principale */}
                <div className="relative aspect-video bg-slate-900">
                  <img
                    src={`http://192.168.1.50:3026/${photo.photoUrl}`}
                    alt="Photo soumise"
                    className="w-full h-full object-cover"
                  />
                  {/* Badge status */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                        photo.status === 'VALIDATED'
                          ? 'bg-green-500/80 text-white'
                          : photo.status === 'PENDING'
                          ? 'bg-yellow-500/80 text-white'
                          : 'bg-red-500/80 text-white'
                      }`}
                    >
                      {photo.status === 'VALIDATED'
                        ? '✓ Validée'
                        : photo.status === 'PENDING'
                        ? '⏳ En attente'
                        : '✗ Rejetée'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {photo.user.username}
                      </div>
                      <div className="text-slate-400 text-sm flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(photo.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Drinks */}
                  <div className="space-y-2 mb-4">
                    <div className="text-slate-400 text-sm font-medium">
                      Shooters ({photo.items.length}) :
                    </div>
                    {photo.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-2"
                      >
                        <img
                          src={item.drink.imageUrl}
                          alt={item.drink.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">
                            {item.drink.name}
                          </div>
                          <div className="text-slate-400 text-xs">
                            Pour : {item.friendId === null ? 'Moi' : item.friend?.name || 'Invité'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {photo.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => validateMutation.mutate(photo.id)}
                        disabled={validateMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle size={18} />
                        Valider
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(photo.id)}
                        disabled={rejectMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        <XCircle size={18} />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}