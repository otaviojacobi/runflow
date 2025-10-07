import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-400 selection:bg-blue-100 selection:text-blue-900 border-gray-400 h-9 w-full min-w-0 rounded-lg bg-white px-3 py-2 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "hover:border-gray-500",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
