'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/libs/currency';
import { cn } from '@/libs/utils';

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Input field yang otomatis memformat nilai ke Rupiah saat diketik.
 * Menyimpan raw number ke form state, menampilkan "Rp X.XXX.XXX" ke user.
 */
const formatThousands = (digits: string): string => {
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(digits, 10));
};

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [rawInput, setRawInput] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setRawInput(value > 0 ? String(value) : '');
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setRawInput(digits);
    onChange(digits ? parseInt(digits, 10) : 0);
  };

  // Posisikan cursor ke akhir setelah format berubah saat mengetik
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [rawInput, isFocused]);

  const displayValue = isFocused
    ? formatThousands(rawInput)
    : value > 0
      ? formatCurrency(value)
      : '';

  return (
    <Input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      className={cn(className)}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={props.placeholder ?? 'Rp 0'}
    />
  );
}
