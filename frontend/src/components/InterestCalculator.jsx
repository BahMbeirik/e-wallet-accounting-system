/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

const InterestCalculator = () => {
  const [loans, setLoans] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState('');
  const [interest, setInterest] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [rate, setRate] = useState(null);
  const [tenure, setTenure] = useState(null);
  const [totalPayable, setTotalPayable] = useState(null);
  const [activeTab, setActiveTab] = useState('loan');
  const { currency, convertCurrency, ...context  } = useCurrency();
  const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/');
    }
    axiosInstance
      .get('/loans/')
      .then((response) => {
        setLoans(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    axiosInstance
      .get('/deposits/')
      .then((response) => {
        setDeposits(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleCalculate = () => {
    if (selectedLoan) {
      axiosInstance
        .get(`/loans/${selectedLoan}/calculate_interest`)
        .then((response) => {
          const { interest, principal, rate, tenure, total_payable } = response.data;
          setInterest(interest);
          setPrincipal(principal);
          setRate(rate);
          setTenure(tenure);
          setTotalPayable(total_payable);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert('Please select a loan to calculate interest.');
    }
  };

  const handleCalculateDeposit = () => {
    if (selectedDeposit) {
      axiosInstance
        .get(`/deposits/${selectedDeposit}/calculate_interestDeposit`)
        .then((response) => {
          const { interest, principal, rate, tenure, total_payable } = response.data;
          setInterest(interest);
          setPrincipal(principal);
          setRate(rate);
          setTenure(tenure);
          setTotalPayable(total_payable);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert('Please select a deposit to calculate interest.');
    }
  };

  const chartData = {
    labels: ['Principal amount', 'Interest amount'],
    datasets: [
      {
        label: 'Amount',
        data: [principal, interest],
        backgroundColor: ['#10B981', '#3B82F6'],
        hoverBackgroundColor: ['#34D399', '#60A5FA'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div >
      {/* Tabs */}
      <div className="flex justify-center mb-6 ">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-6 py-3 text-base font-medium rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 transition-colors duration-200 w-40 ${
              activeTab === 'loan'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('loan')}
          >
            Prêts
          </button>
          <button
            type="button"
            className={`px-6 py-3 text-base font-medium rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 transition-colors duration-200 w-40 ${
              activeTab === 'deposit'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('deposit')}
          >
            Dépôts
          </button>
        </div>
      </div>

      {/* Account selector */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
        <div className="w-full md:w-2/3">
          <select
            value={activeTab === 'loan' ? selectedLoan : selectedDeposit}
            onChange={(e) =>
              activeTab === 'loan'
                ? setSelectedLoan(e.target.value)
                : setSelectedDeposit(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Sélectionner un compte</option>
            {activeTab === 'loan'
              ? loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.account_name}
                  </option>
                ))
              : deposits.map((deposit) => (
                  <option key={deposit.id} value={deposit.id}>
                    {deposit.account_name}
                  </option>
                ))}
          </select>
        </div>
        <div className="w-full md:w-1/3">
          <button
            onClick={activeTab === 'loan' ? handleCalculate : handleCalculateDeposit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Calculer les intérêts
          </button>
        </div>
      </div>

      {interest !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders and results */}
          <div className="flex flex-col">
            <div className="bg-white rounded-t-lg p-6 shadow-sm">
              {principal !== null && (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-700 font-medium">Montant Principal</label>
                    <span className="text-indigo-600 font-bold">
                      {formatCurrency(principal, currency, context)}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-100">
                      <div
                        style={{ width: `${(principal / 500000) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {rate !== null && (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-700 font-medium">Taux d'intérêt</label>
                    <span className="text-indigo-600 font-bold">{rate}%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-100">
                      <div
                        style={{ width: `${(rate / 20) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {tenure !== null && (
                <div className="mb-2">
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-700 font-medium">Durée</label>
                    <span className="text-indigo-600 font-bold">{tenure} mois</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-100">
                      <div
                        style={{ width: `${(tenure / 60) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-b-lg p-5 text-white shadow-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold mb-1">
                    {isNaN(parseFloat(principal)) ? '0.00' : formatCurrency(principal, currency, context)}
                  </p>
                  <p className="text-xs uppercase tracking-wider">Principal</p>
                </div>
                <div>
                  <p className="text-lg font-bold mb-1">
                    {isNaN(parseFloat(interest)) ? '0.00' : formatCurrency(interest, currency, context)}
                  </p>
                  <p className="text-xs uppercase tracking-wider">Total des intérêts</p>
                </div>
                <div>
                  <p className="text-lg font-bold mb-1">
                    {isNaN(parseFloat(totalPayable)) ? '0.00' : formatCurrency(totalPayable, currency, context)}
                  </p>
                  <p className="text-xs uppercase tracking-wider">Total {activeTab === 'loan' ? 'À Payer' : 'Gains'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-full">
            <div className="w-64 h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestCalculator;