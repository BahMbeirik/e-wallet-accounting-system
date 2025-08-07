/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Doughnut,Line ,PolarArea} from 'react-chartjs-2';
import axiosInstance from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Loader from './Loader';
import {formatCurrency } from '../utils/formatters'
import { useCurrency } from '../contexts/CurrencyContext';
import CombinedChartComponent from '../components/Chart'
import { useNavigate } from 'react-router-dom';

import { 
  Smartphone, 
  Users, 
  ArrowLeftRight, 
  Banknote, 
} from "lucide-react";
import {  CashIcon } from '@heroicons/react/outline';
import { useAuth } from '../contexts/AuthContext';


ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ isSidebarExpanded }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currency, convertCurrency, ...context  } = useCurrency();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.is_staff || false;
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    setLoading(true);
    axiosInstance.get('/dashboard-data/')
      .then((response) => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching dashboard data:', error));
  }, []);



  if (!dashboardData) {
    return <div className="flex justify-center items-center h-screen">{loading && <Loader loading={loading} />}</div>;
  }

  // Account type data
  const accountTypeLabels = dashboardData.account_balances_by_type?.map(item => item.client_type) || [];
  const accountTypeData = dashboardData.account_balances_by_type?.map(item => item.total_balance) || [];
  const colors = ['#36a2eb', '#ff6384', '#ffce56', '#4bc0c0', '#9966ff'];

  // Type Transaction chart data
  const TypeTransactionData = {
    labels: ['Envoi', 'Paiement', 'Retrait Compte', 'Retrait', 'Recharge', 'Paiement Crédit', 'Paiement Facture'],
    datasets: [
      {
        data: [dashboardData.transactions.total_Envoi, dashboardData.transactions.total_Paiement, dashboardData.transactions.total_Versement,
               dashboardData.transactions.total_Retrait_Compte, dashboardData.transactions.total_Retrait,
               dashboardData.transactions.total_Recharge, dashboardData.transactions.total_Paiement_Credit,
               dashboardData.transactions.total_Paiement_Facture],
        backgroundColor: ['#4e73df', '#5a189a', '#f9c74f', '#90be6d', '#f3722c', '#f8961e', '#277da1', '#90be6d'],
        hoverBackgroundColor: ['#2e59d9', '#9d4edd', '#f9c74f', '#43aa8b', '#f3722c', '#f8961e', '#277da1', '#90be6d'],
        borderWidth: 0,
      },
    ],
  };

  // Account type chart data
  const accountTypeChartData = {
    labels: accountTypeLabels,
    datasets: [{
      data: accountTypeData,
      backgroundColor: colors.slice(0, accountTypeLabels.length),
      hoverBackgroundColor: colors.slice(0, accountTypeLabels.length),
      borderWidth: 0,
    }]
  };

  // Top Accounts Line Chart data
  const topAccountsData = {
     labels: dashboardData.top_account?.slice(0, 5).map(account => account.name) || [],
    // labels: dashboardData.top_account?.slice(0, 5).map(account => 
    //     account.name.split(' ').map(word => word[0]).join('')
    // ) || [],
    datasets: [
      {
        label: 'Account Balance',
        data: dashboardData.top_account?.slice(0, 5).map(account => account.balance) || [],
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        pointBackgroundColor: '#4e73df',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4e73df',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          
          label: function(context) {
              // const index = context.dataIndex;
              // const fullName = dashboardData.top_account?.[index]?.name || 'Unknown';
              // const balance = context.raw;
              // return `${fullName}: ${formatCurrency(balance ,currency)}`;
              return `${context.dataset.label}: ${formatCurrency(context.raw, currency)}`;
          },
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value, currency,context);
          }
        }
      }
    }
  };
  
  const TypeTransactionOptions = {
    responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      boxWidth: 12,
                      font: {
                        size: 11
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (contextI) => {
                        return `${contextI.label}: ${formatCurrency(contextI.raw, currency,context)}`;
                      }
                    }
                  }
                },
                scales: {
                  r: {
                    ticks: {
                      display: false
                    }
                  }
                }
  }

  const StatCard = ({ title, value, icon: Icon, color}) => (
    <div className="bg-white rounded-xl shadow-lg p-3 border-2" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-1xl font-bold text-gray-900 mb-1">{value}</p>
          
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <div className="bg-gray-50 w-screen md:w-full md:p-2.5 font-sans p-2">

      { isStaff && (
        <StatCard
          title="Total Applications"
          value={dashboardData.total_banking_apps || 0}
          icon={Smartphone} 
          color="#8B5CF6"
        />
      )}

      {/* Top Banks Section */}
      { isStaff && (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Top Banks by Accounts */}
        <div className="group bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-blue-100 hover:border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              Top Banques
            </h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-medium">Par nombre de comptes</p>
          
          {dashboardData.top_banks?.by_accounts?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.top_banks.by_accounts.map((bank, index) => (
                <div key={index} className={`
                  p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100
                  ${!isSidebarExpanded 
                    ? 'flex justify-between items-center' 
                    : 'block space-y-2'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-slate-700 text-sm">{bank.name}</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {bank.account_count} comptes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 italic text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Top Banks by Transactions */}
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-100 hover:border-purple-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
              Top Banques
            </h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-medium">Par nombre de transactions</p>
          
          {dashboardData.top_banks?.by_transactions?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.top_banks.by_transactions.map((bank, index) => (
                <div key={index} className={`
                  p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100
                  ${!isSidebarExpanded 
                    ? 'flex justify-between items-center' 
                    : 'block space-y-2'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-slate-700 text-sm">{bank.name}</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {bank.transaction_count} transactions
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 italic text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Top Banks by Loans */}
        <div className="group bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-green-100 hover:border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition-colors">
              Top Banques
            </h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-medium">Par montant des prêts</p>
          
          {dashboardData.top_banks?.by_loans?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.top_banks.by_loans.map((bank, index) => (
                <div key={index} className={`
                  p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100
                  ${!isSidebarExpanded 
                    ? 'flex justify-between items-center' 
                    : 'block space-y-2'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-slate-700 text-sm">{bank.name}</span>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {formatCurrency(bank.loan_amount, currency, context)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-gray-500 italic text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Top Banks by Deposits */}
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-100 hover:border-purple-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-purple-300 to-purple-400 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-500 transition-colors">
              Top Banques
            </h3>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-medium">Par montant des dépôts</p>
          
          {dashboardData.top_banks?.by_deposits?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.top_banks.by_deposits.map((bank, index) => (
                <div key={index} className={`
                  p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100
                  ${!isSidebarExpanded 
                    ? 'flex justify-between items-center' 
                    : 'block space-y-2'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-300 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-slate-700 text-sm">{bank.name}</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-400 to-purple-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {formatCurrency(bank.deposit_amount, currency, context)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 italic text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/*Total */}
      { !isStaff && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
        <StatCard
          title="Total Comptes"
          value={dashboardData.total_accounts || 0}
          icon={Users} 
          color="#8B5CF6"
        />
        <StatCard
          title="Total Transactions"
          value={dashboardData.total_transactions || 0}
          icon={ArrowLeftRight} 
          color="#ACA5EB"
        />
        <StatCard
          title="Total Loans"
          value={dashboardData.total_loans || 0}
          icon={Banknote} 
          color="#10B981"
        />
        <StatCard
          title="Total Dépôts"
          value={dashboardData.total_deposits || 0}
          icon={CashIcon} 
          color="#F59E0B"
        />
      </div>
      )}
      
      
      { !isStaff && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
        {/* Type de transaction Section  */}
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Répartition par Type de Transaction</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          <div className="h-64">
            <PolarArea
              data={TypeTransactionData}
              options={TypeTransactionOptions}
            />
          </div>
        </div>

        

        {/* Loans and Deposits Section */}
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Top Prêts & Dépôts</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          
          {(dashboardData.top_loans?.length > 0 || dashboardData.top_deposits?.length > 0) ? (
            <CombinedChartComponent 
              loansData={dashboardData.top_loans || []}
              depositsData={dashboardData.top_deposits || []}
            />
          ) : (
            <p className="text-gray-500 italic">Aucune donnée disponible</p>
          )}
        </div>

        {/* Account Types Section */}
        <div className="bg-white rounded-lg shadow-md p-4 h-full">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Types de compte</h3>
          <div className="border-b border-gray-200 mb-4"></div>
          <div className="h-64 flex items-center justify-center">
            <div className="h-72 w-80">
              {dashboardData.account_balances_by_type?.length > 0 ? (
                <Doughnut data={accountTypeChartData} options={{ maintainAspectRatio: true }} />
              ) : (
                <p className="text-gray-500 italic">Aucune donnée de compte disponible</p>
              )}
            </div>
          
          </div>
        </div>
      </div>
      )}
      { !isStaff && (

      <div className=" mt-6">
        
        {/* Top Accounts */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Top 5 Comptes</h3>
          <div className="border-b border-gray-200 mb-4"></div>
            {dashboardData.top_account && dashboardData.top_account.length > 0 ? (
              <div className="h-64">
                <Line data={topAccountsData} options={lineChartOptions} />
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune donnée de compte disponible</p>
            )}
          </div>
      </div>
      
      )}
      </div>
  );
};

export default Dashboard;

