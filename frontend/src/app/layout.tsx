import type { Metadata } from 'next';

import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { BASE_TITLE, HOME_TITLE } from './constants/title';

export const metadata: Metadata = {
  title: {
    template: `${BASE_TITLE} | %s`,
    default: `${BASE_TITLE} | ${HOME_TITLE}`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
