// app/layout.tsx
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">
        <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">InvoiceGen</h1>
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-blue-400 font-medium transition-colors">
              Create Invoice
            </Link>
            <Link href="/invoices" className="hover:text-blue-400 font-medium transition-colors">
              Saved Invoices
            </Link>
          </nav>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
