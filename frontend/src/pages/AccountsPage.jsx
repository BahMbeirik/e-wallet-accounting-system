/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { useNavigate } from "react-router-dom";
// import { IoIosAddCircle } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { MdManageAccounts } from "react-icons/md";
import { GrView } from "react-icons/gr";
import Loader from '../components/Loader';
import { formatCurrency, formatAccountNumber } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { MdUpload } from "react-icons/md";
import { toast } from 'react-toastify';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    
    const navigate = useNavigate();

    const { currency, convertCurrency, ...context  } = useCurrency();

    const fileInputRef = React.useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
  
    const handleImportAccounts = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            setLoading(true);
            const response = await axiosInstance.post('/import-accounts-csv/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.errors) {
                // Afficher les erreurs
                toast.error(`Import partiellement réussi avec des erreurs:\n${response.data.errors.join('\n')}`);
            } else {
                toast.success(response.data.message);
            }
            
            // Recharger les comptes
            const accountsResponse = await axiosInstance.get('/accounts/');
            setAccounts(accountsResponse.data);
            setFilteredAccounts(accountsResponse.data);
        } catch (error) {
            console.error('Import error:', error);
            toast.error(`Erreur lors de l'import: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');  
        } else {
            axiosInstance.get('/accounts/')
                .then(response => {
                    setLoading(false);
                    setAccounts(response.data);
                    setFilteredAccounts(response.data);
                    sortData(response.data, sortField, sortDirection);
                })
                .catch(error => {
                    console.error(error);
                    setLoading(false);
                });
        }
    }, [navigate]);

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);
        setCurrentPage(1);

        const filteredData = accounts.filter(account =>
            account.account_number.toLowerCase().includes(value.toLowerCase()) ||
            account.name.toLowerCase().includes(value.toLowerCase()) ||
            account.client_type.toLowerCase().includes(value.toLowerCase()) ||
            account.balance.toString().includes(value)
        );

        sortData(filteredData, sortField, sortDirection);
    };

    const sortData = (data, field, direction) => {
        const sortedData = [...data].sort((a, b) => {
            if (field === 'balance') {
                return direction === 'asc' 
                    ? parseFloat(a.balance) - parseFloat(b.balance)
                    : parseFloat(b.balance) - parseFloat(a.balance);
            } else {
                return direction === 'asc'
                    ? a[field].localeCompare(b[field])
                    : b[field].localeCompare(a[field]);
            }
        });
        
        setFilteredAccounts(sortedData);
    };

    const handleSort = (field) => {
        const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        sortData(filteredAccounts, field, newDirection);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Render sort icon based on current sort state
    const renderSortIcon = (field) => {
        if (sortField !== field) return <span className="text-gray-300">↕</span>;
        return sortDirection === 'asc' ? <span className="text-indigo-600">↑</span> : <span className="text-indigo-600">↓</span>;
    };

    const AccountCard = ({ account }) => (
        <div className="bg-white rounded-xl w-72 md:w-80 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="px-2 py-2 md:px-4 md:py-3">
                <div className="flex items-center mb-2 gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.client_type === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                        account.client_type === 'COMMERÇANT' ? 'bg-purple-100 text-purple-800' :
                        'bg-indigo-400 text-white'
                    }`}>
                        {account.client_type}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {account.status}
                    </div>
                </div>
                    
                <div className={`text-xl flex justify-end font-bold ${account.balance > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(account.balance, currency, context)}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{account.name}</h3>
                  <p className="text-sm text-gray-500">
                      Wallet: {formatAccountNumber(account.account_number)}
                      {account.bank_account && ` | Bancaire: ${formatAccountNumber(account.bank_account)}`}
                  </p>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500">Hold Balance</div>
                        <div>{formatCurrency(account.hold_balance, currency, context)}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500">Hold E-commerce</div>
                        <div>{formatCurrency(account.hold_ecommerce, currency, context)}</div>
                    </div>
                </div>
                
                <div className="flex justify-end mt-3 space-x-2">
                    <button 
                        className="px-2 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-indigo-700 flex items-center text-xs transition-colors duration-150"
                        onClick={() => navigate(`/account/${account.id}`)}
                    >
                        <GrView size={14} className="mr-1" />
                        Détails
                    </button>
                    
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-screen md:w-full md:p-2.5 font-sans p-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden w-80 md:w-full">
                <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex items-center sm:mb-0">
                            <div className="p-3 md:p-3 bg-indigo-600 rounded-full text-white shadow-md">
                                <MdManageAccounts className="text-2xl" />
                            </div>
                            <div className="ml-3 md:ml-3">
                                <h2 className="text-2xl font-bold text-gray-800">Comptes</h2>
                                <p className="text-sm text-gray-600">Gérez vos comptes financiers</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Recherche par numéro, nom, type..."
                                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={searchText}
                                    onChange={handleSearch}
                                />
                            </div>

                            <input 
                                type="file" 
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".csv"
                                onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                        handleImportAccounts(e.target.files[0]);
                                        e.target.value = ''; 
                                    }
                                }}
                            />

                            <button 
                                className="cursor-pointer flex items w-full md:w-48 px-3 py-2 border rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                onClick={triggerFileInput}
                            >
                                <MdUpload className="mr-1 mt-1" />
                                Importer CSV
                            </button>
                          {/* 
                            <button 
                                className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 w-full sm:w-auto"
                                onClick={() => navigate('/new-account')}
                            >
                                <div className=" bg-indigo-600 rounded-full text-white shadow-md">
                                    <IoIosAddCircle className="text-2xl" />
                                </div>
                                Créer
                            </button>
                          */}
                        </div>
                    </div>
                </div>

                
                
                <div className="p-3 md:p-5">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader loading={loading} />
                        </div>
                    ) : (
                        <>
                            {/* Sort controls */}
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-700">
                                    Trier par:
                                    <button 
                                        className={`ml-3 px-3 py-1.5 rounded-md ${sortField === 'name' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                                        onClick={() => handleSort('name')}
                                    >
                                        Nom {renderSortIcon('name')}
                                    </button>
                                    <button 
                                        className={`ml-2 px-3 py-1.5 rounded-md ${sortField === 'client_type' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                                        onClick={() => handleSort('client_type')}
                                    >
                                        Type {renderSortIcon('client_type')}
                                    </button>
                                    <button 
                                        className={`ml-2 px-3 py-1.5 rounded-md ${sortField === 'balance' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                                        onClick={() => handleSort('balance')}
                                    >
                                        Solde {renderSortIcon('balance')}
                                    </button>
                                </div>

                                <div className="text-sm font-medium text-gray-700">
                                  Filtrer par type:
                                  <select 
                                      className="ml-2 border rounded-md px-2 py-1 text-sm"
                                      onChange={(e) => {
                                          const type = e.target.value;
                                          const filtered = type === 'ALL' 
                                              ? accounts 
                                              : accounts.filter(acc => acc.client_type === type);
                                          sortData(filtered, sortField, sortDirection);
                                      }}
                                  >
                                      <option value="ALL">Tous</option>
                                      <option value="CLIENT">Client</option>
                                      <option value="COMMERÇANT">Commerçant</option>
                                      <option value="AGENCE">Agence</option>
                                  </select>
                              </div>

                                <div className="flex items-center">
                                    <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">Afficher:</label>
                                    <select
                                        id="itemsPerPage"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        {[3,5, 6, 10, 15, 20].map(value => (
                                            <option key={value} value={value}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {filteredAccounts.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20A8 8 0 116 12a8 8 0 016 8z"></path>
                                        </svg>
                                        <p className="text-lg font-medium">Aucun compte trouvé</p>
                                        <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {currentItems.map(account => (
                                        <AccountCard key={account.id} account={account} />
                                    ))}
                                </div>
                            )}
                            
                            {/* Pagination controls */}
                            {filteredAccounts.length > 0 && (
                                <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredAccounts.length)} sur {filteredAccounts.length} comptes
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            &laquo;
                                        </button>
                                        
                                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = idx + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = idx + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + idx;
                                            } else {
                                                pageNum = currentPage - 2 + idx;
                                            }
                                            
                                            if (pageNum <= totalPages) {
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => paginate(pageNum)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-50'}`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })}
                                        
                                        <button
                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            &raquo;
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Summary */}
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-100">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div className="text-sm text-gray-700">
                                        <span className="font-medium">Total des comptes:</span> <span className="font-bold text-indigo-800">{accounts.length}</span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <span className="font-medium">Solde total:</span> <span className={`font-bold ${accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {formatCurrency(accounts.length > 0 ? accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0) : 0, currency, context)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            </div>
    );
};

export default AccountsPage;