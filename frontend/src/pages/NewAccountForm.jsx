import React, { useState ,useEffect} from 'react';
import axiosInstance from '../api';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const NewAccountForm = () => {
  const [formData, setFormData] = useState({
    account_number: '',
    bank_account: '',
    name: '',
    balance: '',
    hold_balance: '0.00',
    hold_ecommerce: '0.00',
    client_type: 'CLIENT',
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      balance: parseFloat(formData.balance),
      hold_balance: parseFloat(formData.hold_balance),
      hold_ecommerce: parseFloat(formData.hold_ecommerce)
    };

    axiosInstance.post('/accounts/', payload)
      .then(response => {
        toast.success("Nouveau compte créé avec succès!");
        navigate('/accounts');
      })
      .catch(error => {
        console.log('Error:', error.response);
        const errorMsg = error.response?.data?.non_field_errors?.[0] || 
                        Object.values(error.response?.data || {}).flat().join(', ') ||
                        'Échec de la création du compte';
        toast.error(errorMsg);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Créer un nouveau compte</h2>
            <p className="text-blue-100 text-sm mt-1">Entrez les détails du nouveau compte</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Account Number */}
            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de compte Wallet
              </label>
              <input
                type="text"
                id="account_number"
                name="account_number"
                required
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Ex: 37486414"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Bank Account */}
            <div>
              <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de compte bancaire (optionnel)
              </label>
              <input
                type="text"
                id="bank_account"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleChange}
                placeholder="Ex: MR1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Account Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du titulaire
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Mohamed Mahmoud El Moustapha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Client Type */}
            <div>
              <label htmlFor="client_type" className="block text-sm font-medium text-gray-700 mb-1">
                Type de client
              </label>
              <select
                id="client_type"
                name="client_type"
                required
                value={formData.client_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="CLIENT">Client</option>
                <option value="COMMERÇANT">Commerçant</option>
                <option value="AGENCE">Agence</option>
              </select>
            </div>
            
            {/* Balance */}
            <div>
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                Solde initial (MRU)
              </label>
              <input
                type="number"
                id="balance"
                name="balance"
                required
                value={formData.balance}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="CLOSED">Fermé</option>
              </select>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création du compte...
                  </span>
                ) : (
                  'Créer un compte'
                )}
              </button>
            </div>
          </form>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => navigate('/accounts')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Retour à la liste des comptes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAccountForm;