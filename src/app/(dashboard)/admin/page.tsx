
// apps/bar-dashboard/src/app/(dashboard)/admin/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { 
  Trash2, 
  Power, 
  PowerOff, 
  UserPlus, 
  Mail, 
  Edit,
  Eye,
  AlertTriangle,
  TrendingUp,
  Users,
  Store,
  DollarSign,
  ShoppingCart,
  Smartphone,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'stats' | 'bars' | 'users' | 'orders' | 'mobile-users'>('stats');

  // Charger les stats globales
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await adminApi.getGlobalStats();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔐 Administration
          </h1>
          <p className="text-slate-400">Panel super administrateur</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['stats', 'bars', 'users', 'orders', 'mobile-users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab === 'stats' && '📊 Statistiques'}
              {tab === 'bars' && '🏪 Bars'}
              {tab === 'users' && '👥 Utilisateurs Dashboard'}
              {tab === 'orders' && '🛒 Commandes'}
              {tab === 'mobile-users' && '📱 Utilisateurs Mobile'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'stats' && <StatsTab stats={stats} isLoading={statsLoading} />}
        {activeTab === 'bars' && <BarsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'mobile-users' && <MobileUsersTab />}
      </div>
    </div>
  );
}

// =============== ONGLET STATISTIQUES ===============

function StatsTab({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Store size={24} />
            </div>
            <TrendingUp size={20} className="text-white/60" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalBars || 0}</div>
          <div className="text-blue-100 text-sm">Total Bars</div>
          <div className="text-blue-200 text-xs mt-2">
            {stats?.activeBars || 0} actifs • {stats?.inactiveBars || 0} inactifs
          </div>
        </div>

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
          <div className="text-green-100 text-sm">Revenu Total</div>
          <div className="text-green-200 text-xs mt-2">
            {stats?.totalOrders || 0} commandes
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users size={24} />
            </div>
            <TrendingUp size={20} className="text-white/60" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalUsers || 0}</div>
          <div className="text-purple-100 text-sm">Utilisateurs Dashboard</div>
          <div className="text-purple-200 text-xs mt-2">
            Propriétaires et staff
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.totalOrders || 0}</div>
          <div className="text-orange-100 text-sm">Commandes Validées</div>
          <div className="text-orange-200 text-xs mt-2">
            Toutes plateformes
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== ONGLET BARS ===============


