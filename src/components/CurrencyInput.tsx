"use client";

import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";

const format = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "";
  }
  return new Intl.NumberFormat("id-ID").format(value);
};

const parse = (value: string): number | undefined => {
  const num = Number(value.replace(/[^0-9]/g, ""));
  return isNaN(num) ? undefined : num;
};

export interface CurrencyInputProps
  extends Omit<InputProps, "value" | "onChange"> {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, onBlur, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(format(value));

    React.useEffect(() => {
      setDisplayValue(format(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parse(inputValue);
      setDisplayValue(inputValue);
      if (onValueChange) {
        onValueChange(numericValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const numericValue = parse(e.target.value);
      const formattedValue = format(numericValue);
      setDisplayValue(formattedValue);
      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
          Rp
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="pl-9"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };