// apps/bar-dashboard/src/app/(dashboard)/bars/[barId]/menu/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Power, PowerOff, Search } from 'lucide-react';
import { useState } from 'react';

interface MenuDrink {
  id: string;
  barId: string;
  drinkId: string;
  price: number;
  available: boolean;
  drink: {
    id: string;
    name: string;
    type: string;
    alcoholLevel?: number;
    imageUrl: string;
    ingredients?: string[];
    description?: string;
  };
}

interface Drink {
  id: string;
  name: string;
  type: string;
  alcoholLevel?: number;
  imageUrl: string;
  ingredients?: string[];
  description?: string;
}

export default function MenuPage() {
  const params = useParams();
  const barId = params.barId as string;
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<MenuDrink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer le menu actuel
  const { data: menu, isLoading } = useQuery<MenuDrink[]>({
    queryKey: ['bar-menu', barId],
    queryFn: async () => {
      const { data } = await api.get(`/drinks/menu/${barId}`);
      return data;
    },
  });

  // Récupérer tous les drinks disponibles
  const { data: allDrinks } = useQuery<Drink[]>({
    queryKey: ['all-drinks'],
    queryFn: async () => {
      const { data } = await api.get('/drinks/catalog/all');
      return data;
    },
    enabled: showAddModal,
  });

  // Mutation pour ajouter un drink
  const addDrinksMutation = useMutation({
    mutationFn: async (drinks: Array<{ drinkId: string; price: number }>) => {
      const { menuApi } = await import('@/lib/api');
      await menuApi.addDrinksToMenuBulk(barId, drinks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-menu', barId] });
      setShowAddModal(false);
    },
  });

  // Mutation pour mettre à jour
  const updateDrinkMutation = useMutation({
    mutationFn: async ({
      drinkId,
      price,
      available,
    }: {
      drinkId: string;
      price?: number;
      available?: boolean;
    }) => {
      await api.put(`/drinks/menu/${barId}/${drinkId}`, { price, available });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-menu', barId] });
      setShowEditModal(false);
      setSelectedDrink(null);
    },
  });

  // Mutation pour supprimer
  const removeDrinkMutation = useMutation({
    mutationFn: async (drinkId: string) => {
      await api.delete(`/drinks/menu/${barId}/${drinkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-menu', barId] });
    },
  });

  // Toggle disponibilité
  const toggleAvailability = (item: MenuDrink) => {
    updateDrinkMutation.mutate({
      drinkId: item.drinkId,
      available: !item.available,
    });
  };

  // Filtrer le menu
  const filteredMenu = menu?.filter((item) =>
    item.drink.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrer les drinks déjà ajoutés
  const availableDrinks = allDrinks?.filter(
    (drink) => !menu?.some((m) => m.drinkId === drink.id)
  );

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
            <h1 className="text-3xl font-bold text-white mb-2">Menu</h1>
            <p className="text-slate-400">
              {menu?.length || 0} shooter{menu && menu.length > 1 ? 's' : ''} au menu
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            Ajouter un shooter
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un shooter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Liste du menu */}
        {!filteredMenu || filteredMenu.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <div className="text-6xl mb-4">🍹</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'Aucun résultat' : 'Menu vide'}
            </h2>
            <p className="text-slate-400 mb-6">
              {searchQuery
                ? 'Aucun shooter ne correspond à votre recherche'
                : 'Ajoutez des shooters à votre menu pour commencer'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                Ajouter mon premier shooter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-800 rounded-xl overflow-hidden border transition-all ${
                  item.available
                    ? 'border-slate-700 hover:border-orange-500'
                    : 'border-slate-700 opacity-60'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-video">
                  <img
                    src={item.drink.imageUrl}
                    alt={item.drink.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">INDISPONIBLE</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.drink.name}
                  </h3>
                  <div className="text-slate-400 text-sm mb-3">
                    {item.drink.type} • {item.drink.alcoholLevel}°
                  </div>

                  {/* Prix */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-orange-500">
                      {item.price.toFixed(2)}€
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                        item.available
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                      title={item.available ? 'Marquer indisponible' : 'Marquer disponible'}
                    >
                      {item.available ? <Power size={16} /> : <PowerOff size={16} />}
                      {item.available ? 'Dispo' : 'Indispo'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDrink(item);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Retirer ce shooter du menu ?')) {
                          removeDrinkMutation.mutate(item.drinkId);
                        }
                      }}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal d'ajout */}
        {showAddModal && (
          <AddDrinkModal
            drinks={availableDrinks || []}
            onClose={() => setShowAddModal(false)}
            onAdd={(drinks) => addDrinksMutation.mutate(drinks)}
            isLoading={addDrinksMutation.isPending}
          />
        )}

        {/* Modal de modification */}
        {showEditModal && selectedDrink && (
          <EditDrinkModal
            drink={selectedDrink}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDrink(null);
            }}
            onUpdate={(price) =>
              updateDrinkMutation.mutate({ drinkId: selectedDrink.drinkId, price })
            }
            isLoading={updateDrinkMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

// Composant Modal d'ajout
function AddDrinkModal({
  drinks,
  onClose,
  onAdd,
  isLoading,
}: {
  drinks: Drink[];
  onClose: () => void;
  onAdd: (drinks: Array<{ drinkId: string; price: number }>) => void;
  isLoading: boolean;
}) {
  const [selectedDrinks, setSelectedDrinks] = useState<Set<string>>(new Set());
  const [globalPrice, setGlobalPrice] = useState('5.50');
  const [customPrices, setCustomPrices] = useState<Map<string, string>>(new Map());
  const [useSamePrice, setUseSamePrice] = useState(true);
  const [search, setSearch] = useState('');

  const filteredDrinks = drinks.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle sélection d'un drink
  const toggleDrink = (drinkId: string) => {
    const newSelected = new Set(selectedDrinks);
    if (newSelected.has(drinkId)) {
      newSelected.delete(drinkId);
      // Supprimer le prix custom
      const newCustomPrices = new Map(customPrices);
      newCustomPrices.delete(drinkId);
      setCustomPrices(newCustomPrices);
    } else {
      newSelected.add(drinkId);
    }
    setSelectedDrinks(newSelected);
  };

  // Tout sélectionner / désélectionner
  const toggleAll = () => {
    if (selectedDrinks.size === filteredDrinks.length) {
      setSelectedDrinks(new Set());
      setCustomPrices(new Map());
    } else {
      setSelectedDrinks(new Set(filteredDrinks.map(d => d.id)));
    }
  };

  // Mettre à jour un prix custom
  const updateCustomPrice = (drinkId: string, price: string) => {
    const newCustomPrices = new Map(customPrices);
    newCustomPrices.set(drinkId, price);
    setCustomPrices(newCustomPrices);
  };

  const handleSubmit = () => {
    if (selectedDrinks.size === 0) return;

    const drinksToAdd = Array.from(selectedDrinks).map(drinkId => ({
      drinkId,
      price: useSamePrice 
        ? parseFloat(globalPrice) 
        : parseFloat(customPrices.get(drinkId) || globalPrice),
    }));

    onAdd(drinksToAdd);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Ajouter des shooters</h2>
              <p className="text-slate-400 text-sm mt-1">
                {selectedDrinks.size} shooter{selectedDrinks.size > 1 ? 's' : ''} sélectionné{selectedDrinks.size > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={toggleAll}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              {selectedDrinks.size === filteredDrinks.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Prix global ou individuel */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setUseSamePrice(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  useSamePrice
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                Prix identique
              </button>
              <button
                onClick={() => setUseSamePrice(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !useSamePrice
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                Prix différents
              </button>
            </div>

            {useSamePrice && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prix pour tous (€)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={globalPrice}
                  onChange={(e) => setGlobalPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {!useSamePrice && (
              <p className="text-slate-400 text-sm">
                Définissez un prix pour chaque shooter sélectionné ci-dessous
              </p>
            )}
          </div>

          {/* Liste des drinks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrinks.map((drink) => {
              const isSelected = selectedDrinks.has(drink.id);
              
              return (
                <div
                  key={drink.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => toggleDrink(drink.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-orange-600 border-orange-600'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Image */}
                    <img
                      src={drink.imageUrl}
                      alt={drink.name}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                      onClick={() => toggleDrink(drink.id)}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-white font-semibold mb-1 cursor-pointer truncate"
                        onClick={() => toggleDrink(drink.id)}
                      >
                        {drink.name}
                      </div>
                      <div className="text-slate-400 text-sm mb-2">
                        {drink.type} • {drink.alcoholLevel}°
                      </div>

                      {/* Prix individuel si mode prix différents */}
                      {!useSamePrice && isSelected && (
                        <input
                          type="number"
                          step="0.10"
                          value={customPrices.get(drink.id) || globalPrice}
                          onChange={(e) => updateCustomPrice(drink.id, e.target.value)}
                          placeholder="Prix (€)"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredDrinks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">Aucun shooter trouvé</div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-orange-400 hover:text-orange-300 text-sm"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedDrinks.size === 0 || isLoading}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? (
                'Ajout en cours...'
              ) : (
                `Ajouter ${selectedDrinks.size} shooter${selectedDrinks.size > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Modal de modification
function EditDrinkModal({
  drink,
  onClose,
  onUpdate,
  isLoading,
}: {
  drink: MenuDrink;
  onClose: () => void;
  onUpdate: (price: number) => void;
  isLoading: boolean;
}) {
  const [price, setPrice] = useState(drink.price.toString());

  const handleSubmit = () => {
    if (!price) return;
    onUpdate(parseFloat(price));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Modifier le prix</h2>
          <p className="text-slate-400 mt-1">{drink.drink.name}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prix (€)
          </label>
          <input
            type="number"
            step="0.10"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!price || isLoading}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}