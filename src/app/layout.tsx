import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gestión de RRHH - CyberHR',
  description: 'Sistema completo de gestión de recursos humanos con diseño cyberpunk',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster 
          theme="dark"
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
      </body>
    </html>
  )
}