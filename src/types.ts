export type TransactionType = 'income' | 'expense' | 'loan' | 'savings';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  phoneNumber?: string;
  receiptImage?: string; // Base64 string
}

export type DebtType = 'payable' | 'receivable'; // payable = I owe, receivable = They owe

export interface Debt {
  id: string;
  type: DebtType;
  name: string;
  amount: number;
  date: string;
  note?: string;
  phoneNumber?: string;
}

export interface UserProfile {
  name: string;
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  category?: 'receipt' | 'document';
  data: string; // Base64 string
  date: string;
}

export interface ManualBank {
  id: string;
  name: string;
  amount: number;
}
