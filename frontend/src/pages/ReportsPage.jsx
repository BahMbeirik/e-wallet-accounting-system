/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api';
import { CiExport } from "react-icons/ci";
import { PDFExport } from '@progress/kendo-react-pdf';
import {formatCurrency} from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

const FinancialReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, convertCurrency, ...context  } = useCurrency();
  const navigate = useNavigate();
  
  const pdfExportComponent = useRef(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    // Fetch report data from API
    const fetchReport = async () => {
      try {
        const response = await axiosInstance.get('/financial-report/');
        setReport(response.data);
        console.log('Financial Report Data:', response.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching financial report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handleExport = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span className="font-bold">Error: </span>
      <span className="block sm:inline">{error}</span>
    </div>
  );

  // Ensure that the report object is not null and contains the required keys
  if (!report || !report.accounts || !report.loans || !report.deposits) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="font-bold">Warning: </span>
        <span className="block sm:inline">Invalid data received from the server</span>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-6xl mx-auto bg-gray-50">
      <div className="flex justify-between items-center p-2  ">
        <h1 className="text-2xl font-bold">Rapports Financiers</h1>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md shadow hover:bg-blue-50 transition duration-200"
        >
          <CiExport className="text-xl" />
          <span>Exporter PDF</span>
        </button>
      </div>
      <PDFExport paperSize="A3" margin="1cm" ref={pdfExportComponent} fileName="Financial_Report">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h1 className="text-2xl font-bold">Rapport Financier</h1>

          </div>

          {/* Accounts Section */}
          <section className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Comptes
            </h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Total des soldes par type de compte</h3>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {report.total_balances_by_type.map((balance, index) => (
                  <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                    <span className="font-medium text-gray-700">{balance.client_type}</span>
                    <span className="text-gray-900">
                      <span className="text-gray-500 mr-2">Solde total :</span>
                      <span className="font-bold text-blue-600">{formatCurrency(balance.total_balance, currency, context)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-gray-100 px-4 py-3 flex justify-between items-center font-semibold">
                <span className="text-gray-800">Solde total de tous les comptes</span>
                <span className="text-blue-600 text-lg">{formatCurrency(report.total_balances, currency, context)}</span>
              </div>
            </div>
          </section>

          {/* Transactions Section 
          <section className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Transactions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-green-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-green-800">Crédits</h3>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total des crédits</span>
                  <span className="font-bold text-green-600">{formatCurrency(report.transactions.total_credit, currency, context)}</span>
                </div>
              </div>
              
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-red-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-red-800">Débits</h3>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total des débits</span>
                  <span className="font-bold text-red-600">{formatCurrency(report.transactions.total_debit, currency, context)}</span>
                </div>
              </div>
            </div>
          </section>
          */}
          {/* Loans & Deposits Section */}
          <section className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prêts & Dépôts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loans */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-purple-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-purple-800">Prêts</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="p-4 flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total des prêts</span>
                    <span className="font-bold text-purple-600">{formatCurrency(report.loans.total_loan_amount, currency, context)}</span>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total des intérêts</span>
                    <span className="font-bold text-purple-600">{formatCurrency(report.loans.total_interest, currency, context)}</span>
                  </div>
                </div>
              </div>
              
              {/* Deposits */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-yellow-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-yellow-800">Dépôts</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="p-4 flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total des dépôts</span>
                    <span className="font-bold text-yellow-600">{formatCurrency(report.deposits.total_deposit_amount, currency, context)}</span>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total des intérêts</span>
                    <span className="font-bold text-yellow-600">{formatCurrency(report.deposits.total_interestDeposit, currency, context)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <div className="text-center p-2 text-sm text-gray-500 border-t border-gray-200 bg-gray-50">
            Généré le {new Date().toLocaleDateString()}
          </div>
        </div>
      </PDFExport>
    </div>
  );
};

export default FinancialReport;