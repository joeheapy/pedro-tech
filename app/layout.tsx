import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/Navbar'
import { ClerkProvider } from '@clerk/nextjs'
import ReactQueryClientProvider from '@/components/ReactQueryClientProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import Footer from '@/components/Footer'

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
      <html lang="en" className="h-full">
        <body
          className={`${montserrat.variable} bg-backgound text-foreground font-montserrat antialiased flex flex-col min-h-screen`}
        >
          <ThemeProvider>
            <ReactQueryClientProvider>
              <div className="flex flex-col min-h-screen">
                <NavBar />
                <main className="pt-16 max-w-7xl mx-auto p-4 w-full flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </ReactQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
