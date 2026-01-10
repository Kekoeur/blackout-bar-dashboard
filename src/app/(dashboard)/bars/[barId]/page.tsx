'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barsApi } from '@/lib/api';
import { useBarStore } from '@/store/barStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  QrCode,
  TrendingUp, 
  DollarSign, 
  Clock, 
  Camera, 
  Package,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Edit3,
  X,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Settings,
  BarChart3,
  Save,
} from 'lucide-react';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-700 rounded-lg flex items-center justify-center">
      <p className="text-slate-400">Chargement de la carte...</p>
    </div>
  ),
});

type TabType = 'dashboard' | 'settings';

export default function BarDetailPage() {
  const params = useParams();
  const barId = params.barId as string;
  const queryClient = useQueryClient();
  const { setSelectedBar } = useBarStore();

  // États pour les onglets
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // États pour le modal de saisie manuelle
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [showGeocodePreview, setShowGeocodePreview] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [geocodeResult, setGeocodeResult] = useState<any>(null);

  // États pour l'édition de l'adresse
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState('');
  const [editedCity, setEditedCity] = useState('');
  const [editedPostalCode, setEditedPostalCode] = useState('');

  // Récupérer les détails du bar depuis l'API
  const { data: barDetails, isLoading: isLoadingBar } = useQuery({
    queryKey: ['bar-details', barId],
    queryFn: async () => {
      const { data } = await barsApi.getBarDetails(barId);
      return data;
    },
    retry: 1,
  });

  useEffect(() => {
    if (barDetails) {
      setSelectedBar(barDetails);
      setEditedAddress(barDetails.address || '');
      setEditedCity(barDetails.city || '');
      setEditedPostalCode(barDetails.postalCode || '');
    }
  }, [barDetails, setSelectedBar]);

  const currentBar = barDetails;
  const isOwner = currentBar?.role === 'OWNER';

  const hasCoordinates = () => {
    if (!currentBar) return false;
    const lat = currentBar.latitude;
    const lon = currentBar.longitude;
    if (lat === null || lat === undefined || lon === null || lon === undefined) {
      return false;
    }
    const latNum = Number(lat);
    const lonNum = Number(lon);
    return !isNaN(latNum) && !isNaN(lonNum) && latNum !== 0 && lonNum !== 0;
  };

  // Charger les stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['bar-stats', barId],
    queryFn: async () => {
      const { data } = await barsApi.getBarStats(barId);
      return data;
    },
    enabled: activeTab === 'dashboard',
  });

  // Mutation pour activer le bar
  const activateMutation = useMutation({
    mutationFn: () => barsApi.activateBar(barId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bars'] });
      queryClient.invalidateQueries({ queryKey: ['bar-details', barId] });
    },
  });

  // Mutation pour désactiver le bar
  const deactivateMutation = useMutation({
    mutationFn: () => barsApi.deactivateBar(barId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bars'] });
      queryClient.invalidateQueries({ queryKey: ['bar-details', barId] });
    },
  });

  // Mutation pour géocodage automatique
  const geocodeMutation = useMutation({
    mutationFn: () => barsApi.geocodeBar(barId),
    onSuccess: (response) => {
      setGeocodeResult(response.data);
      setManualLat(String(response.data.geocode.latitude));
      setManualLon(String(response.data.geocode.longitude));
      setShowGeocodePreview(true);
    },
    onError: () => {
      alert('❌ Impossible de géocoder cette adresse automatiquement. Utilisez la saisie manuelle.');
    },
  });

  // Mutation pour saisie manuelle des coordonnées
  const manualGeocodeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await barsApi.updateCoordinates(barId, {
        latitude: parseFloat(manualLat),
        longitude: parseFloat(manualLon),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bars'] });
      queryClient.invalidateQueries({ queryKey: ['bar-details', barId] });
      setShowManualCoords(false);
      setShowGeocodePreview(false);
      setManualLat('');
      setManualLon('');
      setGeocodeResult(null);
      alert('✅ Coordonnées GPS enregistrées avec succès !');
    },
    onError: () => {
      alert('❌ Erreur lors de la mise à jour des coordonnées');
    },
  });

  // Mutation pour mettre à jour l'adresse
  const updateAddressMutation = useMutation({
    mutationFn: async () => {
      const { data } = await barsApi.updateBarAddress(barId, {
        address: editedAddress,
        city: editedCity,
        postalCode: editedPostalCode || undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bars'] });
      queryClient.invalidateQueries({ queryKey: ['bar-details', barId] });
      setIsEditingAddress(false);
      alert('✅ Adresse mise à jour avec succès !');
    },
    onError: () => {
      alert('❌ Erreur lors de la mise à jour de l\'adresse');
    },
  });

  const handleMapLocationChange = (lat: number, lon: number) => {
    setManualLat(String(lat));
    setManualLon(String(lon));
  };

  if (isLoadingBar) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!currentBar) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Bar introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-white">
                {currentBar.name}
              </h1>
              
              {/* Badge statut */}
              <span
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  currentBar.active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {currentBar.active ? (
                  <>
                    <CheckCircle size={20} />
                    Actif
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} />
                    Inactif
                  </>
                )}
              </span>
            </div>

            <div className="flex gap-3">
              {/* Boutons Activer/Désactiver */}
              {isOwner && (
                <>
                  {!currentBar.active ? (
                    <button
                      onClick={() => activateMutation.mutate()}
                      disabled={activateMutation.isPending}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    >
                      <Power size={20} />
                      {activateMutation.isPending ? 'Activation...' : 'Activer'}
                    </button>
                  ) : (
                    <button
                      onClick={() => deactivateMutation.mutate()}
                      disabled={deactivateMutation.isPending}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    >
                      <PowerOff size={20} />
                      {deactivateMutation.isPending ? 'Désactivation...' : 'Désactiver'}
                    </button>
                  )}
                </>
              )}

              <Link
                href={`/bars/${barId}/qrcode`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <QrCode size={20} />
                QR Code
              </Link>
            </div>
          </div>

          {/* Message d'avertissement si inactif */}
          {!currentBar.active && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-orange-400 font-semibold mb-1">
                    Bar inactif
                  </h3>
                  <p className="text-orange-200 text-sm">
                    {isOwner ? (
                      <>
                        Votre bar est actuellement inactif. Les clients ne peuvent pas commander.
                      </>
                    ) : (
                      <>
                        Ce bar est actuellement inactif. Seul le propriétaire peut l'activer.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Onglets */}
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 size={20} />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings size={20} />
              Paramètres
            </button>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoadingStats ? (
                <div className="col-span-4 text-center py-12 text-slate-400">
                  Chargement des statistiques...
                </div>
              ) : (
                <>
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
                    <div className="text-green-100 text-sm">Revenu total</div>
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
                    <div className="text-yellow-100 text-sm">En attente</div>
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
                </>
              )}
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

                      {drink.drinkImage && (
                        <img 
                          src={drink.drinkImage} 
                          alt={drink.drinkName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}

                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {drink.drinkName}
                        </div>
                        <div className="text-slate-400 text-sm">
                          ID: {drink.drinkId.substring(0, 8)}...
                        </div>
                      </div>

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
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Section Adresse */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Adresse du bar
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Informations de localisation
                  </p>
                </div>
                {isOwner && !isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Edit3 size={16} />
                    Modifier
                  </button>
                )}
              </div>

              {isEditingAddress && isOwner ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      placeholder="15 Rue des 2 Haies"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={editedCity}
                        onChange={(e) => setEditedCity(e.target.value)}
                        placeholder="Angers"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Code postal
                      </label>
                      <input
                        type="text"
                        value={editedPostalCode}
                        onChange={(e) => setEditedPostalCode(e.target.value)}
                        placeholder="49000"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsEditingAddress(false);
                        setEditedAddress(currentBar.address || '');
                        setEditedCity(currentBar.city || '');
                        setEditedPostalCode(currentBar.postalCode || '');
                      }}
                      className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => updateAddressMutation.mutate()}
                      disabled={!editedAddress || !editedCity || updateAddressMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    >
                      <Save size={18} />
                      {updateAddressMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg">
                    <MapPin className="text-slate-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-white font-medium">{currentBar.address}</p>
                      <p className="text-slate-400 text-sm">
                        {currentBar.postalCode ? `${currentBar.postalCode} ` : ''}{currentBar.city}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Coordonnées GPS */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Coordonnées GPS
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Position exacte pour l'application mobile
                  </p>
                </div>
              </div>

              {hasCoordinates() ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Latitude
                      </div>
                      <div className="text-white font-mono text-lg font-semibold">
                        {Number(currentBar.latitude).toFixed(6)}°
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Longitude
                      </div>
                      <div className="text-white font-mono text-lg font-semibold">
                        {Number(currentBar.longitude).toFixed(6)}°
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${currentBar.latitude},${currentBar.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink size={16} />
                      Voir sur Google Maps
                    </a>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setManualLat(String(currentBar.latitude));
                          setManualLon(String(currentBar.longitude));
                          setShowManualCoords(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Edit3 size={16} />
                        Ajuster la position
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center">
                    <MapPin className="text-slate-500 mx-auto mb-2" size={32} />
                    <p className="text-slate-400 text-sm mb-4">
                      Aucune coordonnée GPS enregistrée
                    </p>
                    
                    {isOwner && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => geocodeMutation.mutate()}
                          disabled={geocodeMutation.isPending}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                        >
                          <Navigation size={18} />
                          {geocodeMutation.isPending ? 'Recherche...' : 'Géocoder automatiquement'}
                        </button>

                        <button
                          onClick={() => setShowManualCoords(true)}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                        >
                          <Edit3 size={18} />
                          Placer sur la carte
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-xs">
                      💡 <strong>Astuce :</strong> Le géocodage automatique utilise l'adresse du bar pour trouver les coordonnées GPS.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals... (identiques à avant) */}
      {showGeocodePreview && geocodeResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CheckCircle2 className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Résultat du géocodage
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Vérifiez et ajustez la position
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGeocodePreview(false);
                  setGeocodeResult(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-green-400 font-medium mb-1">
                      Adresse trouvée
                    </p>
                    <p className="text-green-300 text-sm">
                      {geocodeResult.geocode.displayName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                    Latitude
                  </div>
                  <div className="text-white font-mono text-lg font-semibold">
                    {parseFloat(manualLat).toFixed(6)}°
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                    Longitude
                  </div>
                  <div className="text-white font-mono text-lg font-semibold">
                    {parseFloat(manualLon).toFixed(6)}°
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Position sur la carte
                </label>
                <MapPicker
                  initialLat={parseFloat(manualLat)}
                  initialLon={parseFloat(manualLon)}
                  onLocationChange={handleMapLocationChange}
                  address={currentBar?.address + ', ' + currentBar?.city}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowGeocodePreview(false);
                  setGeocodeResult(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => manualGeocodeMutation.mutate()}
                disabled={manualGeocodeMutation.isPending}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg"
              >
                {manualGeocodeMutation.isPending ? 'Enregistrement...' : '✓ Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualCoords && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="text-purple-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Coordonnées GPS
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Placez le marqueur sur la carte
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualCoords(false)}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="47.472400"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="-0.551300"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <MapPicker
                initialLat={manualLat ? parseFloat(manualLat) : 47.4724}
                initialLon={manualLon ? parseFloat(manualLon) : -0.5513}
                onLocationChange={handleMapLocationChange}
                address={currentBar?.address + ', ' + currentBar?.city}
              />
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setShowManualCoords(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => manualGeocodeMutation.mutate()}
                disabled={!manualLat || !manualLon || manualGeocodeMutation.isPending}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg"
              >
                {manualGeocodeMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}