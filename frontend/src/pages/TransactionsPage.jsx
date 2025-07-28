/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { MdEdit, MdOutlineDelete, MdAdd, MdSearch, MdRefresh, MdClose,MdUpload } from "react-icons/md";
import DataTable from 'react-data-table-component';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { GrTransaction } from "react-icons/gr";
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { currency, convertCurrency, ...context  } = useCurrency();
    const [showCounterpart, setShowCounterpart] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importProgress, setImportProgress] = useState(null);
    const [importErrors, setImportErrors] = useState([]);

    // const [newTransaction, setNewTransaction] = useState({
    //     transaction_type: '',
    //     amount: '',
    //     description: '',
    //     account: '',
    //     counterpart_account: ''
    // });
    // const [editTransaction, setEditTransaction] = useState(null);

    // أضف هذا useEffect لتحديث حالة showCounterpart عند تغيير نوع المعاملة
    // useEffect(() => {
    //     const transactionType = editTransaction ? editTransaction.transaction_type : newTransaction.transaction_type;
    //     setShowCounterpart(transactionType === 'transfer' || transactionType === 'charging');
    // }, [newTransaction.transaction_type, editTransaction?.transaction_type]);

    // const handleTransactionTypeChange = (e) => {
    // const value = e.target.value;
    // if (editTransaction) {
    //     setEditTransaction({ 
    //         ...editTransaction, 
    //         transaction_type: value,
    //         counterpart_account: (value === 'transfer' || value === 'charging') ? editTransaction.counterpart_account : null
    //     });
    // } else {
    //     setNewTransaction({ 
    //         ...newTransaction, 
    //         transaction_type: value,
    //         counterpart_account: (value === 'transfer' || value === 'charging') ? newTransaction.counterpart_account : null
    //     });
    // }
    // setShowCounterpart(value === 'transfer' || value === 'charging');
    // };

    const handleImportTransactions = () => {
        if (!importFile) {
            toast.error("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        setImportProgress('Uploading...');
        setImportErrors([]);

        axiosInstance.post('/import_transactions_csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            setImportProgress(null);
            if (response.data.errors && response.data.errors.length > 0) {
                setImportErrors(response.data.errors);
                toast.warning(`Imported with ${response.data.errors.length} errors`);
            } else {
                toast.success(response.data.message);
                setShowImportModal(false);
                fetchTransactions();
            }
        })
        .catch(error => {
            setImportProgress(null);
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to import transactions");
        });
    };

    useEffect(() => {
      const token = localStorage.getItem('token');
      if(!token) {
        navigate('/');
      }
      fetchTransactions();
      fetchAccounts();
    }, []);

    const fetchTransactions = () => {
        setLoading(true);
        axiosInstance.get('/transactions/')
            .then(response => {
                setTransactions(response.data);
                setFilteredTransactions(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                toast.error("Failed to load transactions");
                setLoading(false);
            });
    };

    const fetchAccounts = () => {
        axiosInstance.get('/accounts/')
            .then(response => {
                setAccounts(response.data);
            })
            .catch(error => {
                console.error(error);
                toast.error("Failed to load accounts");
            });
    };

    // const handleAddTransaction = () => {
    //     setLoading(true);
    //     axiosInstance.post('/transactions/', newTransaction)
    //         .then(() => {
    //             setNewTransaction({ 
    //                 transaction_type: '', 
    //                 amount: '', 
    //                 description: '', 
    //                 account: '',
    //                 counterpart_account: ''
    //             });
    //             fetchTransactions();
    //             toast.success("Transaction added successfully!");
    //             setShowForm(false);
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             if (error.response?.data) {
    //                 toast.error(error.response.data);
    //             } else {
    //                 toast.error("Failed to add transaction!");
    //             }
    //             setLoading(false);
    //         });
    // };

    // const handleEditTransaction = (transaction) => {
    //     setEditTransaction({
    //         ...transaction,
    //         account: transaction.account.id,
    //         counterpart_account: transaction.counterpart_account.id
    //     });
    //     setShowForm(true);
    // };

    // const handleUpdateTransaction = () => {
    //     setLoading(true);
    //     axiosInstance.put(`/transactions/${editTransaction.id}/`, editTransaction)
    //         .then(() => {
    //             setEditTransaction(null);
    //             fetchTransactions();
    //             toast.success("Transaction updated successfully!");
    //             setShowForm(false);
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             toast.error("Failed to update transaction!");
    //             setLoading(false);
    //         });
    // };

    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            setLoading(true);
            axiosInstance.delete(`/transactions/${transactionId}/`)
                .then(() => {
                    fetchTransactions();
                    toast.success("Transaction deleted successfully!");
                })
                .catch(error => {
                    console.error(error);
                    toast.error("Failed to delete transaction!");
                    setLoading(false);
                });
        }
    };

    const handleSearch = (event) => {
      const value = event.target.value.toLowerCase();
      setSearchText(value);

      const filteredData = transactions.filter(transaction => {
          const tran_type = transaction.tran_type?.toLowerCase() || '';
          const date = transaction.date?.toLowerCase() || '';
          const montant = transaction.montant?.toString() || '';
          const tran_code = transaction.tran_code?.toLowerCase() || '';
          const nom_expediteur = transaction.nom_expediteur?.toLowerCase() || '';
          const compte_expediteur = transaction.compte_expediteur?.toLowerCase() || '';
          const nom_destinataire = transaction.nom_destinataire?.toLowerCase() || '';
          const compte_destinataire = transaction.compte_destinataire?.toLowerCase() || '';

          return (
              tran_type.includes(value) ||
              date.includes(value) ||
              montant.includes(value) ||
              tran_code.includes(value) ||
              nom_expediteur.includes(value) ||
              compte_expediteur.includes(value) ||
              compte_destinataire.includes(value) ||
              nom_destinataire.includes(value)
            );
          });

          setFilteredTransactions(filteredData);
      };

    // const resetForm = () => {
    //     setEditTransaction(null);
    //     setNewTransaction({ 
    //         transaction_type: '', 
    //         amount: '', 
    //         description: '', 
    //         account: '',
    //         counterpart_account: ''
    //     });
    //     setShowForm(false);
    // };

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8f9fa',
                borderRadius: '8px 8px 0 0'
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: '600',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                fontSize: '14px',
                minHeight: '46px',
                borderRadius: '10px',
                margin: '4px 0',
                backgroundColor: '#f1f1f1',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#e9ecef',
                transitionDuration: '0.15s',
                transitionProperty: 'background-color',
                outlineStyle: 'solid',
                outlineWidth: '1px',
                outlineColor: '#e9ecef',
            },
        },
        pagination: {
            style: {
                borderRadius: '0 0 8px 8px',
            },
        },
    };

    const columns = [
        {
            name: 'Date',
            selector: row => new Date(row.date).toLocaleString(),
            sortable: true,
            cell: row => (
                <div className="text-gray-600 px-1 py-1 rounded text-xs font-medium bg-white">
                    {new Date(row.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            ),
        },
        {
            name: 'Code',
            selector: row => row.tran_code,
            sortable: true,
            cell: row => (
                <div className="text-gray-500 px-2 py-1 rounded text-xs font-medium bg-gray-100">
                    {row.tran_code}
                </div>
            ),
        },
        {
            name: 'Type',
            selector: row => row.tran_type,
            sortable: true,
            cell: row => (
                <div className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {row.tran_type}
                </div>
            ),
        },
        {
            name: 'Montant',
            selector: row => row.montant,
            sortable: true,
            cell: row => (
                <div className="font-medium text-green-500">
                    {formatCurrency(row.montant, currency, context)}
                </div>
            ),
        },
        {
            name: 'Expéditeur',
            selector: row => `${row.nom_expediteur} (${row.compte_expediteur})`,
            sortable: true,
        },
        {
            name: 'Destinataire',
            selector: row => `${row.nom_destinataire} (${row.compte_destinataire})`,
            sortable: true,
        },
        {
          name: 'Frais',
          selector: row => (
            Number(row.commission_banque ?? 0) +
            Number(row.commission_agence ?? 0) +
            Number(row.tof ?? 0)
          ),
          cell: row => {
            const frais =
              Number(row.commission_banque ?? 0) +
              Number(row.commission_agence ?? 0) +
              Number(row.tof ?? 0);

            return (
              <div className="text-red-500">
                {formatCurrency(frais, currency, context)}
              </div>
            );
          },
        }
    ];

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    const TransactionCard = ({ transaction }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className='px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800' >
                          {transaction.tran_type
                              ? transaction.tran_type.charAt(0).toUpperCase() + transaction.tran_type.slice(1)
                              : 'Type inconnu'}
                            </div>
                        <div className="text-sm text-gray-500">
                            {transaction.date
                                ? new Date(transaction.date).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'Date inconnue'
                            }
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className='text-lg font-semibold mb-2 text-blue-600'>
                          {formatCurrency(transaction.montant, currency, context)}
                      </div>
                      
                      <div className="text-gray-800 font-medium mb-2 bg-gray-100 rounded px-2 py-1">
                          {transaction.tran_code}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Expéditeur:</span> {transaction.nom_expediteur || 'Inconnu'} ({transaction.compte_expediteur || 'Inconnu'})
                    </div>
                    
                    {transaction.nom_destinataire && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Destinataire:</span> {transaction.nom_destinataire || 'Inconnu'} ({transaction.compte_destinataire || 'Inconnu'})
                        </div>
                    )}

                  
                    <div className="text-sm text-red-600 mt-3 justify-end flex">
                      <span className="font-medium">Frais:</span> {formatCurrency(
                          Number(transaction.commission_banque) +
                          Number(transaction.commission_agence) +
                          Number(transaction.tof),
                          currency,
                          context
                      )}
                    </div>
                  
                </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button 
                    // onClick={() => handleEditTransaction(transaction)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                >
                    <MdEdit size={18} />
                </button>
                <button 
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                >
                    <MdOutlineDelete size={18} />
                </button>
            </div>
        </div>
    );

    const Pagination = () => (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-b-xl">
            <div className="text-sm text-gray-600">
                {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length}
            </div>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                    Précédent
                </button>
                
                <span className="px-3 py-1 text-sm">
                    {currentPage} / {totalPages}
                </span>
                
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                    Suivant
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-screen md:w-full md:p-2.5 font-sans p-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center">
                        <GrTransaction className="text-3xl text-indigo-600" />
                        <div className="ml-2">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestion des Transactions</h2>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="cursor-pointer flex items-center px-3 py-2 border rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    >
                        <MdUpload className="mr-1" />
                        Importer CSV
                    </button>
                    {/*  <button
                        onClick={() => setShowForm(!showForm)}
                        className="cursor-pointer flex items-center px-3 py-2 border rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    >
                        {showForm ? (
                            <>
                                <MdClose className="mr-1" />
                                Annuler
                            </>
                        ) : (
                            <>
                                <MdAdd className="mr-1" />
                                Nouvelle Transaction
                            </>
                        )}
                    </button>
                    */}
                </div>

                {showImportModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                          <div className="p-4 border-b border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-800">Import Transactions from CSV</h3>
                          </div>
                          <div className="p-4">
                              <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-600 mb-2">
                                      CSV File (must include: Date,Tran Code,Tran Type,Compte Expediteur,Nom Expediteur,Compte Destinataire,Nom Destinataire,Compte Bancaire,Nom Banque,Montant,Commission Banque,Commision Agence,TOF)
                                  </label>
                                  <input 
                                      type="file" 
                                      accept=".csv"
                                      onChange={(e) => setImportFile(e.target.files[0])}
                                      className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                      CSV should use semicolon (;) as delimiter and include headers
                                  </p>
                              </div>
                              
                              {importProgress && (
                                  <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded text-sm">
                                      {importProgress}
                                  </div>
                              )}
                              
                              {importErrors.length > 0 && (
                                  <div className="mb-4 max-h-60 overflow-y-auto">
                                      <h4 className="font-medium text-sm mb-2">Import Errors:</h4>
                                      <ul className="text-xs text-red-600 space-y-1">
                                          {importErrors.map((error, index) => (
                                              <li key={index}>{error}</li>
                                          ))}
                                      </ul>
                                  </div>
                              )}
                          </div>
                          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                              <button
                                  onClick={() => {
                                      setShowImportModal(false);
                                      setImportErrors([]);
                                      setImportProgress(null);
                                  }}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                              >
                                  Cancel
                              </button>
                              <button
                                  onClick={handleImportTransactions}
                                  disabled={importProgress}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50"
                              >
                                  {importProgress ? 'Importing...' : 'Import'}
                              </button>
                          </div>
                      </div>
                  </div>
                )}

                {/* Transaction Form 
                {showForm && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editTransaction ? 'Modifier la Transaction' : 'Ajouter une Nouvelle Transaction'}
                        </h3>
                        <form onSubmit={(e) => { 
                            e.preventDefault(); 
                            editTransaction ? handleUpdateTransaction() : handleAddTransaction(); 
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editTransaction ? editTransaction.transaction_type : newTransaction.transaction_type}
                                      
                                          onChange={handleTransactionTypeChange}
                                            required
                                    >
                                        <option value="">Sélectionner le type</option>
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="charging">Charging</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Montant</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editTransaction ? editTransaction.amount : newTransaction.amount}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, amount: e.target.value })
                                            : setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editTransaction ? editTransaction.description : newTransaction.description}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, description: e.target.value })
                                            : setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        placeholder="Description de la transaction"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Compte</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={editTransaction ? editTransaction.account : newTransaction.account}
                                        onChange={(e) => editTransaction
                                            ? setEditTransaction({ ...editTransaction, account: e.target.value })
                                            : setNewTransaction({ ...newTransaction, account: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionner le compte</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {showCounterpart && (
                                  <div>
                                      <label className="block text-sm font-medium text-gray-600 mb-1">Compte Contrepartie</label>
                                      <select
                                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                          value={editTransaction ? editTransaction.counterpart_account : newTransaction.counterpart_account}
                                          onChange={(e) => editTransaction
                                              ? setEditTransaction({ ...editTransaction, counterpart_account: e.target.value })
                                              : setNewTransaction({ ...newTransaction, counterpart_account: e.target.value })}
                                          required={showCounterpart}
                                      >
                                          <option value="">Sélectionner le compte contrepartie</option>
                                          {accounts.map(account => (
                                              <option key={account.id} value={account.id}>
                                                  {account.name}
                                              </option>
                                          ))}
                                      </select>
                                  </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className={`px-4 py-2 ${
                                        editTransaction ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                    } text-white rounded-md transition-colors`}
                                    disabled={loading}
                                >
                                    {loading ? 'Traitement...' : editTransaction ? 'Mettre à jour la Transaction' : 'Ajouter une Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                */}
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Rechercher des transactions..."
                            value={searchText}
                            onChange={handleSearch}
                        />
                    </div>
                    <button 
                        onClick={fetchTransactions}
                        className="hidden md:flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                        disabled={loading}
                    >
                        <MdRefresh className="mr-2" />
                        Actualiser
                    </button>
                </div>

                {/* DataTable */}
                <div className="hidden md:block">
                    <DataTable
                        columns={columns}
                        data={filteredTransactions}
                        customStyles={customStyles}
                        pagination
                        highlightOnHover
                        striped
                        paginationRowsPerPageOptions={[5,10, 25, 50, 100]}
                        paginationPerPage={10}
                        progressPending={loading}
                        progressComponent={<Loader loading={true} />}
                        noDataComponent={
                            <div className="p-6 text-center text-gray-500">
                                {loading ? 'Chargement des transactions...' : 'Aucune transaction trouvée'}
                            </div>
                        }
                    />
                </div>
                {/* Mobile View */}
                <div className="md:hidden mt-1">
                    {currentTransactions.length > 0 ? (
                        currentTransactions.map((transaction) => (
                            <TransactionCard key={transaction.id} transaction={transaction} />
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            Aucune transaction trouvée
                        </div>
                    )}
                    {/* Pagination */}
                    {!loading && filteredTransactions.length > 0 && <Pagination />}
                </div>
            </div>
        </div>
    );
};

export default TransactionsPage;