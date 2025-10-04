import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      variant: {
        default: "",
        danger: "",
        success: "",
        warning: "",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  showValue?: boolean
  unit?: string
  label?: string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant, size, showValue = false, unit = "", label, ...props }, ref) => {
  const currentValue = props.value?.[0] ?? props.defaultValue?.[0] ?? 0
  
  // Get variant-specific colors
  const getVariantColors = (variant: string | null | undefined) => {
    switch (variant) {
      case 'danger':
        return {
          range: 'bg-gradient-to-r from-status-critical to-red-600',
          thumb: 'border-status-critical hover:border-red-500 bg-status-critical/20',
          glow: 'hover:shadow-lg hover:shadow-status-critical/30'
        }
      case 'success':
        return {
          range: 'bg-gradient-to-r from-matrix-500 to-status-normal',
          thumb: 'border-matrix-500 hover:border-status-normal bg-matrix-500/20',
          glow: 'hover:shadow-lg hover:shadow-matrix-500/30'
        }
      case 'warning':
        return {
          range: 'bg-gradient-to-r from-status-caution to-status-warning',
          thumb: 'border-status-warning hover:border-status-warning bg-status-warning/20',
          glow: 'hover:shadow-lg hover:shadow-status-warning/30'
        }
      default:
        return {
          range: 'bg-gradient-to-r from-cyber-500 to-cyber-400',
          thumb: 'border-cyber-500 hover:border-cyber-400 bg-cyber-500/20',
          glow: 'hover:shadow-lg hover:shadow-cyber-500/30'
        }
    }
  }

  const colors = getVariantColors(variant)
  
  // Get size-specific dimensions
  const getSizeDimensions = (size: string | null | undefined) => {
    switch (size) {
      case 'sm':
        return { track: 'h-1', thumb: 'h-4 w-4' }
      case 'lg':
        return { track: 'h-3', thumb: 'h-6 w-6' }
      default:
        return { track: 'h-2', thumb: 'h-5 w-5' }
    }
  }

  const dimensions = getSizeDimensions(size)

  return (
    <div className="space-y-3">
      {/* Label and value display */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-stellar-light tracking-wide">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-mono text-cyber-400 bg-stellar-dark/50 px-2 py-1 rounded-lg">
              {currentValue}{unit}
            </span>
          )}
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn(sliderVariants({ variant, size }), className)}
        {...props}
      >
        <SliderPrimitive.Track 
          className={cn(
            "relative w-full grow overflow-hidden rounded-full bg-stellar-dark border border-stellar-surface/30",
            dimensions.track
          )}
        >
          <SliderPrimitive.Range 
            className={cn("absolute h-full transition-all duration-300", colors.range)} 
          />
        </SliderPrimitive.Track>
        
        <SliderPrimitive.Thumb 
          className={cn(
            "block rounded-full border-2 bg-stellar-void transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stellar-void disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
            dimensions.thumb,
            colors.thumb,
            colors.glow
          )} 
        />
      </SliderPrimitive.Root>
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

// Enhanced slider for ranges
const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps & { labels?: [string, string] }
>(({ labels, showValue = true, ...props }, ref) => (
  <div className="space-y-3">
    {labels && (
      <div className="flex items-center justify-between text-xs text-stellar-light/60 font-mono">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    )}
    <Slider {...props} showValue={showValue} ref={ref} />
  </div>
))
RangeSlider.displayName = "RangeSlider"

export { Slider, RangeSlider, sliderVariants }
