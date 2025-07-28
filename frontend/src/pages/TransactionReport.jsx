/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import DataTable from 'react-data-table-component';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
const TransactionReport = () => {
    const [report, setReport] = useState({ credits: [], debits: [], total_credit: 0, total_debit: 0 });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filtered, setFiltered] = useState(false);
    const [loading, setLoading] = useState(true);
    const { currency, convertCurrency, ...context  } = useCurrency();
    const navigate = useNavigate();
    const [modeP, setModeP] = useState('credits');

    const handleModeChange = (mode) => {
        setModeP(mode);
    };

    const fetchTransactions = () => {
        setLoading(true);
        const params = {};
        if (startDate) {
            params.start_date = startDate;
        }
        if (endDate) {
            params.end_date = endDate;
        }

        axiosInstance.get('/transaction-report/', { params })
            .then(response => {
                const data = response.data || { credits: [], debits: [], total_credit: 0, total_debit: 0 };
                setReport(data);
                setFiltered(true);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setFiltered(true);
                setLoading(false);
            });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token){
          navigate('/');
        }
        fetchTransactions();
    }, [startDate, endDate]);

    const creditColumns = [
        {
            name: 'Compte',
            selector: row => row.account || 'N/A',
            sortable: true,
        },
        {
            name: 'Montant',
            selector: row => row.amount || 0,
            sortable: true,
            cell: row => (
                <div className="font-medium text-emerald-600">
                    {formatCurrency(row.amount, currency, context)}
                </div>
            ),
        },
        {
            name: 'Date',
            selector: row => row.date ? new Date(row.date).toLocaleDateString() : 'N/A',
            sortable: true,
        },
    ];

    const debitColumns = [
        {
            name: 'Compte',
            selector: row => row.account || 'N/A',
            sortable: true,
        },
        {
            name: 'Montant',
            selector: row => row.amount || 0,
            sortable: true,
            cell: row => (
                <div className="font-medium text-rose-600">
                    {formatCurrency(row.amount, currency, context)}
                </div>
            ),
        },
        {
            name: 'Date',
            selector: row => row.date ? new Date(row.date).toLocaleDateString() : 'N/A',
            sortable: true,
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#f1f5f9',
                paddingTop: '12px',
                paddingBottom: '12px',
            },
        },
        rows: {
            style: {
                minHeight: '56px',
                fontSize: '0.875rem',
            },
        },
    };

    return (
        <div className="w-screen md:w-full md:p-2.5 font-sans p-2">
        
            <div className='grid grid-cols-1 gap-2 mb-2 md:flex md:justify-between md:items-center'>
              <h2 className="text-lg font-bold text-gray-800">Historique des Transactions</h2>
              <div className="flex justify-between p-1 bg-gray-100 rounded-xl shadow-sm md:w-1/2">
                  <button className={`w-4/5 font-semibold mr-1 p-2 rounded-xl ${
                    modeP === 'credits' 
                      ? 'bg-white text-indigo-500 ' 
                      : 'bg-gray-100 text-gray-700 '
                  }`}
                      onClick={() => handleModeChange('credits')}
                  >
                    <h3 >Crédits</h3>
                  </button>
                  <button className={`w-4/5 font-semibold ml-1 p-2 rounded-xl ${
                    modeP === 'debits' 
                      ? 'bg-white text-indigo-500' 
                      : 'bg-gray-100 text-gray-700 '
                  }`} 
                      onClick={() => handleModeChange('debits')}
                  >
                    <h3 >Débits</h3>
                  </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de Début</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fin</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="">
                    <div className="bg-white rounded-lg shadow overflow-hidden"
                        style={{ display: modeP === 'credits' ? 'block' : 'none' }}
                    >
                        {Array.isArray(report.credits) && report.credits.length > 0 ? (
                            <div className="overflow-hidden">
                                <DataTable
                                    columns={creditColumns}
                                    data={report.credits} 
                                    pagination
                                    highlightOnHover
                                    customStyles={customStyles}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                                    paginationPerPage={5}
                                />
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">Aucune transaction de crédit trouvée.</div>
                        )}
                        <div className="bg-gray-50 py-3 px-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Total Crédits:</span>
                                <span className="text-lg font-bold text-emerald-600">{formatCurrency(report.total_credit, currency, context)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden"
                        style={{ display: modeP === 'debits' ? 'block' : 'none' }}
                    >
                        {Array.isArray(report.debits) && report.debits.length > 0 ? (
                            <div className="overflow-hidden">
                                <DataTable
                                    columns={debitColumns}
                                    data={report.debits} 
                                    pagination
                                    highlightOnHover
                                    customStyles={customStyles}
                                    paginationRowsPerPageOptions={[5, 10, 15, 20]} 
                                    paginationPerPage={5}
                                />
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-500">Aucune transaction de débit trouvée.</div>
                        )}
                        <div className="bg-gray-50 py-3 px-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Total Débits:</span>
                                <span className="text-lg font-bold text-rose-600">{formatCurrency(report.total_debit, currency, context)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filtered && !loading && Array.isArray(report.credits) && Array.isArray(report.debits) && 
             report.credits.length === 0 && report.debits.length === 0 && (
                <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md text-center text-yellow-800">
                    Aucune transaction trouvée entre les dates sélectionnées.
                </div>
            )}

            <div className="mt-6 bg-gray-50 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="block text-sm text-gray-500">Solde Net</span>
                        <span className={`text-xl font-bold ${parseFloat(report.total_credit - report.total_debit) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(report.total_credit - report.total_debit, currency, context)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-sm text-gray-500">Dernière mise à jour</span>
                        <span className="text-gray-700">{new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionReport;