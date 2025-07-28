
/**
 * Formate une date au format "jj/mm/aaaa".
 * @param {string} dateStr - La date à formater (au format ISO ou autre).
 * @returns {string} La date formatée.
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Supprimer la partie des microsecondes et du timezone si présente
    const cleanedDateString = dateString.split('.')[0].replace('+00', '');
    const date = new Date(cleanedDateString + 'Z'); // Ajouter 'Z' pour indiquer le temps UTC
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString; // Retourne la chaîne originale si le parsing échoue
  }
};

/**
 * تنسيق العملات مع دعم التحويل بين العملات
 */
export const formatCurrency = (amount, currency, context) => {
  // الحصول على سعر الصرف من السياق إذا كان متوفراً
  const exchangeRates = context?.exchangeRates || { MRU: 1, [currency]: 1 };

  // تحويل المبلغ إذا لزم الأمر
  const convertedAmount = currency === 'MRU' 
    ? amount 
    : amount * (exchangeRates[currency] || 1);

  // إعدادات التنسيق لكل عملة
  const currencyFormats = {
    USD: {
      locale: 'en-US',
      symbol: '$',
      decimals: 2
    },
    MRU: {
      locale: 'en-MR',
      symbol: 'MRU',
      decimals: 2
    },
    EUR: {
      locale: 'de-DE',
      symbol: '€',
      decimals: 2
    }
  };

  const formatConfig = currencyFormats[currency] || {
    locale: 'en-US',
    symbol: currency,
    decimals: 2
  };

  const formattedValue = new Intl.NumberFormat(formatConfig.locale, {
    style: 'decimal',
    minimumFractionDigits: formatConfig.decimals,
    maximumFractionDigits: formatConfig.decimals
  }).format(convertedAmount);

  return `${formattedValue} ${formatConfig.symbol}`;
};

export const formatAccountNumber = (number) => {
  // Format like XXX-XXXX-XXXX (assuming account numbers have enough digits)
  if (number.length >= 10) {
      return `${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}`;
  }
  return number;
};