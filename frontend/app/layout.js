import './globals.css'

export const metadata = {
  title: 'Auth App',
  description: 'Login and Signup application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}