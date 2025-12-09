import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency, Currency, currencies } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  className?: string;
}

export function CurrencySelector({ className }: CurrencySelectorProps) {
  const { currency, changeCurrency, currentCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
      >
        <span>{currentCurrency.flag}</span>
        <span>{currentCurrency.code}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-48 bg-card border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  changeCurrency(curr.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left",
                  currency === curr.code && "bg-primary/20 text-primary"
                )}
              >
                <span className="text-lg">{curr.flag}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{curr.code}</p>
                  <p className="text-xs text-muted-foreground">{curr.name}</p>
                </div>
                {currency === curr.code && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
