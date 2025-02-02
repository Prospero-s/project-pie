import * as React from "react"
import { Tooltip as RechartsTooltip } from "recharts"

const ChartContainer = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`h-[350px] w-full ${className}`} {...props} />
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef((props, ref) => (
  <RechartsTooltip
    ref={ref}
    wrapperStyle={{ outline: "none" }}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef(({ active, payload, hideLabel }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div
      ref={ref}
      className="rounded-lg border bg-background p-2 shadow-sm"
    >
      {!hideLabel && (
        <div className="grid grid-cols-2 gap-2">
          <span className="font-medium">{data.name}:</span>
          <span className="font-medium">{data.value}</span>
        </div>
      )}
      {data.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent } 