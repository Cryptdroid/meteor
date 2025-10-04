import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "relative overflow-hidden transition-all duration-300 ease-out text-stellar-light",
  {
    variants: {
      variant: {
        // Default glass morphism card
        default: "data-panel",
        
        // Interactive card with hover effects
        interactive: "data-panel interactive-element hover:border-cyber-500/50 hover:cyber-glow cursor-pointer",
        
        // High-tech glass card
        glass: "glass-card rounded-2xl",
        
        // Solid panel for important content
        solid: "bg-stellar-dark border border-stellar-surface rounded-2xl",
        
        // Minimal outline card
        outline: "border border-stellar-surface/30 rounded-2xl bg-stellar-void/50 backdrop-blur-sm",
        
        // Status cards with colored borders
        status: "data-panel border-l-4",
        
        // Holographic effect card
        holo: "data-panel hover:shadow-lg hover:shadow-cyber-500/20 transition-all duration-500",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  statusColor?: 'normal' | 'caution' | 'warning' | 'critical' | 'extreme'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, statusColor, ...props }, ref) => {
    const statusColorClass = statusColor ? {
      'normal': 'border-l-status-normal',
      'caution': 'border-l-status-caution', 
      'warning': 'border-l-status-warning',
      'critical': 'border-l-status-critical',
      'extreme': 'border-l-status-extreme'
    }[statusColor] : ''

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size }),
          variant === 'status' && statusColorClass,
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 mb-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "heading-display text-xl text-white leading-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-stellar-light/80 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mt-6 pt-4 border-t border-stellar-surface/20", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// New components for enhanced functionality
const CardMetric = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'neutral'
    className?: string
  }
>(({ className, label, value, trend, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1", className)}
    {...props}
  >
    <span className="text-xs text-stellar-light/60 uppercase tracking-wider font-mono">
      {label}
    </span>
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-white font-mono">
        {value}
      </span>
      {trend && (
        <span className={cn(
          "text-xs font-semibold",
          trend === 'up' && "text-status-critical",
          trend === 'down' && "text-status-normal", 
          trend === 'neutral' && "text-stellar-light/60"
        )}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </span>
      )}
    </div>
  </div>
))
CardMetric.displayName = "CardMetric"

const CardStatus = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    status: 'normal' | 'caution' | 'warning' | 'critical' | 'extreme'
    label: string
  }
>(({ className, status, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    <div className={cn("status-indicator", `status-${status}`)} />
    <span className="text-sm font-medium text-stellar-light">
      {label}
    </span>
  </div>
))
CardStatus.displayName = "CardStatus"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardMetric,
  CardStatus,
  cardVariants
}
