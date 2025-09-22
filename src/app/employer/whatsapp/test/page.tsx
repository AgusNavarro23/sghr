import { EmployerLayout } from "@/components/layout/employer-layout"
import { WhatsAppTestInterface } from "@/components/whatsapp/test-interface"

export default function WhatsAppTestPage() {
  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold cyber-text">Pruebas del Bot de WhatsApp</h1>
          <p className="text-muted-foreground">Interfaz de desarrollo para probar el asistente de IA</p>
        </div>

        <WhatsAppTestInterface />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium mb-2">Variables de Entorno Requeridas:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• WHATSAPP_VERIFY_TOKEN</li>
              <li>• WHATSAPP_ACCESS_TOKEN</li>
              <li>• OPENAI_API_KEY (para IA)</li>
            </ul>
          </div>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="font-medium mb-2">Configuración del Webhook:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• URL: /api/whatsapp/webhook</li>
              <li>• Método: GET (verificación) y POST (mensajes)</li>
              <li>• Campos: messages</li>
            </ul>
          </div>
        </div>
      </div>
    </EmployerLayout>
  )
}
