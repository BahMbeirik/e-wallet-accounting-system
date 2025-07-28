/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
// Icons
import { PlusCircleIcon,  SearchIcon,  CreditCardIcon,CalendarIcon } from '@heroicons/react/outline';
import { FcEmptyTrash } from "react-icons/fc";
import { IoPencilOutline } from "react-icons/io5";

const LoansDepositsPage = () => {
    const [loans, setLoans] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [newTransaction, setNewTransaction] = useState({  amount: '', interest_rate: '', account: '' });
    const [loading, setLoading] = useState(false);
    const [totalLoans, setTotalLoans] = useState(0);
    const { currency, convertCurrency, ...context  } = useCurrency();
    const [filteredLoans, setFilteredLoans] = useState([]);
    const [searchTextLoan, setSearchTextLoan] = useState('');
    const navigate = useNavigate();
    
    const [currentPage, setCurrentPage] = useState({ loan: 1 });
    const [rowsPerPage, setRowsPerPage] = useState(3);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if(!token){
        navigate('/');
      }
        setLoading(true);
        // Fetch loans
        axiosInstance.get('/loans/')
            .then(response => {
                setLoans(response.data);
                calculateTotal(response.data);
                setFilteredLoans(response.data);
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
        setTotalLoans(total);
    };

    const handleAddTransaction = () => {
        setNewTransaction({amount: '', interest_rate: '', account: '' });
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
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleSaveTransaction = () => {
        const url = `/loans/${editMode ? selectedTransaction.id + '/' : ''}`;
  
        const method = editMode ? 'put' : 'post';

        const data = {
            amount: newTransaction.amount,
            interest_rate: newTransaction.interest_rate,
            account: newTransaction.account,
            start_date:  newTransaction.start_date ,
            end_date: newTransaction.end_date ,
        };

        axiosInstance({ method, url, data })
            .then(response => {
                    if (editMode) {
                        const updatedLoans = loans.map(loan => loan.id === selectedTransaction.id ? response.data : loan);
                        setLoans(updatedLoans);
                        calculateTotal(updatedLoans);
                        toast.success("Loan has been updated successfully!");
                    } else {
                        setLoans([...loans, response.data]);
                        calculateTotal([...loans, response.data]);
                        toast.success("New loan has been created successfully!");
                    }
                
                setShowModal(false);
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
                toast.error('An error occurred. Please try again.');
            });
    };

    const handleDeleteTransaction = (id) => {
        const deleteUrl = `/loans/${id}/` ;
        axiosInstance.delete(deleteUrl)
            .then(() => {
                    const updatedLoans = loans.filter(loan => loan.id !== id);
                    setLoans(updatedLoans);
                    calculateTotal(updatedLoans);
                    toast.success("Loan has been deleted successfully!");
                
            })
            .catch(error => {
                console.log(error);
                toast.error('Failed to delete. Please try again.');
            });
    };

    // Handle search functionality
    const handleSearchLoan = (event) => {
        const value = event.target.value;
        setSearchTextLoan(value);

        const filteredData = loans.filter(loan =>
            (loan.interest_rate && loan.interest_rate.toLowerCase().includes(value.toLowerCase())) ||
            (loan.start_date && loan.start_date.toLowerCase().includes(value.toLowerCase())) ||
            (loan.amount && loan.amount.toString().includes(value)) ||
            (loan.end_date && loan.end_date.toLowerCase().includes(value.toLowerCase())) ||
            (loan.account_name && loan.account_name.toLowerCase().includes(value.toLowerCase()))
        );

        setFilteredLoans(filteredData);
        setCurrentPage({ ...currentPage, loan: 1 }); // Reset to first page when searching
    };

    // Pagination
    const paginate = (data, page, rowsPerPage) => {
        const startIndex = (page - 1) * rowsPerPage;
        return data.slice(startIndex, startIndex + rowsPerPage);
    };

    const handlePageChange = ( page) => {
        setCurrentPage({ ...currentPage, loan: page });
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage({ loan: 1 }); // Reset to first page when changing rows per page
    };

    // Mobile Card Component
    const LoanCard = ({ loan }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-indigo-500 mr-2" />
                    <h3 className="font-semibold text-gray-900 text-sm">{loan.account_name}</h3>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleEditTransaction(loan)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <IoPencilOutline className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => handleDeleteTransaction(loan.id)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <FcEmptyTrash  className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Montant:</span>
                    <span className="font-semibold text-lg text-indigo-600">
                        {formatCurrency(loan.amount, currency, context)}
                    </span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        
                        <span className="text-sm text-gray-600">Taux:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{loan.interest_rate}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">début:</span>
                    </div>
                    <span className="text-sm text-gray-900">{loan.start_date}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Fin:</span>
                    </div>
                    <span className="text-sm text-gray-900">{loan.end_date}</span>
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
                            <CreditCardIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white/90 text-sm font-medium tracking-wide uppercase">Total des prêts</h2>
                            <p className="text-white text-3xl font-bold tracking-tight">{formatCurrency(totalLoans, currency, context)}</p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="text-right">
                            <div className="text-white/80 text-sm">Portefeuille</div>
                            <div className="text-green-300 text-lg font-semibold">Actif</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Loans Section - Design moderne */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header avec gradient subtil */}
            <div className="bg-gradient-to-r from-white to-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <CreditCardIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Gestion des Prêts</h2>
                            <p className="text-sm text-gray-500">Gérez vos prêts et suivez vos remboursements</p>
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
                                placeholder="Rechercher des prêts..."
                                className="pl-10 pr-4 py-2.5 w-full md:w-64 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                                value={searchTextLoan}
                                onChange={handleSearchLoan}
                            />
                        </div>
                        
                        {/* Bouton d'ajout moderne */}
                        <button 
                            onClick={() => handleAddTransaction()}
                            className="group relative inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-2" />
                            <span>Ajouter un Prêt</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Contenu principal */}
            <div className="px-6 py-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-20"></div>
                        </div>
                        <p className="mt-4 text-gray-500 text-sm">Chargement des prêts...</p>
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
                                            Date de début
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Date de fin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {paginate(filteredLoans, currentPage.loan, rowsPerPage).map((loan, index) => (
                                        <tr key={loan.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-3 w-3 rounded-full bg-indigo-500 mr-3"></div>
                                                    <span className="text-sm font-medium text-gray-900">{loan.account_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(loan.amount, currency, context)}</span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {loan.interest_rate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {loan.start_date}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {loan.end_date}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEditTransaction(loan)} 
                                                        className="p-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-150"
                                                        title="Modifier"
                                                    >
                                                        <IoPencilOutline className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteTransaction(loan.id)} 
                                                        className="p-2 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-150"
                                                        title="Supprimer"
                                                    >
                                                        <FcEmptyTrash  className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLoans.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <CreditCardIcon className="h-12 w-12 text-gray-300 mb-4" />
                                                    <p className="text-gray-500 text-sm">Aucun prêt trouvé</p>
                                                    <p className="text-gray-400 text-xs mt-1">Commencez par ajouter votre premier prêt</p>
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
                                    {paginate(filteredLoans, currentPage.loan, rowsPerPage).map((loan) => (
                                        <LoanCard key={loan.id} loan={loan} />
                                    ))}
                                    {filteredLoans.length === 0 && (
                                        <div className="text-center py-8">
                                            <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">Aucun prêt trouvé</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 grid grid-cols-1 gap-2  md:flex md:justify-between md:items-center ">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-700 mr-2">Lignes par page:</span>
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
                                        {filteredLoans.length > 0 ? 
                                            `${(currentPage.loan - 1) * rowsPerPage + 1}-${Math.min(currentPage.loan * rowsPerPage, filteredLoans.length)} of ${filteredLoans.length}` : 
                                            '0 of 0'}
                                    </span>
                                    <div className="flex space-x-1">
                                        <button
                                            disabled={currentPage.loan === 1}
                                            onClick={() => handlePageChange( currentPage.loan - 1)}
                                            className={`px-3 py-1 rounded ${currentPage.loan === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:bg-purple-400'}`}
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            disabled={currentPage.loan * rowsPerPage >= filteredLoans.length}
                                            onClick={() => handlePageChange( currentPage.loan + 1)}
                                            className={`px-3 py-1 rounded ${currentPage.loan * rowsPerPage >= filteredLoans.length ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:bg-purple-400'}`}
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
                                {editMode ? 'Modifier' : 'Ajouter un nouvel Prêt'}
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.start_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, start_date: e.target.value })}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                            <input 
                                                type="date" 
                                                value={newTransaction.end_date || ''} 
                                                onChange={(e) => setNewTransaction({ ...newTransaction, end_date: e.target.value })}
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

export default LoansDepositsPage;
