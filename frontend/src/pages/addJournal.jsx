/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddJournalEntry = () => {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    debit_account: '',
    debit_amount: 0,
    credit_account: '',
    credit_amount: 0,
  });

  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    axiosInstance.get('/accounts/')
      .then(response => {
        setAccounts(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.debit_amount) !== parseFloat(formData.credit_amount)) {
      toast.error('Debit and Credit amounts must be equal!');
      return;
    }

    axiosInstance.post('/journal-entries/', formData)
      .then(response => {
        setFormData({
          date: '',
          description: '',
          debit_account: '',
          debit_amount: 0,
          credit_account: '',
          credit_amount: 0,
        });
        navigate('/journal');
        toast.success("A new journal entry has been added!");
      })
      .catch(error => {
        console.error(error);
        toast.error("Failed to add new journal entry!");
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Add New Journal Entry</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Transaction description"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Debit Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="debit_account" className="block text-sm font-medium text-gray-700">Debit Account</label>
                <select
                  id="debit_account"
                  name="debit_account"
                  value={formData.debit_account}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Debit Account</option>
                  {accounts.map(account => (
                    <option key={`debit-${account.id}`} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="debit_amount" className="block text-sm font-medium text-gray-700">Debit Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="debit_amount"
                    name="debit_amount"
                    value={formData.debit_amount}
                    onChange={handleChange}
                    step="0.01"
                    className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="credit_account" className="block text-sm font-medium text-gray-700">Credit Account</label>
                <select
                  id="credit_account"
                  name="credit_account"
                  value={formData.credit_account}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Credit Account</option>
                  {accounts.map(account => (
                    <option key={`credit-${account.id}`} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="credit_amount" className="block text-sm font-medium text-gray-700">Credit Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="credit_amount"
                    name="credit_amount"
                    value={formData.credit_amount}
                    onChange={handleChange}
                    step="0.01"
                    className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/journal')}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Journal Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJournalEntry;