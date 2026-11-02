// app/components/InvoiceForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoiceForm({ invoiceData, setInvoiceData }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle line item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = value;
    setInvoiceData((prev: any) => ({ ...prev, items: updatedItems }));
  };

  // Add a new row to items
  const addItem = () => {
    setInvoiceData((prev: any) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }],
    }));
  };

  // Remove a line item
  const removeItem = (index: number) => {
    const updatedItems = invoiceData.items.filter((_: any, i: number) => i !== index);
    setInvoiceData((prev: any) => ({ ...prev, items: updatedItems }));
  };

  // Calculate total amount
  const totalAmount = invoiceData.items.reduce(
    (sum: number, item: any) => sum + (item.quantity * item.price),
    0
  );

  // Submit invoice to Django backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      client_name: invoiceData.clientName,
      invoice_number: invoiceData.invoiceNumber,
      due_date: invoiceData.dueDate && invoiceData.dueDate.trim() !== '' ? invoiceData.dueDate : null,
      total_amount: totalAmount,
      items: invoiceData.items,
    };

    try {
      const response = await fetch('http://localhost:8000/api/invoices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Django Backend Error:", errorData);
        throw new Error(JSON.stringify(errorData));
      }

      // Redirect to saved invoices list on success
      router.push('/invoices');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(typeof err.message === 'string' ? err.message : 'Failed to save invoice to the database.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/40 p-6 rounded-xl border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Invoice Details</h2>

      {errorMessage && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-lg overflow-x-auto">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Invoice Number & Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Invoice Number</label>
          <input
            type="text"
            name="invoiceNumber"
            value={invoiceData.invoiceNumber}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={invoiceData.dueDate}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Client Name */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Client Name</label>
        <input
          type="text"
          name="clientName"
          value={invoiceData.clientName}
          onChange={handleChange}
          placeholder="Enter client or company name"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Line Items */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase text-slate-400">Line Items</label>
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-3">
          {invoiceData.items.map((item: any, index: number) => (
            <div key={index} className="flex gap-2 items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none text-center"
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                className="w-28 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:outline-none text-right"
                required
              />
              {invoiceData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-300 px-2 py-1 text-sm font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50"
      >
        {submitting ? 'Saving to Database...' : 'Save Invoice'}
      </button>
    </form>
  );
}