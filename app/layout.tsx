import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TenantProvider } from "@/lib/tenant-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "MicroFi - Banking Software Platform",
  description: "Software-only financial management platform - We do not process payments",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="system">
          <TenantProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </TenantProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
