"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner" // ⬅️ usar sonner

interface CertificateUploadProps {
  leaveRequestId: string
  currentCertificateUrl?: string
  onUploadSuccess?: (url: string | null) => void // ⬅️ permitir null
}

export function CertificateUpload({ 
  leaveRequestId, 
  currentCertificateUrl, 
  onUploadSuccess 
}: CertificateUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const acceptedTypes = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  }

  const maxSize = 5 * 1024 * 1024 // 5MB

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return "El archivo no debe superar los 5MB"
    }

    const isValidType = Object.keys(acceptedTypes).includes(file.type)
    if (!isValidType) {
      return "Solo se permiten archivos PDF, JPG, PNG o WebP"
    }

    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Generar nombre único para el archivo
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${leaveRequestId}_${Date.now()}.${fileExt}`

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Subir archivo a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('licencias')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      setUploadProgress(100)

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('licencias')
        .getPublicUrl(uploadData.path)

      // Actualizar la solicitud de licencia con la URL del certificado
      const { error: updateError } = await supabase
        .from('leave_requests')
        .update({ certificate_url: publicUrl })
        .eq('id', leaveRequestId)

      if (updateError) throw updateError

      toast.success("Certificado subido", {
        description: "El certificado se ha almacenado correctamente.",
      })

      onUploadSuccess?.(publicUrl)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error: any) {
      console.error('Error uploading file:', error)
      const message = error?.message || 'Error al subir el archivo'
      setError(message)
      toast.error("Error al subir certificado", {
        description: message,
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeCertificate = async () => {
    if (!currentCertificateUrl) return

    try {
      // Extraer el path del archivo de la URL pública
      const url = new URL(currentCertificateUrl)
      // Si tu URL pública es del tipo:
      // https://<project>.supabase.co/storage/v1/object/public/licencias/<PATH>
      // entonces todo lo que sigue a "licencias/" es el path real:
      const parts = url.pathname.split("/licencias/")
      const filePath = parts[1] ?? "" // <employeeId>/<licenciaId>_<timestamp>.<ext>

      const { error: deleteError } = await supabase.storage
        .from('licencias')
        .remove([filePath])

      if (deleteError) throw deleteError

      const { error: updateError } = await supabase
        .from('leave_requests')
        .update({ certificate_url: null })
        .eq('id', leaveRequestId)

      if (updateError) throw updateError

      toast.success("Certificado eliminado", {
        description: "El certificado se ha eliminado correctamente.",
      })

      onUploadSuccess?.(null)

    } catch (error: any) {
      console.error('Error removing certificate:', error)
      toast.error("Error al eliminar certificado", {
        description: error?.message || 'Ha ocurrido un error inesperado.',
      })
    }
  }

  return (
    <div className="space-y-4">
      {currentCertificateUrl ? (
        <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">Certificado subido</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentCertificateUrl, '_blank')}
            >
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeCertificate}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate">Subir Certificado</Label>
            <Input
              ref={fileInputRef}
              id="certificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Formatos permitidos: PDF, JPG, PNG, WebP (máximo 5MB)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedFile && (
            <div className="flex items-center space-x-2 p-3 bg-secondary/20 rounded-lg">
              <File className="h-4 w-4" />
              <span className="text-sm flex-1">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Subiendo... {uploadProgress}%
              </p>
            </div>
          )}

          <Button
            onClick={uploadFile}
            disabled={!selectedFile || uploading}
            className="w-full cyber-glow"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Subiendo...' : 'Subir Certificado'}
          </Button>
        </div>
      )}
    </div>
  )
}
