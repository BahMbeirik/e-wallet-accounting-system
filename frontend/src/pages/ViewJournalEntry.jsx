/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { useParams,useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';

const ViewJournalEntry = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currency, convertCurrency, ...context  } = useCurrency();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    axiosInstance.get(`/journal-entries/${id}/`)
      .then(response => {
        setEntry(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Écriture introuvable</h1>
          <p className="text-gray-600 mb-6">L'écriture que vous cherchez n'existe pas ou a été supprimée.</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Détails de l'écriture</h1>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{entry.description}</h2>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {formatDate(entry.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Cette écriture a été enregistrée le {formatDate(entry.date)}.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Debit Section */}
              <div className="bg-white rounded-lg shadow p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className=" bg-red-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Débit</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Compte</label>
                    <p className="text-gray-800 font-semibold">{entry.debit_account_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Montant</label>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(entry.debit_amount, currency, context)}</p>
                  </div>
                </div>
              </div>
              
              {/* Credit Section */}
              <div className="bg-white rounded-lg shadow p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6  text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Crédit</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Compte</label>
                    <p className="text-gray-800 font-semibold">{entry.credit_account_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Montant</label>
                    <p className="text-2xl font-bold  text-green-600">{formatCurrency(entry.credit_amount, currency, context)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional information can be added here */}
            
            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button 
                onClick={() => navigate(`/journal`)} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button 
              onClick={() => navigate(`/edit-journal/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJournalEntry;