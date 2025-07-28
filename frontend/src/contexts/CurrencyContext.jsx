import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('MRU');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, MRU: 39.19 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      // يمكنك استخدام API حقيقي هنا
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/MRU');
      const data = await response.json();
      setExchangeRates(data.rates);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch exchange rates:", err);
      setError("Failed to update exchange rates. Using default values.");
      // استخدام القيم الافتراضية إذا فشل الاتصال
      setExchangeRates({ USD: 1, MRU: 39.19 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    // تحديث الأسعار كل ساعة
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return amount;
    
    const amountInUSD = fromCurrency === 'USD' 
      ? amount 
      : amount / exchangeRates[fromCurrency];
    
    return toCurrency === 'USD' 
      ? amountInUSD 
      : amountInUSD * exchangeRates[toCurrency];
  };

  const value = {
    currency,
    setCurrency,
    exchangeRates,
    loading,
    error,
    convertCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);