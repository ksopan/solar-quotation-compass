
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, ...props }, ref) => {
    // For numeric inputs, ensure we're handling the value correctly
    if (type === 'number') {
      const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          // Allow empty string or valid numbers only
          if (e.target.value === '' || !isNaN(parseFloat(e.target.value))) {
            onChange(e);
          }
        }
      };

      return (
        <input
          type="number"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleNumberChange}
          {...props}
        />
      )
    }
    
    // For inputMode numeric or decimal, still use type="text" but handle numeric input
    if (props.inputMode === 'numeric' || props.inputMode === 'decimal') {
      const handleNumericTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
          const newValue = e.target.value;
          // Allow empty or numeric values with optional decimal point
          if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
            onChange(e);
          }
        }
      };

      return (
        <input
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleNumericTextChange}
          {...props}
        />
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={value}
        onChange={onChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
