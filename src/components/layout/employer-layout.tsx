import type React from "react"
import { EmployerSidebar } from "./employer-sidebar"

interface EmployerLayoutProps {
  children: React.ReactNode
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <EmployerSidebar />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
