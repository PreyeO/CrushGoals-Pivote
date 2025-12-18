import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'NGN' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const currencies: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
];

// Pricing in USD (base)
const basePricing = {
  monthly: 3,
  annual: 25,
};

// Exchange rates (approximate)
const exchangeRates: Record<Currency, number> = {
  USD: 1,
  NGN: 1500,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
};

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('NGN');

  useEffect(() => {
    // Try to detect user's location/currency
    const stored = localStorage.getItem('preferred_currency') as Currency;
    if (stored && currencies.find(c => c.code === stored)) {
      setCurrency(stored);
      return;
    }

    // Default is NGN, but detect other locales
    const locale = navigator.language;
    if (locale.includes('US') || locale === 'en-US') {
      setCurrency('USD');
    } else if (locale.includes('GB') || locale === 'en-GB') {
      setCurrency('GBP');
    } else if (locale.includes('EU') || ['de', 'fr', 'es', 'it', 'nl'].some(l => locale.startsWith(l))) {
      setCurrency('EUR');
    } else if (locale.includes('CA') || locale === 'en-CA') {
      setCurrency('CAD');
    } else if (locale.includes('AU') || locale === 'en-AU') {
      setCurrency('AUD');
    }
    // NGN remains default for unrecognized locales
  }, []);

  const changeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const getPricing = () => {
    const rate = exchangeRates[currency];
    const currencyInfo = currencies.find(c => c.code === currency)!;
    
    const monthly = Math.round(basePricing.monthly * rate);
    const annual = Math.round(basePricing.annual * rate);
    const monthlyFromAnnual = Math.round(annual / 12);
    const savings = Math.round((1 - annual / (basePricing.monthly * 12 * rate)) * 100);

    return {
      monthly: {
        amount: monthly,
        formatted: `${currencyInfo.symbol}${monthly.toLocaleString()}`,
      },
      annual: {
        amount: annual,
        formatted: `${currencyInfo.symbol}${annual.toLocaleString()}`,
        perMonth: `${currencyInfo.symbol}${monthlyFromAnnual.toLocaleString()}`,
        savings: `${savings}%`,
      },
      symbol: currencyInfo.symbol,
      code: currency,
    };
  };

  return {
    currency,
    currencies,
    changeCurrency,
    getPricing,
    currentCurrency: currencies.find(c => c.code === currency)!,
  };
}
