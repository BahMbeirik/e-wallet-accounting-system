/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
// Icons
import { PlusCircleIcon,  SearchIcon, CashIcon ,CalendarIcon,CreditCardIcon} from '@heroicons/react/outline';
import { FcEmptyTrash } from "react-icons/fc";
import { IoPencilOutline } from "react-icons/io5";

const DepositsPage = () => {
    const [deposits, setDeposits] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [newTransaction, setNewTransaction] = useState({ amount: '', interest_rate: '', account: '' });
    const [loading, setLoading] = useState(false);
    const [totalDeposits, setTotalDeposits] = useState(0);
    const { currency, convertCurrency, ...context  } = useCurrency();
    const navigate = useNavigate();
    const [filteredDeposits, setFilteredDeposits] = useState([]);
    const [searchTextDeposit, setSearchTextDeposit] = useState('');
    
    const [currentPage, setCurrentPage] = useState({  deposit: 1 });
    const [rowsPerPage, setRowsPerPage] = useState(3);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if(!token){
        navigate('/');
      }
        setLoading(true);

        // Fetch deposits
        axiosInstance.get('/deposits/')
            .then(response => {
                setDeposits(response.data);
                calculateTotal(response.data);
                setFilteredDeposits(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });

        // Fetch accounts
        axiosInstance.get('/accounts/')
            .then(response => {
                setAccounts(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    const calculateTotal = (transactions) => {
        const total = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        setTotalDeposits(total);
    };

    const handleAddTransaction = () => {
        setNewTransaction({ amount: '', interest_rate: '', account: '' });
        setEditMode(false);
        setShowModal(true);
    };

    const handleEditTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setNewTransaction({
            amount: transaction.amount,
            interest_rate: transaction.interest_rate,
            account: transaction.account,
            start_date: transaction.start_date,
            end_date: transaction.end_date,
            deposit_date: transaction.deposit_date,
            maturity_date: transaction.maturity_date
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleSaveTransaction = () => {
        const url =`/deposits/${editMode ? selectedTransaction.id + '/' : ''}`;
  
        const method = editMode ? 'put' : 'post';

        const data = {
            amount: newTransaction.amount,
            interest_rate: newTransaction.interest_rate,
            account: newTransaction.account,
            deposit_date:  newTransaction.deposit_date ,
            maturity_date:  newTransaction.maturity_date ,
        };

        axiosInstance({ method, url, data })
            .then(response => {
                    if (editMode) {
                        const updatedDeposits = deposits.map(deposit => deposit.id === selectedTransaction.id ? response.data : deposit);
                        setDeposits(updatedDeposits);
                        calculateTotal(updatedDeposits);
                        toast.success("Deposit has been updated successfully!");
                    } else {
                        setDeposits([...deposits, response.data]);
                        calculateTotal([...deposits, response.data]);
                        toast.success("New deposit has been created successfully!");
                    }
                setShowModal(false);
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
                toast.error('An error occurred. Please try again.');
            });
    };

    const handleDeleteTransaction = (id) => {
        const deleteUrl = `/deposits/${id}/`;
        axiosInstance.delete(deleteUrl)
            .then(() => {
                
                    const updatedDeposits = deposits.filter(deposit => deposit.id !== id);
                    setDeposits(updatedDeposits);
                    calculateTotal(updatedDeposits);
                    toast.success("Deposit has been deleted successfully!");
                
            })
            .catch(error => {
                console.log(error);
                toast.error('Failed to delete. Please try again.');
            });
    };

    const handleSearchDeposit = (event) => {
        const value = event.target.value;
        setSearchTextDeposit(value);

        const filteredData = deposits.filter(deposit =>
            (deposit.interest_rate && deposit.interest_rate.toLowerCase().includes(value.toLowerCase())) ||
            (deposit.deposit_date && deposit.deposit_date.toLowerCase().includes(value.toLowerCase())) ||
            (deposit.amount && deposit.amount.toString().includes(value)) ||
            (deposit.maturity_date && deposit.maturity_date.toLowerCase().includes(value.toLowerCase())) ||
            (deposit.account_name && deposit.account_name.toLowerCase().includes(value.toLowerCase()))
        );

        setFilteredDeposits(filteredData);
        setCurrentPage({ ...currentPage, deposit: 1 }); // Reset to first page when searching
    };

    // Pagination
    const paginate = (data, page, rowsPerPage) => {
        const startIndex = (page - 1) * rowsPerPage;
        return data.slice(startIndex, startIndex + rowsPerPage);
    };

    const handlePageChange = ( page) => {
        setCurrentPage({ ...currentPage,  deposit: page });
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage({  deposit: 1 }); // Reset to first page when changing rows per page
    };

    // Mobile Card Component
    const DepositCard = ({ deposit }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-indigo-500 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-sm">{deposit.account_name}</h3>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleEditTransaction(deposit)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <IoPencilOutline className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => handleDeleteTransaction(deposit.id)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <FcEmptyTrash className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Montant:</span>
                    <span className="font-semibold text-lg text-indigo-600">
                        {formatCurrency(deposit.amount, currency, context)}
                    </span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        
                        <span className="text-sm text-gray-600">Taux:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{deposit.interest_rate}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Date de dépôt:</span>
                    </div>
                    <span className="text-sm text-gray-900">{deposit.deposit_date}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Date d'échéance:</span>
                    </div>
                    <span className="text-sm text-gray-900">{deposit.maturity_date}</span>
                </div>
            </div>
        </div>
    );
    

    return (
      <div className="max-w-7xl mx-auto space-y-6 p-2">
        {/* Dashboard Stats - Carte améliorée */}
        <div className="relative overflow-hidden">
            
            <div className="relative inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CashIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white/90 text-sm font-medium tracking-wide uppercase">Total des dépôts</h2>
                            <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(totalDeposits, currency, context)}</p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="text-right">
                            <div className="text-white/80 text-sm">Épargne</div>
                            <div className="text-white text-lg font-semibold">Sécurisée</div>
                        </div>
                    </div>
                </div>
                
                {/* Indicateur de performance */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-white/80 text-sm">Rendement actif</span>
                    </div>
                    <div className="text-white/80 text-sm">
                        <span className="text-green-300">+5.2%</span> ce mois
                    </div>
                </div>
            </div>
        </div>

        {/* Deposits Section - Design moderne */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header avec gradient subtil */}
            <div className="bg-gradient-to-r from-white via-indigo-50/30 to-white px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CashIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Gestion des Dépôts</h2>
                            <p className="text-sm text-gray-500">Suivez vos placements et leurs échéances</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                        {/* Barre de recherche améliorée */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Rechercher des dépôts..."
                                className="pl-10 pr-4 py-2.5 w-full md:w-64 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                                value={searchTextDeposit}
                                onChange={handleSearchDeposit}
                            />
                        </div>
                        
                        {/* Bouton d'ajout moderne */}
                        <button 
                            onClick={() => handleAddTransaction()}
                            className="group relative inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-2" />
                            <span>Ajouter un Dépôt</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Contenu principal */}
            <div className="px-6 py-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-20"></div>
                        </div>
                        <p className="mt-4 text-gray-500 text-sm">Chargement des dépôts...</p>
                    </div>
                ) : (
                    <>
                        {/* Table pour desktop */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Compte
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Taux d'intérêt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date de dépôt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date d'échéance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {paginate(filteredDeposits, currentPage.deposit, rowsPerPage).map((deposit, index) => (
                                        <tr key={deposit.id} className={`hover:bg-emerald-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-3 w-3 rounded-full bg-emerald-500 mr-3"></div>
                                                    <span className="text-sm font-medium text-gray-900">{deposit.account_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(deposit.amount, currency, context)}</span>
                                                    <div className="ml-2 w-2 h-2 rounded-full bg-green-400"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    {deposit.interest_rate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {deposit.deposit_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {deposit.maturity_date}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {/* Vous pouvez ajouter ici un calcul de jours restants */}
                                                    À échéance
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEditTransaction(deposit)} 
                                                        className="p-2 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors duration-150"
                                                        title="Modifier"
                                                    >
                                                        <IoPencilOutline className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteTransaction(deposit.id)} 
                                                        className="p-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-150"
                                                        title="Supprimer"
                                                    >
                                                        <FcEmptyTrash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDeposits.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <CashIcon className="h-12 w-12 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-sm">Aucun dépôt trouvé</p>
                                                    <p className="text-gray-400 text-xs mt-1">Commencez par créer votre premier dépôt</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>


                            {/* Mobile Cards View */}
                            <div className="md:hidden">
                                <div className="p-4 space-y-3">
                                    {paginate(filteredDeposits, currentPage.deposit, rowsPerPage).map((deposit) => (
                                        <DepositCard key={deposit.id} deposit={deposit} />
                                    ))}
                                    {filteredDeposits.length === 0 && (
                                        <div className="text-center py-8">
                                            <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">Aucun dépôt trouvé</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 grid grid-cols-1 gap-2  md:flex md:justify-between md:items-center">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">Lignes par page :</span>
                                    <select 
                                        value={rowsPerPage} 
                                        onChange={handleRowsPerPageChange}
                                        className="border rounded p-1 text-sm"
                                    >
                                        {[3,5, 10, 15, 20].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">
                                        {filteredDeposits.length > 0 ? 
                                            `${(currentPage.deposit - 1) * rowsPerPage + 1}-${Math.min(currentPage.deposit * rowsPerPage, filteredDeposits.length)} of ${filteredDeposits.length}` : 
                                            '0 of 0'}
                                    </span>
                                    <div className="flex space-x-1">
                                        <button
                                            disabled={currentPage.deposit === 1}
                                            onClick={() => handlePageChange( currentPage.deposit - 1)}
                                            className={`px-3 py-1 rounded ${currentPage.deposit === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:bg-purple-400'}`}
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            disabled={currentPage.deposit * rowsPerPage >= filteredDeposits.length}
                                            onClick={() => handlePageChange( currentPage.deposit + 1)}
                                            className={`px-3 py-1 rounded ${currentPage.deposit * rowsPerPage >= filteredDeposits.length ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:bg-purple-400'}`}
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal for Adding or Editing Transaction */}
            {showModal && (
                <div className="fixed inset-0 bg-sky-500/10 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editMode ? 'Modifier' : 'Ajouter'} 
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Compte</label>
                                    <select 
                                        value={newTransaction.account} 
                                        onChange={(e) => setNewTransaction({ ...newTransaction, account: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    >
                                        <option value="">Sélectionner un compte</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                                    <input 
                                        type="number" 
                                        placeholder="Entrez le montant"
                                        value={newTransaction.amount} 
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Taux d'intérêt (%)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Entrez le taux d'intérêt"
                                        value={newTransaction.interest_rate} 
                                        onChange={(e) => setNewTransaction({ ...newTransaction, interest_rate: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                
                                {newTransaction && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de dépôt</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.deposit_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, deposit_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.maturity_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, maturity_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSaveTransaction}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {editMode ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepositsPage;
