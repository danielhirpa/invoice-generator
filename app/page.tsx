// app/page.tsx
'use client';

import { useState } from 'react';
import InvoiceForm from '@/app/components/InvoiceForm';
import InvoicePreview from '@/app/components/InvoicePreview';

export default function CreateInvoicePage() {
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    invoiceNumber: 'INV-001',
    dueDate: '',
    items: [
      { description: 'Web Development Services', quantity: 1, price: 1200 }
    ],
  });

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Form Section */}
      <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Invoice Details</h2>
        <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
      </section>

      {/* Live Preview Section */}
      <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Live Preview</h2>
        <InvoicePreview invoiceData={invoiceData} />
      </section>
    </div>
  );
}