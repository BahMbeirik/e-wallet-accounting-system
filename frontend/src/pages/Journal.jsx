/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect ,Fragment } from 'react';
import axiosInstance from '../api';
import { FiSearch,  FiEye } from "react-icons/fi";
import { MdEdit, } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import DataTable from 'react-data-table-component';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { formatCurrency ,formatDate} from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { Dialog, Transition } from '@headlessui/react';
import { Download, ChevronDown } from 'lucide-react';

import { HiOutlineDocumentText, HiOutlineInformationCircle, HiOutlineDownload, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
const JournalEntryList = () => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);
  const [activeSection, setActiveSection] = useState('format');
  const navigate = useNavigate();
  const { currency, convertCurrency, ...context  } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openImportGuide = () => setShowImportGuide(true);
  const closeImportGuide = () => setShowImportGuide(false);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axiosInstance.get('/journal-entries/')
      .then(response => {
        setLoading(false);
        setEntries(response.data);
        setFilteredEntries(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    setLoading(true);
    axiosInstance.post('/import-csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      setLoading(false);
      toast.success("CSV imported Successful!");
      fetchData(); // Refresh the data after import
    })
    .catch(error => {
      setLoading(false);
      if (error.response && error.response.data.error) {
        toast.error("Error importing CSV!");
        console.error('Error importing CSV:', error.response.data.error);
      } else {
        toast.error("Error importing CSV!");
        console.error('Error importing CSV:', error.message);
      }
    });
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Fonction pour exporter en CSV
  const exportToCSV = () => {
    const headers = [
      'Date',
      'Description',
      'Compte Débit',
      'Montant Débit',
      'Compte Crédit',
      'Montant Crédit'
    ];

    const csvData = [
      headers,
      ...filteredEntries.map(entry => [
        formatDate(entry.date),
        entry.description,
        entry.debit_account_name || 'Non spécifié',
        entry.debit_amount,
        entry.credit_account_name || 'Non spécifié',
        entry.credit_amount
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export CSV réussi !');
  };

  // Fonction pour exporter en PDF (utilisant jsPDF et autoTable)
  const exportToPDF = () => {
    const { jsPDF } = require('jspdf');
    require('jspdf-autotable');
    
    const doc = new jsPDF();
    const title = `Journal Comptable - ${new Date().toISOString().slice(0, 10)}`;
    
    // Ajouter le titre
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Préparer les données pour le tableau
    const tableData = filteredEntries.map(entry => [
      formatDate(entry.date),
      entry.description,
      entry.debit_account_name || 'Non spécifié',
      formatCurrency(entry.debit_amount, currency, context),
      entry.credit_account_name || 'Non spécifié',
      formatCurrency(entry.credit_amount, currency, context)
    ]);
    
    // Ajouter le tableau
    doc.autoTable({
      head: [['Date', 'Description', 'Compte Débit', 'Montant Débit', 'Compte Crédit', 'Montant Crédit']],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [63, 81, 181] } // Couleur indigo
    });
    
    // Ajouter les totaux
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Débit: ${formatCurrency(totalDebit, currency, context)}`, 14, finalY);
    doc.text(`Total Crédit: ${formatCurrency(totalCredit, currency, context)}`, 14, finalY + 7);

    // Sauvegarder le PDF
    doc.save(`journal_${new Date().toISOString().slice(0, 10)}.pdf`);
    
    toast.success('Export PDF réussi !');
  };

  

  // Fonction pour télécharger le modèle CSV
  const downloadCSVTemplate = () => {
    const csvData = [
      ['Date', 'Description', 'Compte Débit', 'Montant Débit', 'Compte Crédit', 'Montant Crédit'],
      ['2025-03-10', 'Vente marchandises', 'Sara', '120.00', 'Med', '120.00'],
      ['2025-03-12', 'Paiement loyer', 'Sidi', '800.00', 'Cheikh', '800.00'],
    ]
      .map((row) => row.join(';'))
      .join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modele_journal.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Modèle CSV téléchargé avec succès !');
  };
  
  // Define columns for DataTable
  const columns = [
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      cell: row => (
        <div className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {formatDate(row.date)}
        </div>
      ),
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      cell: row => (
        <div className="max-w-sm truncate">
          {row.description}
        </div>
      ),
    },
    {
      name: 'Débit - Compte',
      selector: row => row.debit_account_name,
      sortable: true,
      cell: row => (
        row.debit_account_name ?
        <div className="px-3 py-1 rounded text-xs font-medium bg-red-200 text-white whitespace-nowrap">
          {row.debit_account_name}
        </div>
        :
        <div className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 whitespace-nowrap">
          Non spécifié
        </div>
      ),
    },
    {
      name: 'Montant Débit',
      selector: row => row.debit_amount,
      sortable: true,
      right: true,
      cell: row => (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.debit_amount, currency, context)}
        </div>
      ),
    },
    {
      name: 'Crédit - Compte',
      selector: row => row.credit_account_name,
      sortable: true,
      cell: row => (
        row.credit_account_name ?
        <div className="px-3 py-1 rounded text-xs font-medium  bg-green-300 text-white whitespace-nowrap">
          {row.credit_account_name}
        </div>
        :
        <div className="px-3 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 whitespace-nowrap">
          Non spécifié
        </div>
      ),
    },
    {
      name: 'Montant Crédit',
      selector: row => row.credit_amount,
      sortable: true,
      right: true,
      cell: row => (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.credit_amount, currency, context)}
        </div>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/view-journal/${row.id}`)}
            className="px-2 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-indigo-700 flex items-center text-xs transition-colors duration-150"
            title="View Details"
          >
            <FiEye size={14} className="text-indigo-600 mr-1 w-5 h-5" />
            Détails
          </button>

          {/* <button
            onClick={() => navigate(`/edit-journal/${row.id}`)}
            className="p-1 rounded-full hover:bg-gray-100"
            title="Edit Entry"
          >
            <MdEdit className="text-indigo-600 w-5 h-5" />
          </button> */}
        </div>
      ),
      button: true,
      width: '100px',
    },
  ];

  // Search function
  const handleSearch = (event) => {
    const value = event.target.value.trim();
    setSearch(value);

    const filteredData = entries.filter(entry => {
      const searchStr = value.toLowerCase();
      
      const dateStr = entry.date ? entry.date.toString().toLowerCase() : '';
      const descStr = entry.description ? entry.description.toLowerCase() : '';
      
      const debitAccStr = entry.debit_account ? entry.debit_account.toString().toLowerCase() : '';
      const creditAccStr = entry.credit_account ? entry.credit_account.toString().toLowerCase() : '';
      
      const debitAmtStr = entry.debit_amount ? entry.debit_amount.toString() : '';
      const creditAmtStr = entry.credit_amount ? entry.credit_amount.toString() : '';
      
      const debitAccNameStr = entry.debit_account_name ? entry.debit_account_name.toLowerCase() : '';
      const creditAccNameStr = entry.credit_account_name ? entry.credit_account_name.toLowerCase() : '';

      return (
        dateStr.includes(searchStr) ||
        descStr.includes(searchStr) ||
        debitAccStr.includes(searchStr) ||
        creditAccStr.includes(searchStr) ||
        debitAmtStr.includes(value) || 
        creditAmtStr.includes(value) ||
        debitAccNameStr.includes(searchStr) ||
        creditAccNameStr.includes(searchStr)
      );
    });

    setFilteredEntries(filteredData);
  };

  // Custom styles for DataTable
  const customStyles = {
    header: {
      style: {
        minHeight: '56px',
        padding: '16px',
        
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #e5e7eb',
      },
    },
    headCells: {
      style: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        minHeight: '46px',
        borderRadius: '10px 10px 10px 10px',
        margin: '4px 0 0 0',
        // backgroundColor: '#f1f1f1',
        backgroundColor: 'white',
        // borderBottom: '1px solid #f3f4f6',
        border: '1px solid #f3f4f6',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    pagination: {
      style: {
        borderRadius: '0 0 8px 8px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
      },
    },
  };

  // Mobile Card Component
  const MobileCard = ({ entry }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {formatDate(entry.date)}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/view-journal/${entry.id}`)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="View Details"
          >
            <FiEye className="text-blue-600 w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-journal/${entry.id}`)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Edit Entry"
          >
            <MdEdit className="text-indigo-600 w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-900 font-medium text-sm truncate">{entry.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Débit</p>
          <div className="flex flex-col space-y-1">
            {entry.debit_account_name ? (
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-200 text-red-800 text-center">
                {entry.debit_account_name}
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 text-center">
                Non spécifié
              </span>
            )}
            <span className="font-semibold text-sm text-gray-900 text-center">
              {formatCurrency(entry.debit_amount, currency, context)}
            </span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Crédit</p>
          <div className="flex flex-col space-y-1">
            {entry.credit_account_name ? (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800 text-center">
                {entry.credit_account_name}
              </span>
            ) : (
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 text-center">
                Non spécifié
              </span>
            )}
            <span className="font-semibold text-sm text-gray-900 text-center">
              {formatCurrency(entry.credit_amount, currency, context)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Pagination for mobile
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const MobilePagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );

  // Get total amounts
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.debit_amount || 0), 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.credit_amount || 0), 0);

  return (
    <div className="w-screen md:w-full md:p-2.5 font-sans p-2">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex md:justify-between grid grid-cols-1 gap-2 p-6 border-b border-gray-200">
          
          <div className="flex items-center sm:mb-0">
            <HiOutlineDocumentText className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Le Journal</h1>
          </div>
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Rechercher dans le journal..."
              value={search}
              onChange={handleSearch}
            />
            
          </div>

          <div className="flex items-center ">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              id="csvUpload"
            />
            <button 
              onClick={openImportGuide}
              className="cursor-pointer flex items-center px-3 py-2 border rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
            >
              <HiOutlineInformationCircle className="h-5 w-5 mr-1" /> Aide CSV
            </button>
        
            <div className="relative inline-block ml-1">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Exporter
                <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        exportToCSV();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-blue-50 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            
            {/* 
            <label htmlFor="csvUpload" className="cursor-pointer flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium bg-gray-200 hover:bg-gray-300">
              <LuImport className="h-5 w-5 mr-2" /> Importer CSV
            </label>
            */}
            {/* 
            <button
              onClick={() => navigate('/add-journal')}
              className="inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <IoIosAddCircle className="h-5 w-5 mr-2" /> Nouvelle Écriture
            </button>
            */}
          </div>
          
        </div>

        <div className="px-2 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader loading={loading} />
            </div>
          ) : (
            <>
            {/* Desktop Table */}
              <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={filteredEntries}
                pagination
                highlightOnHover
                customStyles={customStyles}
                paginationRowsPerPageOptions={[5,7, 10, 15, 20]} 
                paginationPerPage={5}
                noDataComponent={
                  <div className="p-6 text-center text-gray-500">
                    Aucune écriture trouvée
                  </div>
                }
              />
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {currentItems.length > 0 ? (
                  <>
                    {currentItems.map((entry, index) => (
                      <MobileCard key={entry.id || index} entry={entry} />
                    ))}
                    {totalPages > 1 && <MobilePagination />}
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    Aucune écriture trouvée
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Nombre d'écritures</p>
                    <p className="text-xl font-bold text-indigo-700">{filteredEntries.length}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Débit</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(totalDebit, currency, context)}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Crédit</p>
                    <p className="text-xl font-bold text-indigo-600">{formatCurrency(totalCredit, currency, context)}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                  <span>
                    Affichage de {filteredEntries.length} sur {entries.length} écritures
                  </span>
                  {/*
                  <span className={totalDebit === totalCredit ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {totalDebit === totalCredit ? "Journal équilibré" : "Journal déséquilibré"}
                  </span>
                  */} 
                </div>
              </div>
            </>
          )}
        </div>

      </div>

         {/* Modal pour le guide d'importation CSV */}
        <Transition appear show={showImportGuide} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeImportGuide}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Guide d'importation CSV
                    </Dialog.Title>
                    <div className="mt-4">
                      {/* Contenu du guide CSV (identique à votre code actuel) */}
                      <div className="p-4">
                        <p className="text-gray-600 mb-4">
                          Pour importer vos écritures comptables, veuillez suivre les instructions ci-dessous concernant le format du fichier CSV.
                        </p>
                        {/* Format requis */}
                  <div className="border border-gray-200 rounded-lg mb-4">
                  <button
                    className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => toggleSection('format')}
                  >
                    <span>1. Format requis du fichier CSV</span>
                    {activeSection === 'format' ? 
                      <HiOutlineChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  
                  {activeSection === 'format' && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <p className="mb-3">Votre fichier CSV doit contenir les colonnes suivantes (dans cet ordre exact) :</p>
                      <div className="overflow-x-auto mb-3">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">Date</th>
                              <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">Description</th>
                              <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">Compte Débit</th>
                              <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">Montant Débit</th>
                              <th className="py-2 px-3 border-b border-r text-xs font-medium text-gray-600">Compte Crédit</th>
                              <th className="py-2 px-3 border-b text-xs font-medium text-gray-600">Montant Crédit</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 px-3 border-b border-r text-xs">2025-03-15</td>
                              <td className="py-2 px-3 border-b border-r text-xs">Achat fournitures</td>
                              <td className="py-2 px-3 border-b border-r text-xs">bahah</td>
                              <td className="py-2 px-3 border-b border-r text-xs">150.00</td>
                              <td className="py-2 px-3 border-b border-r text-xs">Ali</td>
                              <td className="py-2 px-3 border-b text-xs">150.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700">
                        <div className="flex">
                          <HiOutlineInformationCircle className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">Formats acceptés :</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Date : <span className="font-mono">YYYY-MM-DD</span> (ex: 2025-03-15)</li>
                              <li>Montants : Utiliser le point comme séparateur décimal (ex: 150.00)</li>
                              <li>Comptes : Numéros du plan comptable sans espaces ni tirets</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Règles d'équilibrage */}
                <div className="border border-gray-200 rounded-lg mb-4">
                  <button
                    className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => toggleSection('rules')}
                  >
                    <span>2. Règles d'équilibrage</span>
                    {activeSection === 'rules' ? 
                      <HiOutlineChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  
                  {activeSection === 'rules' && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <p className="mb-3">Chaque ligne importée doit respecter les règles comptables suivantes :</p>
                      <ul className="list-disc pl-5 space-y-2 mb-3">
                        <li>Les montants débit et crédit doivent être égaux pour chaque écriture</li>
                        <li>Les comptes débit et crédit doivent être des numéros valides selon votre plan comptable</li>
                        <li>Une description est obligatoire pour chaque écriture</li>
                        <li>Les dates doivent être valides et au format correct</li>
                      </ul>
                      <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-700">
                        <div className="flex">
                          <HiOutlineInformationCircle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                          <p>
                            <span className="font-medium">Attention :</span> Les écritures non équilibrées ou avec des erreurs ne seront pas importées. Le système vous indiquera les lignes problématiques.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Exemple et modèle */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => toggleSection('example')}
                  >
                    <span>3. Exemple et modèle</span>
                    {activeSection === 'example' ? 
                      <HiOutlineChevronUp className="w-5 h-5 text-gray-500" /> : 
                      <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  
                  {activeSection === 'example' && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <p className="mb-3">Pour vous aider à démarrer, voici un exemple de contenu CSV valide :</p>
                      
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto mb-4 text-gray-700">
                          Date;Description;Compte Débit;Montant Débit;Compte Crédit;Montant Crédit
                          2025-03-10;Vente marchandises;Sara;120.00;Med;120.00
                          2025-03-12;Paiement loyer;Sidi;800.00;Cheikh;800.00
                      </pre>
                      
                      <div className="flex justify-center mb-3">
                        <button onClick={downloadCSVTemplate}
                          className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition text-sm">
                          <HiOutlineDownload className="h-4 w-4 mr-2" />
                          Télécharger le modèle CSV
                        </button>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-md text-xs text-green-700">
                        <div className="flex">
                          <HiOutlineInformationCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <p>
                            <span className="font-medium">Conseil :</span> Vous pouvez créer votre fichier CSV avec Excel ou Google Sheets, puis l'exporter au format CSV.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                        onClick={closeImportGuide}
                      >
                        Fermer
                      </button>
                      <label
                        htmlFor="csvUpload"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer text-sm flex items-center"
                        onClick={closeImportGuide}
                      >
                        Choisir un fichier CSV
                      </label>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
    
    </div>
  );
};

export default JournalEntryList;