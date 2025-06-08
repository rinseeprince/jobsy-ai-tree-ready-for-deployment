"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [value, onValueChange],
    )

    return (
      <div ref={ref} className={cn("", className)} data-value={currentValue} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Check the component type and pass appropriate props
            if (child.type === TabsTrigger) {
              return React.cloneElement(
                child as React.ReactElement<{ value?: string; onValueChange?: (value: string) => void }>,
                {
                  value: currentValue,
                  onValueChange: handleValueChange,
                },
              )
            } else if (child.type === TabsContent) {
              return React.cloneElement(child as React.ReactElement<{ currentValue?: string }>, {
                currentValue,
              })
            } else if (child.type === TabsList) {
              // TabsList doesn't need currentValue, just pass it through with its own props
              return React.cloneElement(
                child as React.ReactElement<{ value?: string; onValueChange?: (value: string) => void }>,
                {
                  value: currentValue,
                  onValueChange: handleValueChange,
                },
              )
            }
            // For any other components, just return them as-is
            return child
          }
          return child
        })}
      </div>
    )
  },
)
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, value: _value, onValueChange: _onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  onValueChange?: (value: string) => void
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onValueChange, children, disabled, ...restProps }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      onClick={() => onValueChange?.(value)}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </button>
  ),
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  currentValue?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, currentValue, children, ...props }, ref) => {
    if (currentValue !== value) return null

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
