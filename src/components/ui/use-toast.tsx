"use client"

import * as React from "react"

type ToastVariant = "default" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void
  toasts: Toast[]
  remove: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, ...t }])

    // Autodestruir a los 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((toast) => toast.id !== id))

  return (
    <ToastContext.Provider value={{ toast, toasts, remove }}>
      {children}
      <ToastViewport toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  remove,
}: {
  toasts: Toast[]
  remove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md border p-4 shadow-lg max-w-sm bg-background ${
            t.variant === "destructive"
              ? "border-red-500 text-red-500"
              : "border-primary text-primary"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              {t.title && <p className="font-bold">{t.title}</p>}
              {t.description && (
                <p className="text-sm text-muted-foreground">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
