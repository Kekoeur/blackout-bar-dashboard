// apps/bar-dashboard/src/app/(dashboard)/catalog/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { drinksApi } from '@/lib/api';
import { useBarStore } from '@/store/barStore';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';

interface Drink {
  id: string;
  name: string;
  type: 'SHOOTER' | 'COCKTAIL';
  alcoholLevel?: number;
  imageUrl: string;
  ingredients?: string[];
  description?: string;
  createdAt: string;
}

export default function CatalogPage() {
  const queryClient = useQueryClient();
  const selectedBar = useBarStore((state) => state.selectedBar);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SHOOTER' | 'COCKTAIL'>('ALL');

  // ⭐ Charger tous les drinks avec barId
  const { data: drinks, isLoading } = useQuery<Drink[]>({
    queryKey: ['all-drinks', selectedBar?.id],
    queryFn: async () => {
      if (!selectedBar?.id) {
        throw new Error('Aucun bar sélectionné');
      }
      const { data } = await drinksApi.getAllDrinks(selectedBar.id);
      return data;
    },
    enabled: !!selectedBar?.id,
  });

  // Filtrer les drinks
  const filteredDrinks = drinks?.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || d.type === filterType;
    return matchesSearch && matchesType;
  });

  // Mutation pour créer un drink
  const createDrinkMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      type: 'SHOOTER' | 'COCKTAIL';
      alcoholLevel?: number;
      ingredients?: string[];
      description?: string;
      imageUrl: string;
    }) => {
      await drinksApi.createDrink({
        ...data,
        barId: selectedBar!.id, // ⭐ Ajouter barId
        isPublic: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-drinks', selectedBar?.id] });
      setShowCreateModal(false);
    },
  });

  const updateDrinkMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      type?: 'SHOOTER' | 'COCKTAIL';
      alcoholLevel?: number;
      ingredients?: string[];
      description?: string;
      imageUrl?: string;
    }) => {
      if (!selectedDrink) throw new Error('No drink selected');
      await drinksApi.updateDrink(selectedDrink.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-drinks', selectedBar?.id] });
      setShowEditModal(false);
      setSelectedDrink(null);
    },
  });

  // Mutation pour supprimer un drink
  const deleteDrinkMutation = useMutation({
    mutationFn: async (drinkId: string) => {
      await drinksApi.deleteDrink(drinkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-drinks', selectedBar?.id] });
    },
  });

  // ⭐ Si pas de bar sélectionné
  if (!selectedBar) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-orange-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">
            Aucun bar sélectionné
          </h2>
          <p className="text-slate-400">
            Sélectionnez un bar pour accéder au catalogue
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement du catalogue...</div>
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
              Catalogue des Drinks
            </h1>
            <p className="text-slate-400">
              {drinks?.length || 0} drink{drinks && drinks.length > 1 ? 's' : ''} disponible{drinks && drinks.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            Créer un drink
          </button>
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un drink..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Type */}
          <div className="flex gap-2">
            {(['ALL', 'SHOOTER', 'COCKTAIL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {type === 'ALL' ? 'Tous' : type === 'SHOOTER' ? 'Shooters' : 'Cocktails'}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des drinks */}
        {!filteredDrinks || filteredDrinks.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <div className="text-6xl mb-4">🍹</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'Aucun résultat' : 'Catalogue vide'}
            </h2>
            <p className="text-slate-400 mb-6">
              {searchQuery
                ? 'Aucun drink ne correspond à votre recherche'
                : 'Créez votre premier drink pour commencer'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                Créer mon premier drink
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDrinks.map((drink) => (
              <div
                key={drink.id}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 transition-all"
              >
                {/* Image */}
                <div className="relative aspect-video">
                  <img
                    src={drink.imageUrl}
                    alt={drink.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge type */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        drink.type === 'SHOOTER'
                          ? 'bg-orange-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}
                    >
                      {drink.type}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {drink.name}
                  </h3>
                  <div className="text-slate-400 text-sm mb-3">
                    {drink.alcoholLevel && `${drink.alcoholLevel}° • `}
                    {drink.ingredients && drink.ingredients.length > 0 
                      ? `${drink.ingredients.length} ingrédient${drink.ingredients.length > 1 ? 's' : ''}`
                      : 'Pas d\'ingrédients'
                    }
                  </div>

                  {/* Ingrédients */}
                  {drink.ingredients && drink.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {drink.ingredients.slice(0, 3).map((ingredient, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {drink.ingredients.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                          +{drink.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDrink(drink);
                        setShowEditModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer "${drink.name}" ?`)) {
                          deleteDrinkMutation.mutate(drink.id);
                        }
                      }}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <CreateDrinkModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(data) => createDrinkMutation.mutate(data)}
            isLoading={createDrinkMutation.isPending}
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
            onUpdate={(data) => updateDrinkMutation.mutate(data)} // ⭐ UTILISER LA MUTATION
            isLoading={updateDrinkMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

// Modal de création
function CreateDrinkModal({
  onClose,
  onCreate,
  isLoading,
}: {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: 'SHOOTER' | 'COCKTAIL';
    alcoholLevel?: number;
    ingredients?: string[];
    description?: string;
    imageUrl: string;
  }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'SHOOTER' | 'COCKTAIL'>('SHOOTER');
  const [alcoholLevel, setAlcoholLevel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !imageUrl) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onCreate({
      name,
      type,
      alcoholLevel: alcoholLevel ? parseFloat(alcoholLevel) : undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      description: description || undefined,
      imageUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Créer un drink</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tequila Sunrise Shot"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType('SHOOTER')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  type === 'SHOOTER'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                🥃 Shooter
              </button>
              <button
                type="button"
                onClick={() => setType('COCKTAIL')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  type === 'COCKTAIL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                🍹 Cocktail
              </button>
            </div>
          </div>

          {/* Degré d'alcool */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Degré d'alcool (°) <span className="text-slate-500">(optionnel)</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={alcoholLevel}
              onChange={(e) => setAlcoholLevel(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* URL de l'image */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL de l'image *
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-full h-40 object-cover rounded-lg"
                  onError={() => setImageUrl('')}
                />
              </div>
            )}
          </div>

          {/* Ingrédients */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ingrédients <span className="text-slate-500">(optionnel)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Ajouter un ingrédient..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-700 text-white rounded-full flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description du drink..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
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
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Création...' : 'Créer le drink'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de modification (à implémenter plus tard)
function EditDrinkModal({
  drink,
  onClose,
  onUpdate,
  isLoading,
}: {
  drink: Drink;
  onClose: () => void;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(drink.name);
  const [type, setType] = useState<'SHOOTER' | 'COCKTAIL'>(drink.type);
  const [alcoholLevel, setAlcoholLevel] = useState(drink.alcoholLevel?.toString() || '');
  const [imageUrl, setImageUrl] = useState(drink.imageUrl);
  const [description, setDescription] = useState(drink.description || '');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(drink.ingredients || []);

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !imageUrl) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onUpdate({
      name,
      type,
      alcoholLevel: alcoholLevel ? parseFloat(alcoholLevel) : undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      description: description || undefined,
      imageUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Modifier le drink</h2>
          <p className="text-slate-400 text-sm mt-1">{drink.name}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tequila Sunrise Shot"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType('SHOOTER')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  type === 'SHOOTER'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                🥃 Shooter
              </button>
              <button
                type="button"
                onClick={() => setType('COCKTAIL')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  type === 'COCKTAIL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                🍹 Cocktail
              </button>
            </div>
          </div>

          {/* Degré d'alcool */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Degré d'alcool (°) <span className="text-slate-500">(optionnel)</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={alcoholLevel}
              onChange={(e) => setAlcoholLevel(e.target.value)}
              placeholder="40"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* URL de l'image */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL de l'image *
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    console.log('Image load error');
                  }}
                />
              </div>
            )}
          </div>

          {/* Ingrédients */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ingrédients <span className="text-slate-500">(optionnel)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder="Ajouter un ingrédient..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-700 text-white rounded-full flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description <span className="text-slate-500">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description du drink..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
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
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Modification...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}