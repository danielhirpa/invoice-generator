'use client';

import { useState, useEffect, useRef } from 'react';
import { InvoiceData, LineItem, InvoiceStatus } from '@/types/invoice';
import { Plus, Trash2, Download, Printer, Database, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Home() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: 'INV-2026-001',
    issueDate: '',
    dueDate: '',
    status: 'Unpaid',
    senderName: 'Daniel Hirpa',
    senderEmail: 'daniel@example.com',
    senderAddress: 'Addis Ababa, Ethiopia',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    clientAddress: '123 Tech Avenue, Suite 400',
    items: [
      { id: '1', description: 'Next.js Frontend Development', quantity: 20, rate: 30 },
      { id: '2', description: 'Django REST API Integration', quantity: 10, rate: 25 },
    ],
    taxRate: 10,
    notes: 'Thank you for your business! Payment is due within 14 days.',
  });

  // Saved Invoices from Django Backend Database
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Populate dates safely on client-side mount to prevent SSR mismatch
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setInvoice((prev) => ({
      ...prev,
      issueDate: today,
      dueDate: twoWeeksLater,
    }));

    // Fetch saved invoices on mount
    fetchInvoices();
  }, []);

  // Fetch all invoices from Django REST API
  const fetchInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const response = await fetch('http://localhost:8000/api/invoices/');
      if (response.ok) {
        const data = await response.json();
        setSavedInvoices(data);
      } else {
        console.error('Failed to fetch invoices from Django');
      }
    } catch (err) {
      console.error('Network error fetching invoices:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // Handle Field Updates
  const updateField = (field: keyof InvoiceData, value: any) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  // Line Item Handlers
  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Service',
      quantity: 1,
      rate: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Dynamic Financial Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  // Save to Django Backend Database
  const saveToDatabase = async () => {
    setIsSaving(true);
    
    const payload = {
      invoice_number: invoice.invoiceNumber,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate,
      status: invoice.status,
      sender_name: invoice.senderName,
      sender_email: invoice.senderEmail,
      sender_address: invoice.senderAddress,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      client_address: invoice.clientAddress,
      tax_rate: invoice.taxRate,
      notes: invoice.notes,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate)
      }))
    };

    try {
      const response = await fetch('http://localhost:8000/api/invoices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Invoice ${data.invoice_number} successfully saved to Django database!`);
        fetchInvoices(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Validation Error:', errorData);
        alert('Failed to save invoice. Check browser console for details.');
      }
    } catch (err) {
      console.error('Network Error:', err);
      alert('Could not connect to Django backend. Make sure python manage.py runserver is active on port 8000.');
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Export Function
  const exportToPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      setIsGenerating(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber || 'Invoice'}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Freelance Invoice Generator</h1>
          <p className="text-xs text-zinc-400 mt-1">Full-stack Next.js & Django portfolio project.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={saveToDatabase}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Database size={14} /> {isSaving ? 'Saving...' : 'Save to DB'}
          </button>
          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-zinc-700"
          >
            <Printer size={14} /> Print
          </button>
          <button 
            type="button"
            onClick={exportToPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download size={14} /> {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: EDITOR FORM & SAVED LIST */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-6">
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase border-b border-zinc-800 pb-3">Invoice Details</h2>

            {/* Invoice ID, Status, Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Status</label>
                <select
                  value={invoice.status}
                  onChange={(e) => updateField('status', e.target.value as InvoiceStatus)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={invoice.taxRate}
                  onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => updateField('issueDate', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Freelancer & Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase">Your Info (Sender)</h3>
                <input
                  type="text"
                  placeholder="Your Name / Business"
                  value={invoice.senderName}
                  onChange={(e) => updateField('senderName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={invoice.senderEmail}
                  onChange={(e) => updateField('senderEmail', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none"
                />
                <textarea
                  placeholder="Your Address"
                  value={invoice.senderAddress}
                  onChange={(e) => updateField('senderAddress', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none h-16 resize-none"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase">Client Info (Billed To)</h3>
                <input
                  type="text"
                  placeholder="Client Name / Company"
                  value={invoice.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={invoice.clientEmail}
                  onChange={(e) => updateField('clientEmail', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none"
                />
                <textarea
                  placeholder="Client Address"
                  value={invoice.clientAddress}
                  onChange={(e) => updateField('clientAddress', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none h-16 resize-none"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase">Itemized Services</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              {invoice.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <input
                    type="text"
                    placeholder="Service Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="col-span-6 bg-transparent text-xs text-white focus:outline-none px-2 py-1"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="col-span-2 bg-zinc-900 border border-zinc-800 text-xs text-center text-white rounded px-1 py-1 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="col-span-3 bg-zinc-900 border border-zinc-800 text-xs text-center text-white rounded px-1 py-1 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="col-span-1 text-zinc-500 hover:text-red-400 flex justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SAVED INVOICES LIST FROM DATABASE */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Saved Invoices (Database)</h2>
              <button
                type="button"
                onClick={fetchInvoices}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCw size={12} className={isLoadingInvoices ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {savedInvoices.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No saved invoices found in the database yet.</p>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {savedInvoices.map((inv) => (
                  <div key={inv.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">{inv.invoice_number}</span>
                      <span className="text-[11px] text-zinc-400">Client: {inv.client_name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        inv.status === 'Overdue' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                      <span className="text-xs font-mono font-semibold text-zinc-300 block mt-1">
                        Due: {inv.due_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE DYNAMIC INVOICE PREVIEW */}
        <div 
          ref={invoiceRef}
          className="bg-white text-zinc-900 p-8 rounded-xl shadow-2xl min-h-[650px] flex flex-col justify-between font-sans"
        >
          <div>
            {/* Header / Invoice Metadata */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">{invoice.senderName || 'Your Name'}</h2>
                <p className="text-xs text-zinc-500 whitespace-pre-line mt-1">{invoice.senderAddress}</p>
                <p className="text-xs text-zinc-500">{invoice.senderEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold tracking-tight text-zinc-900 block">INVOICE</span>
                <span className="text-xs font-mono font-semibold text-zinc-500">{invoice.invoiceNumber}</span>
                <div className="mt-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    invoice.status === 'Overdue' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Metadata */}
            <div className="grid grid-cols-2 gap-4 my-6 text-xs">
              <div>
                <span className="text-zinc-400 uppercase font-semibold text-[10px] block mb-1">Billed To</span>
                <p className="font-bold text-zinc-900">{invoice.clientName || 'Client Name'}</p>
                <p className="text-zinc-500 whitespace-pre-line">{invoice.clientAddress}</p>
                <p className="text-zinc-500">{invoice.clientEmail}</p>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-zinc-400 uppercase font-semibold text-[10px]">Issue Date: </span>
                  <span className="font-medium text-zinc-800">{invoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-zinc-400 uppercase font-semibold text-[10px]">Due Date: </span>
                  <span className="font-medium text-zinc-800">{invoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left my-6 text-xs">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-400 uppercase text-[10px]">
                  <th className="py-2 font-semibold">Service Description</th>
                  <th className="py-2 text-center font-semibold">Qty/Hrs</th>
                  <th className="py-2 text-right font-semibold">Rate</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="text-zinc-800">
                    <td className="py-3 font-medium">{item.description}</td>
                    <td className="py-3 text-center text-zinc-500">{item.quantity}</td>
                    <td className="py-3 text-right text-zinc-500">${item.rate.toFixed(2)}</td>
                    <td className="py-3 text-right font-semibold">${(item.quantity * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Notes */}
          <div className="border-t border-zinc-200 pt-4 mt-6">
            <div className="flex justify-between items-start">
              <div className="max-w-[250px]">
                <span className="text-zinc-400 uppercase font-semibold text-[10px] block">Notes / Terms</span>
                <p className="text-[11px] text-zinc-500 mt-1">{invoice.notes}</p>
              </div>

              <div className="text-right space-y-1.5 text-xs min-w-[160px]">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal:</span>
                  <span className="font-medium text-zinc-800">${subtotal.toFixed(2)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium text-zinc-800">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2">
                  <span>Total Due:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}