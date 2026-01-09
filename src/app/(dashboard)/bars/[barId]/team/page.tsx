// apps/bar-dashboard/src/app/(dashboard)/bars/[barId]/team/page.tsx

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { invitationsApi } from '@/lib/api';
import { 
  Mail, 
  UserPlus, 
  Trash2, 
  Shield,
  Eye,
  Users as UsersIcon,
  Crown,
  Copy,
  Check,
} from 'lucide-react';

export default function TeamPage() {
  const params = useParams();
  const barId = params.barId as string;
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger l'équipe
  const { data: team, isLoading } = useQuery({
    queryKey: ['bar-team', barId],
    queryFn: async () => {
      const { data } = await api.get(`/bar-management/bars/${barId}/team`);
      return data;
    },
  });

  // Mutation pour changer le rôle
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/bar-management/bars/${barId}/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-team', barId] });
    },
  });

  // Mutation pour supprimer
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/bar-management/bars/${barId}/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-team', barId] });
    },
  });

  const getRoleBadge = (role: string) => {
    const badges = {
      OWNER: { color: 'bg-red-500/20 text-red-400', icon: Crown, label: 'Propriétaire' },
      MANAGER: { color: 'bg-purple-500/20 text-purple-400', icon: Shield, label: 'Manager' },
      STAFF: { color: 'bg-blue-500/20 text-blue-400', icon: UsersIcon, label: 'Staff' },
      VIEWER: { color: 'bg-slate-500/20 text-slate-400', icon: Eye, label: 'Viewer' },
    };
    return badges[role as keyof typeof badges] || badges.VIEWER;
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
              👥 Équipe
            </h1>
            <p className="text-slate-400">
              {team?.length || 0} membre{team && team.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <UserPlus size={20} />
              Créer un utilisateur
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <Mail size={20} />
              Inviter par email
            </button>
          </div>
        </div>

        {/* Liste de l'équipe */}
        <div className="space-y-4">
          {team?.map((member: any) => {
            const badge = getRoleBadge(member.role);
            const Icon = badge.icon;

            return (
              <div
                key={member.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {member.barUser.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {member.barUser.name}
                        </h3>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                          <Icon size={14} />
                          {badge.label}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm mb-3">
                        {member.barUser.email}
                      </div>
                      <div className="text-slate-500 text-xs">
                        Membre depuis le {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                        {member.barUser._count.createdDrinks > 0 && (
                          <> • {member.barUser._count.createdDrinks} drink{member.barUser._count.createdDrinks > 1 ? 's' : ''} créé{member.barUser._count.createdDrinks > 1 ? 's' : ''}</>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {member.role !== 'OWNER' && (
                    <div className="flex gap-2">
                      {/* Changer le rôle */}
                      <select
                        value={member.role}
                        onChange={(e) => {
                          if (confirm(`Changer le rôle de ${member.barUser.name} ?`)) {
                            changeRoleMutation.mutate({
                              userId: member.barUser.id,
                              role: e.target.value,
                            });
                          }
                        }}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="STAFF">Staff</option>
                        <option value="MANAGER">Manager</option>
                      </select>

                      {/* Supprimer */}
                      <button
                        onClick={() => {
                          if (confirm(`Retirer ${member.barUser.name} de l'équipe ?`)) {
                            removeUserMutation.mutate(member.barUser.id);
                          }
                        }}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal invitation par email */}
        {showInviteModal && (
          <InviteByEmailModal
            barId={barId}
            onClose={() => setShowInviteModal(false)}
          />
        )}

        {/* Modal création directe */}
        {showCreateModal && (
          <CreateUserModal
            barId={barId}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Modal invitation par email
function InviteByEmailModal({ barId, onClose }: { barId: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'STAFF' | 'MANAGER'>('VIEWER');
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const { data } = await invitationsApi.createInvitation(barId, { email, role });
      return data;
    },
    onSuccess: (data) => {
      setInvitationLink(data.invitationLink);
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Inviter par email</h2>
          <p className="text-slate-400 text-sm mt-1">
            Envoyez un lien d'invitation à un nouveau membre
          </p>
        </div>

        <div className="p-6 space-y-4">
          {!invitationLink ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="membre@exemple.com"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="VIEWER">Viewer - Lecture seule</option>
                  <option value="STAFF">Staff - Validation des commandes</option>
                  <option value="MANAGER">Manager - Gestion complète</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="text-green-400 font-medium mb-2">
                  ✅ Invitation créée !
                </div>
                <p className="text-slate-300 text-sm">
                  Copiez ce lien et envoyez-le à {email}
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {invitationLink ? 'Fermer' : 'Annuler'}
          </button>
          {!invitationLink && (
            <button
              onClick={() => inviteMutation.mutate()}
              disabled={!email || inviteMutation.isPending}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {inviteMutation.isPending ? 'Création...' : 'Créer l\'invitation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal création directe
function CreateUserModal({ barId, onClose }: { barId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'STAFF' | 'MANAGER'>('VIEWER');

  const createMutation = useMutation({
    mutationFn: async () => {
      await invitationsApi.createUserDirectly(barId, { email, name, password, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-team', barId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Créer un utilisateur</h2>
          <p className="text-slate-400 text-sm mt-1">
            Créez directement un compte pour un nouveau membre
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe temporaire
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="VIEWER">Viewer - Lecture seule</option>
              <option value="STAFF">Staff - Validation des commandes</option>
              <option value="MANAGER">Manager - Gestion complète</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!email || !name || !password || createMutation.isPending}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {createMutation.isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}