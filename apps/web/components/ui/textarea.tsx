import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-gray-400 placeholder:text-gray-400 selection:bg-blue-100 selection:text-blue-900 flex field-sizing-content min-h-16 w-full rounded-lg border bg-white px-3 py-2 text-base shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "hover:border-gray-500",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
