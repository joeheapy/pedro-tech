import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/navbar'
import { ClerkProvider } from '@clerk/nextjs'
import ReactQueryClientProvider from '@/components/react-query-client-provider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Service Story Maker',
  description: 'A simple tool for people-centred service design with AI.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${montserrat.variable} bg-background text-foreground font-montserrat antialiased`}
        >
          <ThemeProvider>
            <ReactQueryClientProvider>
              <NavBar />
              <main className="pt-16 max-w-7xl mx-auto p-4 min-h-screen">
                {children}
              </main>
            </ReactQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
