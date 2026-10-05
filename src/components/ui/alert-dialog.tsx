"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/75 backdrop-blur-md",
        "transition-all duration-250 ease-out",
        "data-open:animate-in data-open:fade-in-0",
        "data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm" | "lg" | "xl"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid",
          "w-[calc(100%-2rem)] sm:w-full",
          "max-h-[min(90dvh,calc(100dvh-2.5rem))] -translate-x-1/2 -translate-y-1/2",
          "gap-4 overflow-y-auto overscroll-contain rounded-2xl",
          "border border-border/80 bg-card p-5 sm:p-6 text-card-foreground antialiased",
          "shadow-2xl shadow-black/25 ring-1 ring-border/50",
          "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none scrollbar-thin",
          "data-[size=sm]:max-w-sm data-[size=default]:max-w-md",
          "data-[size=lg]:max-w-lg data-[size=xl]:max-w-xl",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98]",
          "sm:data-open:slide-in-from-bottom-2",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
          "sm:data-closed:slide-out-to-bottom-2",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex flex-col gap-1.5 text-left",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-3 flex flex-col-reverse gap-2.5",
        "rounded-b-2xl border-t border-border/50 bg-muted/25 dark:bg-muted/15 p-4 sm:p-5",
        "group-data-[size=sm]/alert-dialog-content:grid",
        "group-data-[size=sm]/alert-dialog-content:grid-cols-2",
        "sm:flex-row sm:justify-end pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive" | "warning" | "success" | "info"
}) {
  const variantStyles = {
    default: "bg-primary/10 text-primary ring-primary/20",
    destructive: "bg-destructive/10 text-destructive ring-destructive/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
  }
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-1 inline-flex size-11 items-center justify-center rounded-xl ring-1 shadow-2xs",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-base sm:text-lg font-bold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-xs sm:text-sm text-muted-foreground/90 leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn("text-xs font-semibold shadow-2xs", className)}
        {...props}
      />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn("text-xs font-medium", className)}
        {...props}
      />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
