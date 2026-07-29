import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 transition-all duration-200",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        gradient: "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        glass: "bg-background/80 backdrop-blur-xl border-border/50 hover:bg-background/90 hover:shadow-md transition-all duration-200",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem]",
        lg: "h-10 gap-1.5 px-4 text-base",
        xl: "h-12 gap-2 px-5 text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)]",
        "icon-sm": "size-8 rounded-[min(var(--radius-md),12px)]",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | "gradient" | "glass"
  size?: "default" | "xs" | "sm" | "lg" | "xl" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }