import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Key, 
  Send, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  ChevronRight,
  Code,
  Database,
  Lock,
  Globe,
  User,
  CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import {  NavLink} from "react-router-dom";


export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: BookOpen },
    { id: 'registration', title: 'Enregistrement', icon: Plus },
    { id: 'keys', title: 'Clés d\'API', icon: Key },
    { id: 'sending', title: 'Envoi de données', icon: Send },
    { id: 'tips', title: 'Conseils & Erreurs', icon: AlertTriangle }
  ];

  const CodeBlock = ({ code, language, id }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Code className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">{language}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-all duration-200"
        >
          <Copy className="h-3 w-3 mr-1" />
          {copiedCode === id ? 'Copié!' : 'Copier'}
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-xl p-8  mb-8 border border-gray-200">
          <div className="flex items-center ">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl mr-6">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Documentation d'Intégration
              </h1>
              <p className="text-xl text-gray-600">
                Guide complet pour connecter vos applications externes à notre plateforme bancaire
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Navigation latérale */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Sommaire
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <section.icon className="h-4 w-4 mr-3" />
                    {section.title}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              
              {/* Section 1: Introduction */}
              {activeSection === 'introduction' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-800 p-3 rounded-xl mr-4">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">1. Introduction</h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Cette documentation explique comment intégrer votre application externe avec notre plateforme bancaire. 
                      Vous pourrez échanger des données telles que les comptes client et les transactions de manière sécurisée et efficace.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-green-800">Avantages</h3>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Intégration simple et rapide</li>
                        <li>• Sécurité renforcée avec clés d'API</li>
                        <li>• Support complet des transactions</li>
                        <li>• Documentation complète</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <Database className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-800">Types de données</h3>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Comptes clients</li>
                        <li>• Transactions financières</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Enregistrement */}
              {activeSection === 'registration' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-800 p-3 rounded-xl mr-4">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">2. Enregistrement et Création d'Application</h2>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Endpoint d'enregistrement
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-gray-600 mb-2">Création d'Application:</p>
                      <NavLink to="/banking-apps" className="text-purple-600">
                      <code className="text-purple-700 font-mono bg-purple-100 px-2 py-1 rounded  hover:bg-purple-200">
                        Créer une application
                      </code>
                      </NavLink>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Méthode et données
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Méthode HTTP:</p>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          POST
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Corps de la requête:</p>
                        <CodeBlock
                          code={`{
                            "name": "Mon Application Bancaire"
                          }`}
                          language="JSON"
                          id="registration-json"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Clés */}
              {activeSection === 'keys' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl mr-4">
                      <Key className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">3. Obtention des Clés d'API</h2>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-2">Génération automatique des clés</h3>
                        <p className="text-yellow-700">
                          Après la création de votre application, le système générera automatiquement vos clés d'authentification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <Key className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-800">Clé API</h3>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <code className="text-sm font-mono text-blue-700">api_key</code>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        Utilisée pour l'identification de votre application
                      </p>
                    </div>

                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center mb-3">
                        <Lock className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-semibold text-red-800">Clé Secrète</h3>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-200">
                        <code className="text-sm font-mono text-red-700">secret_key</code>
                      </div>
                      <p className="text-sm text-red-700 mt-2">
                        Gardez cette clé confidentielle et sécurisée
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Envoi de données */}
              {activeSection === 'sending' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-xl mr-4">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">4. Envoi de Données</h2>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Endpoint principal
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <code className="text-green-700 font-mono">
                        POST /external/nom_application/
                      </code>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      En-têtes d'authentification
                    </h3>
                    <CodeBlock
                      code={`X-API-Key: ak_XXXXXX
                      X-Secret-Key: sk_XXXXXX`}
                      language="HTTP Headers"
                      id="headers"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <User className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-800">Données de Compte</h3>
                      </div>
                      <CodeBlock
                        code={`{
                          "type": "account",
                          "data": {
                            "account_number": "41168885",
                            "bank_account": "",
                            "name": "Bahah M'beirick",
                            "balance": "5000.00",
                            "hold_balance": "0.00",
                            "hold_ecommerce": "0.00",
                            "client_type": "CLIENT",
                            "status": "ACTIVE"
                          }
                        }`}
                        language="JSON"
                        id="account-json"
                      />
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center mb-3">
                        <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-purple-800">Données de Transaction</h3>
                      </div>
                      <CodeBlock
                        code={`{
                          "type": "transaction",
                          "data": {
                            "date": "2023-10-01T12:00:00Z",
                            "tran_code": "TR12345",
                            "tran_type": "ENVOI",
                            "compte_expediteur": 41168885,
                            "nom_expediteur": "Bahah M'beirick",
                            "compte_destinataire": 12345678,
                            "nom_destinataire": "Cheikh Ahmed Telmoud",
                            "compte_bancaire": "",
                            "nom_banque": "",
                            "montant": 100.00,
                            "commission_banque": 2.00,
                            "commission_agence": 1.00,
                            "tof": 0.50
                          }
                        }`}
                        language="JSON"
                        id="transaction-json"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 5: Conseils */}
              {activeSection === 'tips' && (
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl mr-4">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">5. Conseils et Erreurs Courantes</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-semibold text-red-800">Erreurs Communes</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-medium text-red-800">Identifiants invalides</p>
                          <p className="text-xs text-red-600 mt-1">
                            → Vérifiez vos clés API et secrètes
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-medium text-red-800">Erreur de validation</p>
                          <p className="text-xs text-red-600 mt-1">
                            → Vérifiez les champs obligatoires
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-green-800">Bonnes Pratiques</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-sm font-medium text-green-800">Utilisez toujours HTTPS</p>
                          <p className="text-xs text-green-600 mt-1">
                            Pour sécuriser vos communications
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-sm font-medium text-green-800">Stockage sécurisé</p>
                          <p className="text-xs text-green-600 mt-1">
                            Gardez vos clés dans un endroit sûr
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-sm font-medium text-green-800">Gestion des erreurs</p>
                          <p className="text-xs text-green-600 mt-1">
                            Implémentez une gestion robuste des erreurs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center mb-3">
                      <Shield className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-800">Sécurité Avancée</h3>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• Renouvelez régulièrement vos clés d'API</li>
                      <li>• Surveillez les tentatives d'accès non autorisées</li>
                      <li>• Utilisez des environnements séparés pour le développement et la production</li>
                      <li>• Limitez l'accès aux clés aux personnes autorisées uniquement</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}