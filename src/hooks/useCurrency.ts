import { useState, useEffect } from 'react';

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const currencies: CurrencyInfo[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
];

// Base pricing in NGN
const basePricing = {
  basicMonthly: 1500,
  basicAnnual: 16000,
  premiumMonthly: 2500,
  premiumAnnual: 25000,
};

// Exchange rates from NGN (approximate)
const exchangeRates: Record<Currency, number> = {
  NGN: 1,
  USD: 0.00067, // ~1500 NGN = 1 USD
  GBP: 0.00053, // ~1900 NGN = 1 GBP
  EUR: 0.00061, // ~1650 NGN = 1 EUR
  CAD: 0.00091, // ~1100 NGN = 1 CAD
  AUD: 0.00102, // ~980 NGN = 1 AUD
};

function formatPrice(amount: number, currency: Currency, symbol: string): string {
  // For NGN, show full amount; for others, round to nice numbers
  if (currency === 'NGN') {
    return `${symbol}${amount.toLocaleString()}`;
  }
  // Convert and round to nearest .99 or whole number
  const converted = amount * exchangeRates[currency];
  const rounded = Math.ceil(converted * 100) / 100;
  return `${symbol}${rounded.toFixed(2)}`;
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('NGN');

  useEffect(() => {
    // Try to detect user's location/currency
    const stored = localStorage.getItem('preferred_currency') as Currency;
    if (stored && currencies.find(c => c.code === stored)) {
      setCurrency(stored);
      return;
    }

    // Detect based on browser locale/timezone
    const locale = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Nigeria detection
    if (timezone.includes('Lagos') || timezone.includes('Africa')) {
      setCurrency('NGN');
      return;
    }
    
    if (locale.includes('US') || locale === 'en-US' || timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles')) {
      setCurrency('USD');
    } else if (locale.includes('GB') || locale === 'en-GB' || timezone.includes('Europe/London')) {
      setCurrency('GBP');
    } else if (['de', 'fr', 'es', 'it', 'nl'].some(l => locale.startsWith(l)) || timezone.includes('Europe/')) {
      setCurrency('EUR');
    } else if (locale.includes('CA') || locale === 'en-CA' || timezone.includes('Canada')) {
      setCurrency('CAD');
    } else if (locale.includes('AU') || locale === 'en-AU' || timezone.includes('Australia')) {
      setCurrency('AUD');
    }
    // NGN remains default for unrecognized locales
  }, []);

  const changeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const getPricing = () => {
    const currencyInfo = currencies.find(c => c.code === currency)!;
    const rate = exchangeRates[currency];
    
    const basicMonthly = currency === 'NGN' ? basePricing.basicMonthly : Math.round(basePricing.basicMonthly * rate * 100) / 100;
    const basicAnnual = currency === 'NGN' ? basePricing.basicAnnual : Math.round(basePricing.basicAnnual * rate * 100) / 100;
    const premiumMonthly = currency === 'NGN' ? basePricing.premiumMonthly : Math.round(basePricing.premiumMonthly * rate * 100) / 100;
    const premiumAnnual = currency === 'NGN' ? basePricing.premiumAnnual : Math.round(basePricing.premiumAnnual * rate * 100) / 100;
    
    const basicAnnualPerMonth = basicAnnual / 12;
    const premiumAnnualPerMonth = premiumAnnual / 12;
    const basicSavings = (basePricing.basicMonthly * 12) - basePricing.basicAnnual;
    const premiumSavings = (basePricing.premiumMonthly * 12) - basePricing.premiumAnnual;

    return {
      basic: {
        monthly: {
          amount: basicMonthly,
          formatted: formatPrice(basePricing.basicMonthly, currency, currencyInfo.symbol),
        },
        annual: {
          amount: basicAnnual,
          formatted: formatPrice(basePricing.basicAnnual, currency, currencyInfo.symbol),
          perMonth: formatPrice(basePricing.basicAnnual / 12, currency, currencyInfo.symbol),
          savings: currency === 'NGN' 
            ? `₦${basicSavings.toLocaleString()}`
            : formatPrice(basicSavings, currency, currencyInfo.symbol),
        },
      },
      premium: {
        monthly: {
          amount: premiumMonthly,
          formatted: formatPrice(basePricing.premiumMonthly, currency, currencyInfo.symbol),
        },
        annual: {
          amount: premiumAnnual,
          formatted: formatPrice(basePricing.premiumAnnual, currency, currencyInfo.symbol),
          perMonth: formatPrice(basePricing.premiumAnnual / 12, currency, currencyInfo.symbol),
          savings: currency === 'NGN'
            ? `₦${premiumSavings.toLocaleString()}`
            : formatPrice(premiumSavings, currency, currencyInfo.symbol),
        },
      },
      // Legacy format for backwards compatibility
      monthly: {
        amount: basicMonthly,
        formatted: formatPrice(basePricing.basicMonthly, currency, currencyInfo.symbol),
      },
      annual: {
        amount: basicAnnual,
        formatted: formatPrice(basePricing.basicAnnual, currency, currencyInfo.symbol),
        perMonth: formatPrice(basePricing.basicAnnual / 12, currency, currencyInfo.symbol),
        savings: `${Math.round((1 - basePricing.basicAnnual / (basePricing.basicMonthly * 12)) * 100)}%`,
      },
      symbol: currencyInfo.symbol,
      code: currency,
      isNigeria: currency === 'NGN',
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
