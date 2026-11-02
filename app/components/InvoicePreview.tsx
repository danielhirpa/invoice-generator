// app/components/InvoicePreview.tsx
'use client';

export default function InvoicePreview({ invoiceData }: any) {
  // Calculate total sum of items
  const totalAmount = invoiceData.items.reduce(
    (sum: number, item: any) => sum + (item.quantity * item.price), 
    0
  );

  // Trigger browser print/save as PDF dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons (Hidden when printing via CSS) */}
      <div className="flex justify-end gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors shadow"
        >
          🖨️ Print / Download PDF
        </button>
      </div>

      {/* The Printable Invoice Sheet */}
      <div className="bg-white text-slate-900 p-8 rounded-lg shadow-xl min-h-[480px] flex flex-col justify-between print:shadow-none print:p-0">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h3 className="text-2xl font-bold tracking-wide text-slate-800">INVOICE</h3>
              <p className="text-xs text-slate-500 mt-1">{invoiceData.invoiceNumber || 'INV-001'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Due Date</p>
              <p className="font-medium text-sm text-slate-800">{invoiceData.dueDate || 'Select Date'}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billed To:</p>
            <p className="font-semibold text-lg text-slate-800 mt-1">
              {invoiceData.clientName || <span className="text-slate-400 italic">Client Name</span>}
            </p>
          </div>

          {/* Items Table */}
          <table className="w-full text-left mb-6 text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoiceData.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="py-2 text-slate-800">{item.description || 'Item description'}</td>
                  <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-600">${item.price}</td>
                  <td className="py-2 text-right font-medium text-slate-800">${item.quantity * item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grand Total Footer */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700">Total Due:</span>
            <span className="text-2xl font-extrabold text-emerald-600">${totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}