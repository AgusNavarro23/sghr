"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle, DollarSign, Download, Trash2, Loader2 } from "lucide-react"
import {
  processPayrollRecord,
  markPayrollAsPaid,
  deletePayrollRecord,
  generatePayrollPDF,
} from "@/lib/actions/payroll-actions"

interface PayrollActionsProps {
  payrollId: string
  status: string
  pdfUrl?: string
  onSuccess?: () => void
}

export function PayrollActions({ payrollId, status, pdfUrl, onSuccess }: PayrollActionsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleProcess = async () => {
    setLoading(true)
    setError("")

    const result = await processPayrollRecord(payrollId)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.error || "Error al procesar el recibo")
    }

    setLoading(false)
  }

  const handleMarkAsPaid = async () => {
    setLoading(true)
    setError("")

    const result = await markPayrollAsPaid(payrollId)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.error || "Error al marcar como pagado")
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    setError("")

    const result = await deletePayrollRecord(payrollId)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.error || "Error al eliminar el recibo")
    }

    setLoading(false)
  }

  const handleGeneratePDF = async () => {
    setLoading(true)
    setError("")

    const result = await generatePayrollPDF(payrollId)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.error || "Error al generar el PDF")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 flex-wrap">
        {status === "draft" && (
          <>
            <Button onClick={handleProcess} size="sm" className="cyber-glow" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Procesar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="cyber-border bg-transparent" disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="cyber-border border-primary/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar recibo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El recibo será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cyber-border bg-transparent">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {status === "processed" && (
          <Button onClick={handleMarkAsPaid} size="sm" className="cyber-glow" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
            Marcar como Pagado
          </Button>
        )}

        {(status === "processed" || status === "paid") && (
          <>
            {!pdfUrl && (
              <Button
                onClick={handleGeneratePDF}
                size="sm"
                variant="outline"
                className="cyber-border bg-transparent"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Generar PDF
              </Button>
            )}

            {pdfUrl && (
              <Button asChild size="sm" variant="outline" className="cyber-border bg-transparent">
                <a href={pdfUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </a>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
