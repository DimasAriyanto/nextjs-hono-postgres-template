"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:!text-muted-foreground group-[.success]:!text-green-600/90 group-[.error]:!text-red-600/90 group-[.warning]:!text-yellow-600/90 group-[.info]:!text-blue-600/90",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: '!bg-red-50 dark:!bg-red-950 !text-red-900 dark:!text-red-200 !border-red-200 dark:!border-red-900',
          success: '!bg-green-50 dark:!bg-green-950 !text-green-900 dark:!text-green-200 !border-green-200 dark:!border-green-900',
          warning: '!bg-yellow-50 dark:!bg-yellow-950 !text-yellow-900 dark:!text-yellow-200 !border-yellow-200 dark:!border-yellow-900',
          info: '!bg-blue-50 dark:!bg-blue-950 !text-blue-900 dark:!text-blue-200 !border-blue-200 dark:!border-blue-900',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
