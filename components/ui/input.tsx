import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full font-mono text-sm transition-all duration-300 ease-out placeholder:text-stellar-light/40 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none",
  {
    variants: {
      variant: {
        // Default glass input with cyber glow on focus
        default: 
          "glass-card border-stellar-surface/50 bg-stellar-dark/60 text-white focus:border-cyber-500 focus:cyber-glow focus:bg-stellar-dark/80",
        
        // Outline style with subtle background
        outline:
          "border border-stellar-surface/30 bg-stellar-void/20 backdrop-blur-sm text-stellar-light focus:border-cyber-500/70 focus:bg-stellar-dark/40",
        
        // Matrix theme input
        matrix:
          "glass-card border-matrix-500/30 bg-stellar-dark/60 text-white focus:border-matrix-500 focus:matrix-glow focus:bg-stellar-dark/80",
        
        // Minimal borderless input
        ghost:
          "border-0 bg-transparent text-stellar-light focus:bg-stellar-dark/30 focus:ring-2 focus:ring-cyber-500/50",
        
        // Search input with special styling
        search:
          "glass-panel border-stellar-surface/30 text-white focus:border-cyber-500/70 focus:cyber-glow pl-10",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-4 py-2 rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-2xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, icon, suffix, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stellar-light/60 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size }),
            icon && "pl-10",
            suffix && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stellar-light/60 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Enhanced input components
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string; error?: string; description?: string }
>(({ className, label, error, description, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {label && (
      <label className="text-sm font-medium text-stellar-light tracking-wide">
        {label}
      </label>
    )}
    {children}
    {description && !error && (
      <p className="text-xs text-stellar-light/60">
        {description}
      </p>
    )}
    {error && (
      <p className="text-xs text-status-critical font-medium">
        {error}
      </p>
    )}
  </div>
))
InputGroup.displayName = "InputGroup"

const NumericInput = React.forwardRef<HTMLInputElement, InputProps & {
  min?: number
  max?: number
  step?: number
  unit?: string
}>(({ unit, className, ...props }, ref) => (
  <Input
    {...props}
    type="number"
    className={cn("font-mono", className)}
    suffix={unit ? <span className="text-xs text-stellar-light/60">{unit}</span> : undefined}
    ref={ref}
  />
))
NumericInput.displayName = "NumericInput"

export { Input, InputGroup, NumericInput, inputVariants }
