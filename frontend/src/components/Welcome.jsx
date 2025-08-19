/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Shield, Zap, PieChart, Users, ChevronRight, DollarSign } from 'lucide-react';
import Navbar from './Navbar';
import dashboardImage from './../images/dashboard.PNG';
import {  useNavigate , NavLink} from "react-router-dom";

const BankingLandingPage = () => {
  const navigate = useNavigate();
  

  const isLoggedin = () => {
    const token = localStorage.getItem('token');
    if (token) {
        navigate('/dashboard', { replace: true });
    }
    else {
      navigate('/login', { replace: true });
    }
  }


  return (
    <div>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      
      {/* Section d'accueil principale */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
                Système comptable intégré <br />
                <span className="text-indigo-600">pour institutions financières et banques</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Solutions comptables avancées conçues spécifiquement pour le secteur bancaire, vous permettant de gérer les opérations financières avec une haute efficacité, avec des rapports détaillés et des tableaux de bord intégrés sur une plateforme sécurisée et facile à utiliser.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                
               <a onClick={isLoggedin} > <button className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  Commencer maintenant
                  <ChevronRight className="ml-2" size={20} />
                </button></a> 
                <NavLink to="/documentation">
                <button className="px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Documentation
                </button>
                </NavLink>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <Shield size={16} className="text-green-500 mr-2" />
                <span>Système sécurisé conforme aux normes internationales de sécurité bancaire</span>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-10">
              <div className="relative">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <img 
                    src={dashboardImage}
                    alt="Tableau de bord du système comptable" 
                    class="w-full"
                />
                </div>
                <div className="absolute -left-6 -bottom-6 bg-indigo-100 p-3 rounded-lg shadow-md">
                  <PieChart size={40} className="text-indigo-600" />
                </div>
                <div className="absolute -right-6 -top-6 bg-green-100 p-3 rounded-lg shadow-md">
                  <Zap size={40} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section statistiques */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">0</div>
              <div className="text-indigo-200">Institutions financières</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">0</div>
              <div className="text-indigo-200">Années d'expérience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-indigo-200">Temps de fonctionnement</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-indigo-200">Support technique</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section fonctionnalités */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Fonctionnalités du système comptable</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un ensemble complet d'outils et de fonctionnalités spécialement conçus pour répondre aux besoins des institutions financières et des banques
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Rapports financiers intégrés</h3>
              <p className="text-gray-600">
                Rapports analytiques complets des actifs, passifs, revenus et dépenses avec options de personnalisation et d'exportation
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Sécurité avancée</h3>
              <p className="text-gray-600">
                Protection multi-niveaux, chiffrement des données, authentification à deux facteurs et audit complet des opérations
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Performance ultra-rapide</h3>
              <p className="text-gray-600">
                Traitement rapide des données et chargement instantané des rapports avec prise en charge des opérations multiples simultanées
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Gestion des utilisateurs</h3>
              <p className="text-gray-600">
                Autorisations multi-niveaux et possibilité de personnaliser l'accès pour chaque utilisateur selon son rôle
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Rapprochement automatique</h3>
              <p className="text-gray-600">
                Correspondance et rapprochement automatiques des comptes avec alertes instantanées en cas de détection d'anomalies
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Conformité réglementaire</h3>
              <p className="text-gray-600">
                Entièrement conforme aux normes comptables internationales IFRS, Bâle III et aux exigences réglementaires locales
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section appel à l'action */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Prêt à améliorer votre gestion comptable bancaire ?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Rejoignez plus de 500 institutions financières qui utilisent avec succès notre système comptable pour gérer leurs opérations financières quotidiennes
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a onClick={isLoggedin} > <button className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Commencer votre essai gratuit
            </button></a>
            <NavLink to="/contact-sales">
            <button className="px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors">
              Contacter l'équipe commerciale
            </button>
          </NavLink>
          </div>
        </div>
      </section>
      
      {/* Pied de page */}
      <footer className="bg-indigo-700 text-white py-6">
        <div className="container mx-auto px-3">
          {/*
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Forfaits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feuille de route</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Ressources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Études de cas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Équipe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Juridique</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions de service</a></li>
              </ul>
            </div>
          </div>
          */}
          
          <div className="pt-8 border-t border-white text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Système Comptable Bancaire. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
    </div>
  );
};

export default BankingLandingPage;