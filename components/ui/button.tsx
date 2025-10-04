import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        // Primary cyber button with holographic effect
        default:
          "holo-button bg-cyber-500 text-stellar-void hover:bg-cyber-400 hover:shadow-lg hover:shadow-cyber-500/25 active:bg-cyber-600 rounded-xl font-semibold tracking-wide",
        
        // Matrix-style success button
        success:
          "bg-matrix-500 text-stellar-void hover:bg-matrix-400 border border-matrix-500/30 hover:border-matrix-400 hover:shadow-lg hover:shadow-matrix-500/25 active:bg-matrix-600 rounded-xl font-semibold tracking-wide",
        
        // Destructive/danger button with warning styling
        destructive:
          "bg-status-critical text-white hover:bg-red-600 border border-status-critical/30 hover:border-red-500 hover:shadow-lg hover:shadow-status-critical/25 active:bg-red-700 rounded-xl font-semibold tracking-wide",
        
        // Outline button with subtle glow
        outline:
          "glass-card border-stellar-surface hover:border-cyber-500/50 text-stellar-light hover:text-cyber-400 hover:cyber-glow rounded-xl font-medium",
        
        // Secondary glass button
        secondary:
          "glass-panel border-stellar-dark hover:border-stellar-surface/50 text-stellar-light hover:text-white hover:bg-stellar-dark/80 rounded-xl font-medium",
        
        // Ghost button for subtle interactions
        ghost: 
          "text-stellar-light hover:text-cyber-400 hover:bg-stellar-dark/50 rounded-xl font-medium",
        
        // Link-style button
        link: 
          "text-cyber-500 hover:text-cyber-400 underline-offset-4 hover:underline font-medium",
        
        // High-contrast danger button
        danger:
          "bg-status-extreme text-white hover:bg-purple-600 border border-status-extreme/30 hover:border-purple-500 hover:shadow-lg hover:shadow-status-extreme/25 active:bg-purple-700 rounded-xl font-semibold tracking-wide",
        
        // Neon-style button with intense glow
        neon:
          "bg-gradient-to-r from-cyber-500 to-matrix-500 text-stellar-void hover:from-cyber-400 hover:to-matrix-400 border border-cyber-500/50 hover:border-cyber-400 hover:shadow-xl hover:shadow-cyber-500/40 active:from-cyber-600 active:to-matrix-600 rounded-xl font-bold tracking-wide neon-text cyber-glow",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-6 py-2 text-sm",
        lg: "h-12 px-8 text-base font-semibold",
        xl: "h-14 px-10 text-lg font-bold",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Holographic sweep effect */}
        {(variant === "default" || variant === "success" || variant === "destructive" || variant === "danger") && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Content with loading state */}
        <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
