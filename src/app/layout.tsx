import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '@/components/ToastProvider'
import { QueueProvider } from '@/components/QueueProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DTube Next',
  description: 'A DTube-like frontend on Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <QueueProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">
                  {children}
                </main>
              </div>
            </div>
          </QueueProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
