// Single line item in an invoice
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

// Allowed status values for payment tracking
export type InvoiceStatus = 'Unpaid' | 'Paid' | 'Overdue';

// Complete Invoice Data Structure
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  
  // Sender (Freelancer) Details
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  
  // Client Details
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  
  // Items & Financial Breakdown
  items: LineItem[];
  taxRate: number; // Percentage (e.g. 10 for 10%)
  notes: string;
}