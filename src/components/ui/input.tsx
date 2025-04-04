
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Handle numeric input by preventing non-numeric characters
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget;

      if (type === 'number') {
        // For mobile browsers that might not enforce numeric keyboard correctly
        const value = input.value;
        
        // Allow only numbers, decimal point, and negative sign
        const sanitizedValue = value.replace(/[^0-9.-]/g, '');
        
        // If the sanitized value is different from the current value, update the input
        if (value !== sanitizedValue) {
          input.value = sanitizedValue;
        }
        
        // Call the original onChange if it exists
        if (props.onChange) {
          const event = {
            ...e,
            target: {
              ...input,
              value: sanitizedValue
            }
          } as React.ChangeEvent<HTMLInputElement>;
          props.onChange(event);
        }
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
