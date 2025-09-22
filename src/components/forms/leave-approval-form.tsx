"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/actions/leave-actions"

interface LeaveApprovalFormProps {
  leaveRequestId: string
  approverId: string
  employeeName: string
  leaveType: string
  onSuccess?: () => void
}

export function LeaveApprovalForm({
  leaveRequestId,
  approverId,
  employeeName,
  leaveType,
  onSuccess,
}: LeaveApprovalFormProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    setError("")

    const result = await approveLeaveRequest(leaveRequestId, approverId)

    if (result.success) {
      onSuccess?.()
    } else {
      setError(result.error || "Error al aprobar la solicitud")
    }

    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Por favor proporciona un motivo para el rechazo")
      return
    }

    setLoading(true)
    setError("")

    const result = await rejectLeaveRequest(leaveRequestId, approverId, rejectionReason)

    if (result.success) {
      setRejectDialogOpen(false)
      setRejectionReason("")
      onSuccess?.()
    } else {
      setError(result.error || "Error al rechazar la solicitud")
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

      <div className="flex gap-2">
        <Button onClick={handleApprove} className="flex-1 cyber-glow" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          Aprobar
        </Button>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 cyber-border bg-transparent" disabled={loading}>
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          </DialogTrigger>
          <DialogContent className="cyber-border border-primary/20">
            <DialogHeader>
              <DialogTitle>Rechazar Solicitud de Licencia</DialogTitle>
              <DialogDescription>
                Estás a punto de rechazar la solicitud de {leaveType} de {employeeName}. Por favor proporciona un
                motivo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Motivo del Rechazo *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="cyber-border"
                  rows={4}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="cyber-border bg-transparent"
              >
                Cancelar
              </Button>
              <Button onClick={handleReject} variant="destructive" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Rechazar Solicitud
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}