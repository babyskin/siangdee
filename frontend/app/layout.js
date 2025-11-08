import './globals.css'

export const metadata = {
  title: 'SIANGDEE',
  description: 'French–Lao voice translation app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
