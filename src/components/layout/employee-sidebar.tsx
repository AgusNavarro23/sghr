"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, DollarSign, User, Settings, LogOut, Menu, X, Shield } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { name: "Mis Licencias", href: "/employee/leaves", icon: Calendar },
  { name: "Recibos de Sueldo", href: "/employee/payroll", icon: DollarSign },
  { name: "Mi Perfil", href: "/employee/profile", icon: User },
  { name: "Configuración", href: "/employee/settings", icon: Settings },
]

export function EmployeeSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border cyber-glow">
          <SidebarContent pathname={pathname} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border cyber-glow">
          <SidebarContent pathname={pathname} onLogout={handleLogout} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 cyber-glow"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </>
  )
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
}: {
  pathname: string
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary cyber-text" />
          <span className="text-xl font-bold cyber-text">CyberHR</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground cyber-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
              onClick={onClose}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <Button variant="outline" onClick={onLogout} className="w-full cyber-border bg-transparent">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}