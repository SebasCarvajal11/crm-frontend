"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

const dialogSizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-[calc(100vw-2rem)]",
} as const

export type DialogSize = keyof typeof dialogSizeMap

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
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

function DialogContent({
  className,
  children,
  size = "lg",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: DialogSize
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex flex-col",
          "w-[calc(100%-2rem)] sm:w-full",
          "max-h-[min(90dvh,calc(100dvh-2.5rem))] min-w-0",
          "-translate-x-1/2 -translate-y-1/2",
          "overflow-hidden rounded-2xl",
          "border border-border/80 bg-card p-0 text-card-foreground antialiased",
          "shadow-2xl shadow-black/25 ring-1 ring-border/50",
          "duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98]",
          "sm:data-open:slide-in-from-bottom-2",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
          "sm:data-closed:slide-out-to-bottom-2 outline-none",
          dialogSizeMap[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-10",
              "flex size-8 items-center justify-center rounded-full",
              "bg-muted/70 text-muted-foreground transition-all duration-150",
              "hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "cursor-pointer"
            )}
            aria-label="Cerrar"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 px-5 pb-4 pt-5 pr-14 sm:px-6 sm:pt-6",
        "border-b border-border/50 bg-muted/20 shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DialogMedia({
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
      data-slot="dialog-media"
      className={cn(
        "inline-flex size-10 sm:size-11 shrink-0 items-center justify-center",
        "rounded-xl ring-1 shadow-2xs transition-transform duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2.5 px-5 py-3.5 sm:px-6 sm:flex-row sm:justify-end",
        "border-t border-border/50 bg-muted/25 dark:bg-muted/15 rounded-b-2xl shrink-0",
        "pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base sm:text-lg font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-xs sm:text-sm text-muted-foreground/90 leading-relaxed", className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 space-y-4 text-xs sm:text-sm scrollbar-thin",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogMedia,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
