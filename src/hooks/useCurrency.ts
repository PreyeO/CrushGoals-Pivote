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

// Pricing structure per currency
interface PricingTier {
  basicMonthly: number;
  basicAnnual: number;
  premiumMonthly: number;
  premiumAnnual: number;
}

const pricingByCurrency: Record<Currency, PricingTier> = {
  NGN: {
    basicMonthly: 1500,
    basicAnnual: 16000,
    premiumMonthly: 2500,
    premiumAnnual: 25000,
  },
  USD: {
    basicMonthly: 3,
    basicAnnual: 30, // ~$2.50/month - saves $6
    premiumMonthly: 5,
    premiumAnnual: 50, // ~$4.17/month - saves $10
  },
  GBP: {
    basicMonthly: 2.50,
    basicAnnual: 25,
    premiumMonthly: 4,
    premiumAnnual: 40,
  },
  EUR: {
    basicMonthly: 2.80,
    basicAnnual: 28,
    premiumMonthly: 4.50,
    premiumAnnual: 45,
  },
  CAD: {
    basicMonthly: 4,
    basicAnnual: 40,
    premiumMonthly: 6.50,
    premiumAnnual: 65,
  },
  AUD: {
    basicMonthly: 4.50,
    basicAnnual: 45,
    premiumMonthly: 7,
    premiumAnnual: 70,
  },
};

function formatPrice(amount: number, currency: Currency, symbol: string): string {
  if (currency === 'NGN') {
    return `${symbol}${amount.toLocaleString()}`;
  }
  // For other currencies, show 2 decimal places if needed
  return Number.isInteger(amount) 
    ? `${symbol}${amount}` 
    : `${symbol}${amount.toFixed(2)}`;
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
    const prices = pricingByCurrency[currency];
    
    const basicMonthly = prices.basicMonthly;
    const basicAnnual = prices.basicAnnual;
    const premiumMonthly = prices.premiumMonthly;
    const premiumAnnual = prices.premiumAnnual;
    
    // Calculate savings
    const basicSavings = (basicMonthly * 12) - basicAnnual;
    const premiumSavings = (premiumMonthly * 12) - premiumAnnual;

    return {
      basic: {
        monthly: {
          amount: basicMonthly,
          formatted: formatPrice(basicMonthly, currency, currencyInfo.symbol),
        },
        annual: {
          amount: basicAnnual,
          formatted: formatPrice(basicAnnual, currency, currencyInfo.symbol),
          perMonth: formatPrice(basicAnnual / 12, currency, currencyInfo.symbol),
          savings: formatPrice(basicSavings, currency, currencyInfo.symbol),
        },
      },
      premium: {
        monthly: {
          amount: premiumMonthly,
          formatted: formatPrice(premiumMonthly, currency, currencyInfo.symbol),
        },
        annual: {
          amount: premiumAnnual,
          formatted: formatPrice(premiumAnnual, currency, currencyInfo.symbol),
          perMonth: formatPrice(premiumAnnual / 12, currency, currencyInfo.symbol),
          savings: formatPrice(premiumSavings, currency, currencyInfo.symbol),
        },
      },
      // Legacy format for backwards compatibility
      monthly: {
        amount: basicMonthly,
        formatted: formatPrice(basicMonthly, currency, currencyInfo.symbol),
      },
      annual: {
        amount: basicAnnual,
        formatted: formatPrice(basicAnnual, currency, currencyInfo.symbol),
        perMonth: formatPrice(basicAnnual / 12, currency, currencyInfo.symbol),
        savings: `${Math.round((1 - basicAnnual / (basicMonthly * 12)) * 100)}%`,
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
