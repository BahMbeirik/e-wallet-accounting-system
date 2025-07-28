import React, { useEffect, useState } from 'react';
import axiosInstance from '../api';

const GrandLivreAll = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/grand-livre/all/`)
      .then(res => {
        setLedgers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors de la récupération du Grand Livre:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        setLoading(false);
      });
  }, []);

  // Fonction pour basculer l'état d'expansion d'une section
  const toggleSection = (index) => {
    setExpandedSections({
      ...expandedSections,
      [index]: !expandedSections[index]
    });
  };

  // Formater les montants (ajouter l'espace comme séparateur de milliers)
  const formatAmount = (amount) => {
    if (!amount || amount === '-') return '-';
    return parseFloat(amount).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 lg:mb-8 text-center">
        Grand Livre – Tous les Comptes
      </h1>
      
      {ledgers.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-blue-700">Aucune donnée disponible dans le grand livre.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ledgers.map((accountLedger, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* En-tête du compte avec bouton pour déplier/replier */}
              <button 
                onClick={() => toggleSection(index)}
                className="w-full flex justify-between items-center p-4 bg-white hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800">{accountLedger.account_name}</h3>
                    <p className="text-sm text-gray-600">Devise: MRU</p>
                  </div>
                </div>
                <span className="text-indigo-600">
                  {expandedSections[index] === false ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </span>
              </button>
              
              {/* Contenu du tableau - visible si la section n'est pas explicitement repliée */}
              {expandedSections[index] !== false && (
                <>
                  {/* Version desktop du tableau - cachée sur les petits écrans */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Libellé</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Débit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Crédit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Solde</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accountLedger.ledger.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">Aucune opération pour ce compte</td>
                          </tr>
                        ) : (
                          accountLedger.ledger.map((entry, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{entry.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{entry.description}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600">{entry.debit ? formatAmount(entry.debit) : '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600">{entry.credit ? formatAmount(entry.credit) : '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-800">{formatAmount(entry.balance)}</td>
                            </tr>
                          ))
                        )}
                        {accountLedger.ledger.length > 0 && (
                          <tr className="bg-indigo-50 font-medium">
                            <td colSpan="4" className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-gray-800">
                              Solde final
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-gray-800">
                              {formatAmount(accountLedger.ledger[accountLedger.ledger.length - 1].balance)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Vue mobile (version Card) - visible uniquement sur les petits écrans */}
                  <div className="sm:hidden">
                    {accountLedger.ledger.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Aucune opération pour ce compte
                      </div>
                    ) : (
                      accountLedger.ledger.map((entry, i) => (
                        <div key={i} className={`p-4 border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-600">{entry.date}</span>
                            <span className="text-sm font-semibold text-right">{formatAmount(entry.balance)}</span>
                          </div>
                          <div className="text-sm mb-2 text-gray-800">{entry.description}</div>
                          <div className="flex justify-between">
                            {entry.debit && <span className="text-sm text-red-600 font-medium">- {formatAmount(entry.debit)}</span>}
                            {entry.credit && <span className="text-sm text-green-600 font-medium">+ {formatAmount(entry.credit)}</span>}
                          </div>
                        </div>
                      ))
                    )}
                    {accountLedger.ledger.length > 0 && (
                      <div className="p-4 bg-indigo-50 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Solde final</span>
                          <span className="font-bold text-gray-800">
                            {formatAmount(accountLedger.ledger[accountLedger.ledger.length - 1].balance)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrandLivreAll;