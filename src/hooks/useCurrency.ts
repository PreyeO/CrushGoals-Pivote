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

// Simplified pricing: one plan - monthly and yearly (yearly = 11 months)
interface PricingTier {
  monthly: number;
  annual: number; // 11 months worth (one month free)
}

const pricingByCurrency: Record<Currency, PricingTier> = {
  NGN: {
    monthly: 1500,
    annual: 16500, // ₦1,500 × 11 = ₦16,500
  },
  USD: {
    monthly: 3,
    annual: 33, // $3 × 11 = $33
  },
  GBP: {
    monthly: 2.50,
    annual: 27.50, // £2.50 × 11 = £27.50
  },
  EUR: {
    monthly: 2.80,
    annual: 30.80, // €2.80 × 11 = €30.80
  },
  CAD: {
    monthly: 4,
    annual: 44, // C$4 × 11 = C$44
  },
  AUD: {
    monthly: 4.50,
    annual: 49.50, // A$4.50 × 11 = A$49.50
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
    
    const monthlyAmount = prices.monthly;
    const annualAmount = prices.annual;
    
    // Savings = 1 month free
    const savings = monthlyAmount;

    return {
      monthly: {
        amount: monthlyAmount,
        formatted: formatPrice(monthlyAmount, currency, currencyInfo.symbol),
      },
      annual: {
        amount: annualAmount,
        formatted: formatPrice(annualAmount, currency, currencyInfo.symbol),
        perMonth: formatPrice(annualAmount / 12, currency, currencyInfo.symbol),
        savings: formatPrice(savings, currency, currencyInfo.symbol),
        savingsText: '1 month free',
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
