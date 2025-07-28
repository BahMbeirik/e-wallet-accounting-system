/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from './../api';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState({
    account_number: '',
    bank_account: '',
    name: '',
    balance: '',
    hold_balance: '',
    hold_ecommerce: '',
    client_type: 'CLIENT',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
    axiosInstance.get(`/accounts/${id}/`)
      .then(response => {
        setAccount(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setError("Échec du chargement des détails du compte");
        setLoading(false);
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...account,
      balance: parseFloat(account.balance),
      hold_balance: parseFloat(account.hold_balance || 0),
      hold_ecommerce: parseFloat(account.hold_ecommerce || 0)
    };

    axiosInstance.put(`/accounts/${id}/`, payload)
      .then(response => {
        toast.success('Compte mis à jour avec succès');
        navigate(`/account/${id}`);
      })
      .catch(error => {
        console.error(error);
        const errorMsg = error.response?.data?.non_field_errors?.[0] || 
                        Object.values(error.response?.data || {}).flat().join(', ') ||
                        "Échec de la mise à jour du compte";
        setError(errorMsg);
        toast.error(errorMsg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-t-indigo-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-medium">Chargement des données du compte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Modifier le compte</h1>
            <p className="text-blue-100 mt-1">
              Compte #{account.account_number}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p className="font-medium">Erreur</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de compte Wallet *
                </label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  required
                  value={account.account_number || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de compte bancaire
                </label>
                <input
                  type="text"
                  id="bank_account"
                  name="bank_account"
                  value={account.bank_account || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du titulaire *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={account.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="client_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de client *
                </label>
                <select
                  id="client_type"
                  name="client_type"
                  required
                  value={account.client_type || 'CLIENT'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="CLIENT">Client</option>
                  <option value="COMMERÇANT">Commerçant</option>
                  <option value="AGENCE">Agence</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={account.status || 'ACTIVE'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="CLOSED">Fermé</option>
                </select>
              </div>

              <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                  Solde (MRU) *
                </label>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  required
                  step="0.01"
                  value={account.balance || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="hold_balance" className="block text-sm font-medium text-gray-700 mb-1">
                  Hold Balance (MRU)
                </label>
                <input
                  type="number"
                  id="hold_balance"
                  name="hold_balance"
                  step="0.01"
                  value={account.hold_balance || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="hold_ecommerce" className="block text-sm font-medium text-gray-700 mb-1">
                  Hold E-commerce (MRU)
                </label>
                <input
                  type="number"
                  id="hold_ecommerce"
                  name="hold_ecommerce"
                  step="0.01"
                  value={account.hold_ecommerce || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/account/${id}`)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                  isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional info card */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Informations importantes</h2>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>• Les champs marqués d'un * sont obligatoires</li>
            <li>• La modification des détails du compte peut affecter les transactions</li>
            <li>• Vérifiez attentivement les montants avant de sauvegarder</li>
            <li>• Les holds représentent des montants bloqués temporairement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditAccountPage;