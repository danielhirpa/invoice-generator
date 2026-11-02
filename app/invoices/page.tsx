// app/invoices/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/invoices/')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch invoices from backend.');
        return res.json();
      })
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Saved Invoices</h1>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Create New Invoice
        </Link>
      </div>

      {loading && <p className="text-slate-400">Loading invoices from database...</p>}
      {error && <p className="text-red-400 bg-red-950/50 p-4 rounded-lg border border-red-800">{error}</p>}

      {!loading && !error && invoices.length === 0 && (
        <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700">
          <p className="text-slate-400 mb-4">No invoices found in PostgreSQL yet.</p>
          <Link href="/" className="text-blue-400 hover:underline text-sm font-medium">
            Create your first invoice &rarr;
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {invoices.map((inv: any) => (
          <div key={inv.id} className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 flex justify-between items-center shadow-md">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-white">{inv.invoice_number}</h3>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  {inv.items?.length || 0} items
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Client: <span className="text-slate-200 font-medium">{inv.client_name}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Due: {inv.due_date || 'No due date'}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-400">${inv.total_amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}