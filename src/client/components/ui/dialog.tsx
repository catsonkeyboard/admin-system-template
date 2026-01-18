import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/client/utils/cn"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-lg border bg-card text-card-foreground shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}

interface DialogTitleProps {
  children: React.ReactNode
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h2 className="text-xl font-semibold leading-none tracking-tight">{children}</h2>
}

interface DialogDescriptionProps {
  children: React.ReactNode
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

interface DialogFooterProps {
  children: React.ReactNode
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return <div className="flex items-center p-6 pt-0">{children}</div>
}

const DialogClose: React.FC<React.HTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
)

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
}
