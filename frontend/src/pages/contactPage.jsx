/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Users, Award } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
export default function ContactPage() {
  const [formData, setFormData] = useState({
    first_name: '', 
    last_name: '',   
    email: '',
    company: '',
    phone: '',
    employees: '',
    message: '',
    consent: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const home = () => {
    setIsSubmitted(false);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      company: '',
      phone: '',
      employees: '',
      message: '',
      consent: false
    });
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast.error('Veuillez accepter la politique de confidentialité');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://bahah.pythonanywhere.com/api/contact-sales/', {
        ...formData,
        consent: true // Toujours envoyer true car la validation est faite avant
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setIsSubmitted(true);
      toast.success('Demande envoyée avec succès!');
    } catch (error) {
      if (error.response) {
        // Afficher les erreurs de validation du backend
        if (error.response.data) {
          for (const [key, value] of Object.entries(error.response.data)) {
            toast.error(`${key}: ${value}`);
          }
        } else {
          toast.error(error.response.statusText);
        }
      } else {
        toast.error('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center transform animate-pulse">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Merci pour votre demande !</h2>
          <p className="text-gray-600 mb-6">Notre équipe commerciale vous contactera dans les 24 heures.</p>
          <button 
            onClick={home}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
           Accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contacter l'Équipe Commerciale
          </h1>
          <p className="text-gray-600 mt-2">Parlons de vos besoins et trouvons la solution parfaite</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Informations de contact */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Carte principale de contact */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Informations de Contact</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Téléphone</h4>
                    <p className="text-gray-600">+222 41 16 88 85</p>
                    <p className="text-sm text-gray-500 mt-1">Lun-Ven 9h-18h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">bahah008@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">Réponse sous 2h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Adresse</h4>
                    <p className="text-gray-600">123 Avenue des Champs<br />75008 Nouakchott, Mauritanie</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
              <h3 className="text-xl font-semibold mb-6">Pourquoi nous choisir ?</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8 text-blue-200" />
                  <div>
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-blue-100 text-sm">Clients satisfaits</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Clock className="w-8 h-8 text-purple-200" />
                  <div>
                    <div className="text-2xl font-bold">24h</div>
                    <div className="text-purple-100 text-sm">Temps de réponse</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Award className="w-8 h-8 text-indigo-200" />
                  <div>
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-indigo-100 text-sm">Taux de satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Parlons de votre projet</h2>
                <p className="text-gray-600">Remplissez le formulaire et notre équipe vous contactera rapidement</p>
              </div>

              <div className="space-y-6">
                
                {/* Nom et Prénom */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nom *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Prénom *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>

                {/* Email et Téléphone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email professionnel *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="votre.email@entreprise.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                {/* Entreprise et Effectif */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Entreprise *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Effectif</label>
                    <select
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="1-10">1-10 employés</option>
                      <option value="11-50">11-50 employés</option>
                      <option value="51-200">51-200 employés</option>
                      <option value="201-1000">201-1000 employés</option>
                      <option value="1000+">1000+ employés</option>
                    </select>
                  </div>
                </div>

                

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Décrivez votre projet *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Parlez-nous de vos besoins, objectifs et défis actuels..."
                  />
                </div>

                {/* Checkbox RGPD */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    J'accepte que mes données soient utilisées pour me recontacter concernant ma demande. 
                    <a href="#" className="text-blue-600 hover:underline ml-1">Politique de confidentialité</a>
                  </label>
                </div>


                {/* Bouton Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer ma demande</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section droite - Avantages */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Ce que vous obtenez */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ce que vous obtenez</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Consultation gratuite</h4>
                    <p className="text-gray-600 text-sm">Analyse personnalisée de vos besoins et recommandations sur mesure</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Expertise reconnue</h4>
                    <p className="text-gray-600 text-sm">Plus de 10 ans d'expérience avec des entreprises de toutes tailles</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Réponse rapide</h4>
                    <p className="text-gray-600 text-sm">Notre équipe vous recontacte dans les 24h ouvrées</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Accompagnement complet</h4>
                    <p className="text-gray-600 text-sm">De l'analyse des besoins à la mise en œuvre et au support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Notre processus</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Premier contact</h4>
                    <p className="text-gray-600 text-sm">Nous analysons votre demande et planifions un appel découverte</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Audit et recommandations</h4>
                    <p className="text-gray-600 text-sm">Analyse approfondie de vos besoins et proposition de solutions</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Proposition personnalisée</h4>
                    <p className="text-gray-600 text-sm">Devis détaillé avec planning et modalités d'accompagnement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h3>
              
              <div className="space-y-4">
                <div className="bg-white/70 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Combien de temps pour recevoir une réponse ?</h4>
                  <p className="text-gray-600 text-sm">Nous nous engageons à vous recontacter dans les 24h ouvrées maximum.</p>
                </div>
                
                <div className="bg-white/70 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">La consultation initiale est-elle gratuite ?</h4>
                  <p className="text-gray-600 text-sm">Oui, la première consultation et l'audit de vos besoins sont entièrement gratuits.</p>
                </div>
                
                <div className="bg-white/70 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Travaillez-vous avec les PME ?</h4>
                  <p className="text-gray-600 text-sm">Absolument ! Nous adaptons nos solutions à toutes les tailles d'entreprise.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre entreprise ?</h2>
          <p className="text-xl text-blue-100 mb-8">Rejoignez plus de 500 entreprises qui nous font confiance</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+22241168885" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Appeler maintenant</span>
            </a>
            <a href="mailto:bahah008@gmail.com" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Envoyer un email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}