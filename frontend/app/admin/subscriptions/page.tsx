'use client';

import { useState, useEffect } from 'react';
import { adminPlansAPI, type Plan, type PlanStats } from '@/lib/api/admin-plans';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  Users, 
  DollarSign, 
  Package,
  TrendingUp,
  Check,
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    maxBetsPerMonth: 0,
    maxStorageMb: 0,
    features: [] as string[],
    displayOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [plansData, statsData] = await Promise.all([
        adminPlansAPI.getAllPlans(),
        adminPlansAPI.getPlanStats(),
      ]);
      setPlans(plansData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await adminPlansAPI.createPlan({
        ...formData,
        features: formData.features,
      });
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Erreur lors de la création du plan');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan) return;
    try {
      await adminPlansAPI.updatePlan(selectedPlan.id, {
        ...formData,
        features: formData.features,
      });
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('Erreur lors de la mise à jour du plan');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminPlansAPI.togglePlanStatus(id);
      loadData();
    } catch (error) {
      console.error('Failed to toggle plan status:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;
    try {
      await adminPlansAPI.deletePlan(id);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete plan:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression du plan');
    }
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      maxBetsPerMonth: plan.maxBetsPerMonth || 0,
      maxStorageMb: plan.maxStorageMb || 0,
      features: Array.isArray(plan.features) ? plan.features : [],
      displayOrder: plan.displayOrder,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      priceMonthly: 0,
      priceYearly: 0,
      maxBetsPerMonth: 0,
      maxStorageMb: 0,
      features: [],
      displayOrder: 0,
    });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Abonnements</h1>
        <p className="text-gray-600">Gérez les plans d'abonnement et leurs tarifs</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plans Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePlans}</p>
              </div>
              <Power className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abonnés</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSubscriptions}</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenu Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Plans d'Abonnement</h2>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
              plan.active ? 'border-green-500' : 'border-gray-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">#{plan.slug}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {plan.active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prix Mensuel</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(plan.priceMonthly)}/mois
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prix Annuel</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(plan.priceYearly)}/an
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paris/mois</span>
                    <span className="font-semibold">
                      {plan.maxBetsPerMonth ? plan.maxBetsPerMonth : 'Illimité'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stockage</span>
                    <span className="font-semibold">
                      {plan.maxStorageMb ? `${plan.maxStorageMb} MB` : 'Illimité'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Abonnés</span>
                    <span className="font-semibold flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {plan.subscribersCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Fonctionnalités:</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(plan.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    plan.active
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.active ? (
                    <>
                      <PowerOff className="h-4 w-4" />
                      <span>Désactiver</span>
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4" />
                      <span>Activer</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {showCreateModal ? 'Créer un Plan' : 'Modifier le Plan'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du Plan
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Premium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="premium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Description du plan..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix Mensuel (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix Annuel (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceYearly}
                      onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paris Max/Mois (0 = illimité)
                    </label>
                    <input
                      type="number"
                      value={formData.maxBetsPerMonth}
                      onChange={(e) => setFormData({ ...formData, maxBetsPerMonth: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stockage MB (0 = illimité)
                    </label>
                    <input
                      type="number"
                      value={formData.maxStorageMb}
                      onChange={(e) => setFormData({ ...formData, maxStorageMb: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'Affichage
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fonctionnalités
                    </label>
                    <button
                      onClick={addFeature}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Fonctionnalité..."
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedPlan(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={showCreateModal ? handleCreate : handleUpdate}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {showCreateModal ? 'Créer' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
