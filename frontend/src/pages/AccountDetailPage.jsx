/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from './../api';
import { useParams ,useNavigate} from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import { formatDateTime } from '../utils/formatters';

const AccountDetailPage = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const navigate = useNavigate();
  const { currency, convertCurrency } = useCurrency();

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
        setLoading(false);
      });
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axiosInstance.patch(`/accounts/${id}/`, {
        status: newStatus
      });
      setAccount(response.data);
      setShowStatusDropdown(false);
      toast.success('Statut du compte mis à jour');
    } catch (error) {
      console.error('Error updating account status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto border-4 border-t-indigo-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Chargement des détails du compte...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 max-w-md w-full bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-800">Compte introuvable</h2>
            <p className="mt-2 text-gray-600">Nous n'avons pas pu trouver le compte que vous recherchez.</p>
            <button 
              onClick={() => navigate('/accounts')}
              className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get client type color
  const getClientTypeColor = (type) => {
    const types = {
      "CLIENT": "bg-blue-100 text-blue-800",
      "COMMERÇANT": "bg-purple-100 text-purple-800",
      "AGENCE": "bg-green-100 text-green-800"
    };
    return types[type] || "bg-gray-100 text-gray-800";
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-yellow-100 text-yellow-800',
      'CLOSED': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Available status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Détails du compte</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClientTypeColor(account.client_type)}`}>
                {account.client_type}
              </span>
            </div>
          </div>

          {/* Account Summary */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-2 items-center mb-6">
              <div>
                <p className="text-sm text-gray-500">Numéro de compte</p>
                <p className="text-lg font-mono font-medium">{account.account_number}</p>
                {account.bank_account && (
                  <p className="text-sm text-gray-500 mt-1">Compte bancaire: {account.bank_account}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Solde actuel</p>
                <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  {formatCurrency(account.balance, currency, convertCurrency)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Titulaire du compte</p>
                <p className="text-lg font-medium">{account.name}</p>
              </div>
              <div >
                <p className="text-sm text-gray-500">Compte Bancaire</p>
                <p className="text-md font-medium">{account.bank_account || 'Aucun compte bancaire associé'}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Informations sur le compte</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="text-md font-medium">{formatDateTime(account.created_date)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Date d'importation</p>
                <p className="text-md font-medium">{formatDateTime(account.import_date)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Hold Balance</p>
                <p className="text-md font-medium">{formatCurrency(account.hold_balance, currency, convertCurrency)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Hold E-commerce</p>
                <p className="text-md font-medium">{formatCurrency(account.hold_ecommerce, currency, convertCurrency)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg relative">
                <p className="text-sm text-gray-500">Statut</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                    {account.status}
                  </span>
                  <button 
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                
                {showStatusDropdown && (
                  <div className="absolute z-50 bottom-full mb-2 w-40 bg-white rounded-md shadow-lg">
                    <div className="py-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className={`block w-full text-left px-4 py-2 text-sm ${account.status === option.value ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={() => navigate('/accounts')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Retour à la liste
            </button>

            <div className="flex gap-3">
              <button 
                className="px-4 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-indigo-700 flex items-center"
                onClick={() => navigate(`/edit-account/${account.id}`)}
              >
                Modifier
              </button>
              <button 
                className="px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 text-emerald-700 flex items-center"
                onClick={() => navigate(`/grand-livre/${account.id}`)}
              >
                Grand Livre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailPage;