import { createClient } from "@/lib/supabase/server"
import { EmployerLayout } from "@/components/layout/employer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Bot, Phone, Calendar, TrendingUp, Settings } from "lucide-react"

export default async function WhatsAppManagementPage() {
  const supabase = await createClient()

  // Get WhatsApp conversations
  const { data: conversations } = await supabase
    .from("whatsapp_conversations")
    .select(`
      *,
      leave_requests(
        id,
        status,
        start_date,
        end_date,
        employees(
          users(full_name)
        )
      )
    `)
    .order("processed_at", { ascending: false })
    .limit(50)

  // Get statistics
  const { count: totalConversations } = await supabase
    .from("whatsapp_conversations")
    .select("*", { count: "exact", head: true })

  const { count: leaveRequestsViaWhatsApp } = await supabase
    .from("leave_requests")
    .select("*", { count: "exact", head: true })
    .eq("created_via", "whatsapp")

  const { count: todayMessages } = await supabase
    .from("whatsapp_conversations")
    .select("*", { count: "exact", head: true })
    .gte("processed_at", new Date().toISOString().split("T")[0])

  const getMessageTypeBadge = (type: string) => {
    return type === "incoming" ? (
      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
        Entrante
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
        Saliente
      </Badge>
    )
  }

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
            Pendiente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            Aprobada
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400">
            Rechazada
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <EmployerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold cyber-text">WhatsApp AI Assistant</h1>
            <p className="text-muted-foreground">Gestiona las conversaciones y solicitudes automáticas</p>
          </div>
          <Button className="cyber-glow">
            <Settings className="mr-2 h-4 w-4" />
            Configurar Bot
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversaciones Totales</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{totalConversations || 0}</div>
              <p className="text-xs text-muted-foreground">Mensajes procesados</p>
            </CardContent>
          </Card>

          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Licencias por WhatsApp</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{leaveRequestsViaWhatsApp || 0}</div>
              <p className="text-xs text-muted-foreground">Solicitudes automáticas</p>
            </CardContent>
          </Card>

          <Card className="cyber-border border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold cyber-text">{todayMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Actividad del día</p>
            </CardContent>
          </Card>
        </div>

        {/* Bot Status */}
        <Card className="cyber-border border-primary/20 cyber-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Estado del Bot
            </CardTitle>
            <CardDescription>Configuración y estado del asistente de IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                <div>
                  <p className="font-medium">Estado del Webhook</p>
                  <p className="text-sm text-muted-foreground">Recepción de mensajes</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Activo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                <div>
                  <p className="font-medium">IA de Procesamiento</p>
                  <p className="text-sm text-muted-foreground">Extracción de datos</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Funcionando</Badge>
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium mb-2">Capacidades del Bot:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Procesamiento automático de solicitudes de licencia</li>
                <li>• Extracción inteligente de fechas y tipos de licencia</li>
                <li>• Validación de empleados por número de teléfono</li>
                <li>• Confirmaciones automáticas y seguimiento</li>
                <li>• Soporte multiidioma (español/inglés)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="cyber-border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Conversaciones Recientes
            </CardTitle>
            <CardDescription>Últimas interacciones con el bot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations && conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/20">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{conversation.phone_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(conversation.processed_at).toLocaleString()}
                          </p>
                        </div>
                        {getMessageTypeBadge(conversation.message_type)}
                      </div>
                      <p className="text-sm bg-background/50 p-2 rounded">{conversation.message_text}</p>
                      {conversation.leave_requests && (
                        <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                          <div>
                            <p className="text-sm font-medium">
                              Solicitud de licencia creada - {conversation.leave_requests.employees?.users.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conversation.leave_requests.start_date} al {conversation.leave_requests.end_date}
                            </p>
                          </div>
                          {getLeaveStatusBadge(conversation.leave_requests.status)}
                        </div>
                      )}
                      {conversation.extracted_data && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">Ver datos extraídos por IA</summary>
                          <pre className="mt-2 p-2 bg-background/50 rounded text-xs overflow-auto">
                            {JSON.stringify(conversation.extracted_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay conversaciones</h3>
                  <p className="text-muted-foreground">
                    Las conversaciones de WhatsApp aparecerán aquí cuando los empleados interactúen con el bot.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  )
}