function BarsTab() {
  const queryClient = useQueryClient();
  const [selectedBar, setSelectedBar] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Charger tous les bars
  const { data: bars, isLoading } = useQuery({
    queryKey: ['admin-bars'],
    queryFn: async () => {
      const { data } = await adminApi.getAllBars();
      return data;
    },
  });

  // Mutation pour toggle active
  const toggleActiveMutation = useMutation({
    mutationFn: (barId: string) => adminApi.toggleBarActive(barId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bars'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('✅ Statut du bar mis à jour !');
    },
  });

  // Mutation pour supprimer
  const deleteBarMutation = useMutation({
    mutationFn: (barId: string) => adminApi.deleteBar(barId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bars'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('✅ Bar supprimé avec succès !');
    },
    onError: () => {
      alert('❌ Erreur lors de la suppression du bar');
    },
  });

  // Filtrer les bars
  const filteredBars = bars?.filter((bar: any) => {
    const matchesSearch = 
      bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && bar.active) ||
      (statusFilter === 'INACTIVE' && !bar.active);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bars</h2>
          <p className="text-slate-400">
            {filteredBars?.length || 0} / {bars?.length || 0} bar(s)
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="INACTIVE">Inactifs</option>
        </select>
      </div>

      {/* Liste des bars */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBars?.map((bar: any) => (
          <div
            key={bar.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{bar.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bar.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {bar.active ? '✓ Actif' : '⏸ Inactif'}
                  </span>
                </div>
                <div className="text-slate-400 text-sm mb-2">{bar.city} • {bar.address}</div>
                <div className="text-slate-500 text-xs">
                  Créé le {new Date(bar.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActiveMutation.mutate(bar.id)}
                  disabled={toggleActiveMutation.isPending}
                  className={`p-2 rounded-lg transition-colors ${
                    bar.active
                      ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                  title={bar.active ? 'Désactiver' : 'Activer'}
                >
                  {bar.active ? <PowerOff size={20} /> : <Power size={20} />}
                </button>
                <button
                  onClick={() => setSelectedBar(bar)}
                  className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                  title="Voir les détails"
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`⚠️ ATTENTION : Supprimer "${bar.name}" ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n- Le bar\n- Tous les menus\n- Toutes les commandes\n- Toutes les photos\n- Tous les accès utilisateurs\n\nTapez le nom du bar pour confirmer : "${bar.name}"`)) {
                      const confirmation = prompt(`Pour confirmer, tapez le nom exact du bar :\n"${bar.name}"`);
                      if (confirmation === bar.name) {
                        deleteBarMutation.mutate(bar.id);
                      } else {
                        alert('❌ Nom incorrect, suppression annulée');
                      }
                    }
                  }}
                  disabled={deleteBarMutation.isPending}
                  className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  title="Supprimer définitivement"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredBars?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun bar trouvé
            </h3>
            <p className="text-slate-400">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modal détails bar */}
      {selectedBar && (
        <BarDetailsModal
          bar={selectedBar}
          onClose={() => setSelectedBar(null)}
        />
      )}
    </div>
  );
}

// Modal détails bar
function BarDetailsModal({ bar, onClose }: { bar: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{bar.name}</h2>
          <p className="text-slate-400">{bar.city}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Adresse:</span>
                <span className="text-white">{bar.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Statut:</span>
                <span className={bar.active ? 'text-green-400' : 'text-red-400'}>
                  {bar.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date de création:</span>
                <span className="text-white">
                  {new Date(bar.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">API Key</h3>
            <div className="bg-slate-700 rounded-lg p-3">
              <code className="text-slate-300 text-sm break-all">{bar.apiKey}</code>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== ONGLET UTILISATEURS ===============

// Modal créer owner
function CreateOwnerModal({
  onClose,
  onCreate,
  isLoading,
}: {
  onClose: () => void;
  onCreate: (data: { email: string; name: string; password: string }) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!email || !name || !password) {
      alert('Tous les champs sont obligatoires');
      return;
    }
    onCreate({ email, name, password });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Créer un Owner</h2>
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
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose }: { user: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  // Mutation pour mettre à jour
  const updateMutation = useMutation({
    mutationFn: async () => {
      await adminApi.updateUser(user.id, { name, email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Éditer {user.name}</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Nom */}
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

          {/* Email */}
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

          {/* Accès aux bars */}
          {user.barAccess && user.barAccess.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Accès aux bars
              </label>
              <div className="space-y-2">
                {user.barAccess.map((access: any) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">
                        {access.bar.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {access.role}
                      </div>
                    </div>
                    {access.role !== 'OWNER' && (
                      <button
                        onClick={() => setShowPromoteModal(true)}
                        className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors"
                      >
                        Promouvoir Owner
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {user._count.barAccess}
              </div>
              <div className="text-slate-400 text-xs">Bars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {user._count.createdDrinks}
              </div>
              <div className="text-slate-400 text-xs">Drinks créés</div>
            </div>
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
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Modal de promotion */}
      {showPromoteModal && (
        <PromoteToOwnerModal
          user={user}
          onClose={() => setShowPromoteModal(false)}
          onSuccess={() => {
            setShowPromoteModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}

function PromoteToOwnerModal({
  user,
  onClose,
  onSuccess,
}: {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedBarId, setSelectedBarId] = useState('');

  // Charger tous les bars
  const { data: bars } = useQuery({
    queryKey: ['admin-bars'],
    queryFn: async () => {
      const { data } = await adminApi.getAllBars();
      return data;
    },
  });

  // Mutation pour promouvoir
  const promoteMutation = useMutation({
    mutationFn: async () => {
      await adminApi.promoteToOwner(user.id, selectedBarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onSuccess();
    },
  });

  // Bars où l'user n'a pas encore accès ou n'est pas OWNER
  const availableBars = bars?.filter((bar: any) => {
    const userAccess = user.barAccess?.find((a: any) => a.bar.id === bar.id);
    return !userAccess || userAccess.role !== 'OWNER';
  });

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border-2 border-orange-500">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            👑 Promouvoir {user.name} à OWNER
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Sélectionnez le bar dont il deviendra propriétaire
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bar
          </label>
          <select
            value={selectedBarId}
            onChange={(e) => setSelectedBarId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="">Sélectionner un bar...</option>
            {availableBars?.map((bar: any) => (
              <option key={bar.id} value={bar.id}>
                {bar.name} - {bar.city}
              </option>
            ))}
          </select>

          {selectedBarId && (
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-orange-200">
                  <strong className="block mb-1">Attention :</strong>
                  Cette action donnera tous les droits de propriétaire à {user.name} sur ce bar.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => promoteMutation.mutate()}
            disabled={!selectedBarId || promoteMutation.isPending}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {promoteMutation.isPending ? 'Promotion...' : 'Promouvoir'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER'>('ALL');

  // Charger tous les users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await adminApi.getAllUsers();
      return data;
    },
  });

  // Mutation pour créer un owner
  const createOwnerMutation = useMutation({
    mutationFn: (data: { email: string; name: string; password: string }) =>
      adminApi.createOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreateOwner(false);
    },
  });

  // Mutation pour supprimer
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  // Mutation pour envoyer reset password
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminApi.sendPasswordResetEmail(userId),
    onSuccess: (data) => {
      alert(`Email envoyé ! ${data.data.resetToken ? `Token: ${data.data.resetToken}` : ''}`);
    },
  });

  // Filtrer les users
  const filteredUsers = users?.filter((user: any) => {
    // Recherche par nom ou email
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtre par rôle
    let matchesRole = true;
    if (roleFilter !== 'ALL') {
      matchesRole = user.barAccess?.some((access: any) => access.role === roleFilter);
    }

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton créer */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Utilisateurs</h2>
          <p className="text-slate-400">
            {filteredUsers?.length || 0} / {users?.length || 0} utilisateur(s)
          </p>
        </div>
        <button
          onClick={() => setShowCreateOwner(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <UserPlus size={20} />
          Créer un Owner
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex gap-4">
        {/* Recherche */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Filtre par rôle */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ALL">Tous les rôles</option>
          <option value="OWNER">Owners</option>
          <option value="MANAGER">Managers</option>
          <option value="STAFF">Staff</option>
          <option value="VIEWER">Viewers</option>
        </select>
      </div>

      {/* Liste des users */}
      <div className="space-y-4">
        {filteredUsers?.map((user: any) => (
          <div
            key={user.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{user.name}</h3>
                  {user.isSuperAdmin && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                      👑 SUPER ADMIN
                    </span>
                  )}
                </div>
                <div className="text-slate-400 text-sm">{user.email}</div>
              </div>

              {/* Actions */}
              {!user.isSuperAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resetPasswordMutation.mutate(user.id)}
                    className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                    title="Reset password"
                  >
                    <Mail size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer ${user.name} ?\n\nCette action est irréversible.`)) {
                        deleteUserMutation.mutate(user.id);
                      }
                    }}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Accès aux bars avec rôles colorés */}
            {user.barAccess && user.barAccess.length > 0 && (
              <div>
                <div className="text-sm text-slate-400 mb-2">
                  Accès aux bars ({user.barAccess.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.barAccess.map((access: any) => {
                    const roleColors = {
                      OWNER: 'bg-red-500/20 text-red-400 border-red-500/30',
                      MANAGER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                      STAFF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      VIEWER: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
                    };
                    
                    return (
                      <div
                        key={access.id}
                        className={`px-3 py-2 rounded-lg border ${roleColors[access.role as keyof typeof roleColors]}`}
                      >
                        <div className="text-sm font-medium">
                          {access.bar.name}
                        </div>
                        <div className="text-xs">
                          {access.role}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-white">
                  {user._count.barAccess}
                </div>
                <div className="text-slate-400 text-xs">Bars</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xl font-bold text-white">
                  {user._count.createdDrinks}
                </div>
                <div className="text-slate-400 text-xs">Drinks créés</div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredUsers?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-slate-400">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modal créer owner */}
      {showCreateOwner && (
        <CreateOwnerModal
          onClose={() => setShowCreateOwner(false)}
          onCreate={(data) => createOwnerMutation.mutate(data)}
          isLoading={createOwnerMutation.isPending}
        />
      )}

      {/* Modal éditer user */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// =============== ONGLET COMMANDES (NOUVEAU) ===============

function OrdersTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VALIDATED' | 'CANCELLED'>('ALL');

  // Charger toutes les commandes
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      const { data } = await adminApi.getAllOrders(statusFilter === 'ALL' ? undefined : statusFilter);
      return data;
    },
  });

  // Mutation pour supprimer
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => adminApi.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('✅ Commande supprimée avec succès !');
    },
  });

  // Filtrer les commandes
  const filteredOrders = orders?.filter((order: any) => {
    return (
      order.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.bar?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Commandes</h2>
        <p className="text-slate-400">
          {filteredOrders?.length || 0} / {orders?.length || 0} commande(s)
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Rechercher par utilisateur ou bar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="VALIDATED">Validées</option>
          <option value="CANCELLED">Annulées</option>
        </select>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders?.map((order: any) => (
          <div
            key={order.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {order.user?.username || 'Utilisateur inconnu'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'VALIDATED'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {order.status === 'VALIDATED' && '✓ Validée'}
                    {order.status === 'PENDING' && '⏳ En attente'}
                    {order.status === 'CANCELLED' && '✗ Annulée'}
                  </span>
                </div>
                <div className="text-slate-400 text-sm">
                  Bar: {order.bar?.name || 'Bar inconnu'} • {new Date(order.createdAt).toLocaleString('fr-FR')}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  ID: {order.id}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  if (confirm(`Supprimer cette commande ?\n\nUtilisateur: ${order.user?.username}\nBar: ${order.bar?.name}\n\nCette action est irréversible.`)) {
                    deleteOrderMutation.mutate(order.id);
                  }
                }}
                disabled={deleteOrderMutation.isPending}
                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="text-slate-400 text-sm mb-2">
                  {order.items.length} shooter{order.items.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {filteredOrders?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-slate-400">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============== ONGLET UTILISATEURS MOBILE (NOUVEAU) ===============

function MobileUsersTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Charger tous les utilisateurs mobile
  const { data: mobileUsers, isLoading } = useQuery({
    queryKey: ['admin-mobile-users'],
    queryFn: async () => {
      const { data } = await adminApi.getAllMobileUsers();
      return data;
    },
  });

  // Mutation pour supprimer
  const deleteMobileUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteMobileUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mobile-users'] });
      alert('✅ Utilisateur mobile supprimé avec succès !');
    },
  });

  // Filtrer les utilisateurs
  const filteredUsers = mobileUsers?.filter((user: any) => {
    return (
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Utilisateurs Mobile</h2>
        <p className="text-slate-400">
          {filteredUsers?.length || 0} / {mobileUsers?.length || 0} utilisateur(s)
        </p>
      </div>

      {/* Recherche */}
      <div>
        <input
          type="text"
          placeholder="Rechercher par nom d'utilisateur ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {filteredUsers?.map((user: any) => (
          <div
            key={user.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {user.username}
                    </h3>
                    <Smartphone size={16} className="text-slate-400" />
                  </div>
                  <div className="text-slate-400 text-sm mb-3">
                    {user.email}
                  </div>
                  <div className="text-slate-500 text-xs">
                    Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    {user._count?.orders > 0 && (
                      <> • {user._count.orders} commande{user._count.orders > 1 ? 's' : ''}</>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  if (confirm(`Supprimer l'utilisateur "${user.username}" ?\n\nCette action supprimera :\n- Le compte utilisateur\n- Toutes ses commandes\n- Toutes ses photos\n- Tous ses amis\n\nCette action est irréversible.`)) {
                    deleteMobileUserMutation.mutate(user.id);
                  }
                }}
                disabled={deleteMobileUserMutation.isPending}
                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredUsers?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-slate-400">
              Essayez de modifier votre recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}