import React, { useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const CombinedRadarComponent = ({ loansData = [], depositsData = [] }) => {
  const { currency, exchangeRates } = useCurrency();
  const exchangeRate = exchangeRates[currency] || 1;

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const chartData = React.useMemo(() => {
    const processData = (data) => 
      Array.isArray(data) ? data.slice(0, 3) : [];

    const loans = processData(loansData);
    const deposits = processData(depositsData);

    const allAccounts = [
      ...new Set([
        ...loans.map(item => item?.account),
        ...deposits.map(item => item?.account)
      ].filter(Boolean))
    ];

    return allAccounts.map(account => ({
      account,
      Loans: loans.find(item => item?.account === account)?.amount * 
            (currency === 'MRU' ? 1 : exchangeRate) || 0,
      Deposits: deposits.find(item => item?.account === account)?.amount * 
               (currency === 'MRU' ? 1 : exchangeRate) || 0
    }));
  }, [loansData, depositsData, currency, exchangeRate]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="80%"
          data={chartData}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="account" />
          <PolarRadiusAxis />
          <Tooltip 
            formatter={(value, name, props) => [
              formatCurrency(value, currency),
              name
            ]}
            labelFormatter={(label) => `Account: ${label}`}
          />
          <Legend />
          <Radar 
            name="Loans"
            dataKey="Loans"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.6}
          />
          <Radar 
            name="Deposits"
            dataKey="Deposits"
            stroke="#9d4edd"
            fill="#9d4edd"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedRadarComponent;