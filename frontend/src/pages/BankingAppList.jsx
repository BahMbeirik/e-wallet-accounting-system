/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { Copy, Eye, EyeOff, Plus, Key, Shield } from 'lucide-react';

const BankingAppList = () => {
  const [apps, setApps] = useState([]);
  const [newAppName, setNewAppName] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [copiedItems, setCopiedItems] = useState({});
  const [revealedSecrets, setRevealedSecrets] = useState({});

  
  useEffect(() => {
    fetchApps();
  }, []);


  useEffect(() => {
    const cleaned = {};
    apps.forEach(app => {
      if (revealedSecrets[app.id]) {
        cleaned[app.id] = false; // إخفاء المفتاح إذا سبق عرضه
      } else {
        cleaned[app.id] = false; // مبدئيًا مخفي
      }
    });
    setVisibleSecrets(cleaned);
  }, [apps]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      setVisibleSecrets({});
      setRevealedSecrets({});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);



  const fetchApps = async () => {
    const res = await axiosInstance.get('/banking-apps/');
    setApps(res.data);
  };

  const createApp = async () => {
    const res = await axiosInstance.post('/banking-apps/', { name: newAppName });
    setApps([...apps, res.data]);
    setNewAppName('');
  };

  const copyToClipboard = (text, type, appId) => {
    navigator.clipboard.writeText(text).then(() => {
      const key = `${appId}-${type}`;
      setCopiedItems(prev => ({ ...prev, [key]: true }));
      
      // Masquer la clé après 5 secondes
      if (type === 'secret') {
        setTimeout(() => {
          setVisibleSecrets(prev => ({
            ...prev,
            [appId]: false
          }));
          setRevealedSecrets(prev => ({
            ...prev,
            [appId]: true  // لن يظهر مجددًا
          }));
        }, 5000);
      }


      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  const toggleSecretVisibility = (appId) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [appId]: !prev[appId],
    }));

    // إذا تم الكشف لأول مرة، سجل أنه تم الكشف عنه
    setRevealedSecrets(prev => ({
      ...prev,
      [appId]: true,
    }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
      <div className="max-w-7xl mx-auto space-y-6 p-1 md:p-2">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="md:flex md:items-center mb-6">
            <div className="hidden md:block bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applications Bancaires</h1>
              <p className="text-gray-600 mt-1">Gérez vos clés API et secrets d'application</p>
            </div>
          </div>

          {/* Formulaire de création */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Créer une nouvelle application
            </h3>
            <div className="md:flex gap-4 ">
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="Nom de l'application"
                className="mb-2 md:mb-0 flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                onKeyPress={(e) => e.key === 'Enter' && createApp()}
              />
              <button
                onClick={createApp}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Créer l'application
              </button>
            </div>
          </div>
        </div>

        {/* Liste des applications */}
        <div className="space-y-6">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl mr-4">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{app.name}</h3>
                  </div>
                </div>
                <div className={`text-xs ${app.is_active ? 'text-green-500 bg-green-100' : 'text-gray-500 bg-gray-100'} px-3 py-1 rounded-full`}>
                  {app.is_active ? 'Actif' : 'Inactif'}
                </div>
              </div>

              <div className="space-y-4">
                {/* Clé API */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-blue-800 flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      Clé API
                    </label>
                    <button
                      onClick={() => copyToClipboard(app.api_key, 'api', app.id)}
                      className="flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedItems[`${app.id}-api`] ? 'Copié!' : 'Copier'}
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <code className="text-sm font-mono text-gray-800 break-all">{app.api_key}</code>
                  </div>
                </div>

                {/* Clé secrète */}
                {visibleSecrets[app.id] && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-red-800 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Clé Secrète
                      <span className="ml-2 text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full">
                        Affichée une seule fois
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSecretVisibility(app.id)}
                        className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105"
                      >
                        {visibleSecrets[app.id] ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Masquer
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Afficher
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(app.secret_key, 'secret', app.id)}
                        className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copiedItems[`${app.id}-secret`] ? 'Copié!' : 'Copier'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <code className="text-sm font-mono text-gray-800 break-all">
                      {visibleSecrets[app.id] && !revealedSecrets[app.id] ? app.secret_key : '•'.repeat(app.secret_key.length)}
                    </code>
                  </div>
                </div>
                )}
              </div>

              {/* Avertissement de sécurité */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <strong>Important:</strong> Gardez vos clés secrètes en sécurité. Ne les partagez jamais publiquement et stockez-les dans un endroit sûr.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {apps.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Key className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune application créée</h3>
            <p className="text-gray-600">Commencez par créer votre première application bancaire.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankingAppList;