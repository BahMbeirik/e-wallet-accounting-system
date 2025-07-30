/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import {formatCurrency} from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import {  CashIcon } from '@heroicons/react/outline';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  TrendingUp, 
  Activity,
  DollarSign, 
  CreditCard, 
  Download,
  ChevronDown,
  Users,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const FinancialReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, convertCurrency, ...context  } = useCurrency();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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

  

  // Fonction pour exporter en CSV
    const exportToCSV = () => {
        if (!report) return;

        let csvContent = 'data:text/csv;charset=utf-8,';
        const date = new Date().toISOString().slice(0, 10);

        // En-tête
        csvContent += `Rapport Financier,Généré le,${date}\n\n`;

        // Section Prêts
        csvContent += 'Section: Prêts\n';
        csvContent += 'Compte,Montant,Intérêt,Taux (%)\n';
        report.loans.loans.forEach((loan) => {
          csvContent += `${loan.account},${loan.amount},${loan.interest},${loan.interest_rate}\n`;
        });
        csvContent += '\n';

        // Section Dépôts
        csvContent += 'Section: Dépôts\n';
        csvContent += 'Compte,Montant,Intérêt,Taux (%)\n';
        report.deposits.deposits.forEach((deposit) => {
          csvContent += `${deposit.account},${deposit.amount},${deposit.interest},${deposit.interest_rate}\n`;
        });
        csvContent += '\n';

        // Répartition par Type de Client
        csvContent += 'Répartition par Type de Client\n';
        csvContent += 'Type de Client,Montant Total,Pourcentage\n';
        report.total_balances_by_type.forEach((item) => {
          const percentage = ((item.total_balance / report.total_balances) * 100).toFixed(1) + '%';
          csvContent += `${item.client_type},${item.total_balance},${percentage}\n`;
        });
        csvContent += '\n';

        // Répartition par Type de Client détaillée
        csvContent += 'Répartition par Type de Client détaillée\n';
        csvContent += 'Type de Client,Compte,Solde,Pourcentage\n';
        report.repartition_by_type?.forEach((group) => {
          group.accounts?.forEach((acc) => {
            const percentage = ((acc.balance / report.total_balances) * 100).toFixed(1) + '%';
            csvContent += `${group.client_type},${acc.account},${acc.balance},${percentage}\n`;
          });
        });
        csvContent += '\n';



        // Résumé
        csvContent += 'Résumé\n';
        csvContent += `Solde Total,${report.total_balances}\n`;
        csvContent += `Total Prêts,${report.loans.total_loan_amount}\n`;
        csvContent += `Intérêts Prêts,${report.loans.total_interest}\n`;
        csvContent += `Total Dépôts,${report.deposits.total_deposit_amount}\n`;
        csvContent += `Intérêts Dépôts,${report.deposits.total_interestDeposit}\n`;

        // Encodage & téléchargement
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `rapport_financier_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);


        toast.success('Export CSV réussi !');
      };

  
    // Fonction pour exporter en PDF (utilisant jsPDF et autoTable)
    const exportToPDF = () => {
        if (!report) return;

        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString('fr-FR');

        doc.setFontSize(16);
        doc.text("Rapport Financier Général", 14, 15);
        doc.setFontSize(10);
        doc.text(`Date: ${dateStr}`, 14, 22);

        // Loans Table
        autoTable(doc, {
          startY: 30,
          head: [['Compte', 'Montant', 'Intérêt', 'Taux %']],
          body: report.loans.loans.map((loan) => [
            loan.account,
            loan.amount.toFixed(2),
            loan.interest.toFixed(2),
            `${loan.interest_rate}%`,
          ]),
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [139, 92, 246] }, // violet
          margin: { top: 10 },
        });

        // Deposits Table
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          head: [['Compte', 'Montant', 'Intérêt', 'Taux %']],
          body: report.deposits.deposits.map((deposit) => [
            deposit.account,
            deposit.amount.toFixed(2),
            deposit.interest.toFixed(2),
            `${deposit.interest_rate}%`,
          ]),
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [16, 185, 129] }, // green
        });

        // Répartition par Type de Client
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 10,
          head: [['Type de Client', 'Montant Total', 'Pourcentage']],
          body: report.total_balances_by_type.map((item) => {
            const percentage = ((item.total_balance / report.total_balances) * 100).toFixed(1) + '%';
            return [
              item.client_type,
              item.total_balance.toFixed(2),
              percentage,
            ];
          }),
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] }, // blue
        });


        // Résumé
        const totalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.text('Résumé:', 14, totalY);

        doc.setFontSize(10);
        doc.text(`• Solde Total: ${report.total_balances.toFixed(2)}`, 14, totalY + 8);
        doc.text(`• Total Prêts: ${report.loans.total_loan_amount.toFixed(2)}`, 14, totalY + 14);
        doc.text(`• Intérêts Prêts: ${report.loans.total_interest.toFixed(2)}`, 14, totalY + 20);
        doc.text(`• Total Dépôts: ${report.deposits.total_deposit_amount.toFixed(2)}`, 14, totalY + 26);
        doc.text(`• Intérêts Dépôts: ${report.deposits.total_interestDeposit.toFixed(2)}`, 14, totalY + 32);

        doc.save(`rapport_financier_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast.success('Export PDF réussi !');
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


  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-lg p-3 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-1xl font-bold text-gray-900 mb-1">{value}</p>
          {trend && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              trend === 'up' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {trend === 'up' ? 
                <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                <ArrowDownRight className="w-4 h-4 mr-1" />
              }
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </div>
    </div>
  );

  const SectionCard = ({ title, children, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200" style={{ background: `linear-gradient(135deg, ${color}10, ${color}05)` }}>
        <div className="flex items-center">
          <Icon className="w-6 h-6 mr-3" style={{ color }} />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-16 h-16 bg-gray-200 rounded-3xl flex items-center justify-center mr-6">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold italic text-gray-700  tracking-wide uppercase mb-2">
                  Rapport financier général
                </h1>
                <p className="text-sm text-gray-600">Vue d'ensemble de la performance financière</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-500 bg-gray-100 px-4 py-2 rounded-2xl">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
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
            </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Solde Total"
            value={formatCurrency(report.total_balances, currency, context)}
            icon={DollarSign}
            color="#3B82F6"
            trend="up"
            trendValue={formatCurrency(report.loans.total_interest + report.deposits.total_interestDeposit, currency, context)}
          />
          <StatCard
            title="Total Prêts"
            value={formatCurrency(report.loans.total_loan_amount, currency, context)}
            icon={CreditCard}
            color="#8B5CF6"
            trend="down"
            trendValue={formatCurrency(report.loans.total_interest, currency, context)}
          />
          <StatCard
            title="Total Dépôts"
            value={formatCurrency(report.deposits.total_deposit_amount, currency, context)}
            icon={CashIcon}
            color="#10B981"
            trend="up"
            trendValue={formatCurrency(report.deposits.total_interestDeposit, currency, context)}
          />
          <StatCard
            title="Intérêts Générés"
            value={formatCurrency(report.loans.total_interest + report.deposits.total_interestDeposit, currency, context)}
            icon={TrendingUp}
            color="#F59E0B"
            trend="up"
            trendValue={formatCurrency(
              report.deposits.deposits[report.deposits.deposits.length - 1]?.interest || 0, 
              currency, 
              context
            )}
          />
        </div>

        {/* Account Balances by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SectionCard title="Répartition par Type de Client" icon={Users} color="#3B82F6">
            <div className="space-y-4">
              {report.total_balances_by_type.map((balance, index) => {
                const percentage = (balance.total_balance / report.total_balances * 100).toFixed(1);
                return (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{balance.client_type}</span>
                      <span className="text-sm text-gray-500">{percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-4">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-600 whitespace-nowrap">
                        {formatCurrency(balance.total_balance, currency, context)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Analyse des Performances" icon={BarChart3} color="#10B981">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Rendement des Dépôts</p>
                    <p className="text-2xl font-bold text-green-800">
                      {((report.deposits.total_interestDeposit / report.deposits.total_deposit_amount) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Taux Moyen Prêts</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {((report.loans.total_interest / report.loans.total_loan_amount) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Loans and Deposits Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Détail des Prêts" icon={CreditCard} color="#8B5CF6">
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-purple-700">Montant Total</p>
                    <p className="text-lg font-bold text-purple-900">
                      {formatCurrency(report.loans.total_loan_amount, currency, context)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Intérêts Totaux</p>
                    <p className="text-lg font-bold text-purple-900">
                      {formatCurrency(report.loans.total_interest, currency, context)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {report.loans.loans.map((loan, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{loan.account}</p>
                      <p className="text-sm text-gray-600">Taux: {loan.interest_rate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(loan.amount, currency, context)}</p>
                      <p className="text-sm text-purple-600">+{formatCurrency(loan.interest, currency, context)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Détail des Dépôts" icon={CashIcon} color="#10B981">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-green-700">Montant Total</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(report.deposits.total_deposit_amount, currency, context)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Intérêts Totaux</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(report.deposits.total_interestDeposit, currency, context)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {report.deposits.deposits.map((deposit, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{deposit.account}</p>
                      <p className="text-sm text-gray-600">Taux: {deposit.interest_rate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(deposit.amount, currency, context)}</p>
                      <p className="text-sm text-green-600">+{formatCurrency(deposit.interest, currency, context)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 bg-white rounded-lg p-4 shadow-sm">
          <p>Dashboard généré automatiquement • Dernière mise à jour: {new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;