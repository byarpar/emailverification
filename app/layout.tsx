import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { SdkInitializer } from '@/components/SdkInitializer'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MyApp',
  description: 'A simple authentication app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
          {children}
          <SdkInitializer />
        </UserProvider>
      </body>
    </html>
  )
}

