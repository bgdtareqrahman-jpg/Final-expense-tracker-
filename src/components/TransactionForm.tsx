import { useState, useRef, useEffect } from 'react';
import { Plus, Upload, X, Save } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  categories: {
    income: string[];
    expense: string[];
    loan: string[];
    savings: string[];
  };
  onAddCategory: (type: 'income' | 'expense' | 'loan' | 'savings', category: string) => void;
  initialType?: TransactionType;
}

export function TransactionForm({ 
  onAddTransaction, 
  onUpdateTransaction, 
  editingTransaction, 
  onCancelEdit,
  categories,
  onAddCategory,
  initialType = 'expense'
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [saveCategory, setSaveCategory] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategoryInput(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
      setPhoneNumber(editingTransaction.phoneNumber || '');
      setReceiptImage(editingTransaction.receiptImage || null);
    } else {
      resetForm();
    }
  }, [editingTransaction, categories, initialType]);

  const resetForm = () => {
    setType(initialType);
    setAmount('');
    setCategoryInput('');
    setSaveCategory(false);
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setPhoneNumber('');
    setReceiptImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Update category when type changes if not editing
  useEffect(() => {
    if (!editingTransaction) {
      setCategoryInput('');
    }
  }, [type]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryInput || !date) return;

    const isNewCategory = !(categories[type] || []).includes(categoryInput);

    if (isNewCategory && saveCategory) {
      onAddCategory(type, categoryInput);
    }

    const transactionData: Transaction = {
      id: editingTransaction ? editingTransaction.id : crypto.randomUUID(),
      type,
      amount: parseFloat(amount),
      category: categoryInput,
      date,
      note,
      phoneNumber: phoneNumber || undefined,
      receiptImage: receiptImage || undefined,
    };

    if (editingTransaction) {
      onUpdateTransaction(transactionData);
    } else {
      onAddTransaction(transactionData);
    }
    
    if (!editingTransaction) {
      resetForm();
    }
  };

  const isNewCategory = categoryInput && !categories[type].includes(categoryInput);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          {editingTransaction ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
        <button
          type="button"
          onClick={() => setType('income')}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl transition-all font-medium text-sm whitespace-nowrap",
            type === 'income' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl transition-all font-medium text-sm whitespace-nowrap",
            type === 'expense' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('loan')}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl transition-all font-medium text-sm whitespace-nowrap",
            type === 'loan' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          Loan Pay
        </button>
        <button
          type="button"
          onClick={() => setType('savings')}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl transition-all font-medium text-sm whitespace-nowrap",
            type === 'savings' ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          Savings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase font-medium">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase font-medium">Category</label>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              list="category-list"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Type or select category"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
            <datalist id="category-list">
              {(categories[type] || []).map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            
            {isNewCategory && (
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700"
                />
                Save this category for future use
              </label>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase font-medium">Phone (Optional)</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase font-medium">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was this for?"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-24"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase font-medium">Receipt / Voucher</label>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            id="receipt-upload"
          />
          
          {!receiptImage ? (
            <label
              htmlFor="receipt-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all group"
            >
              <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-sm">Click to upload image</span>
              </div>
            </label>
          ) : (
            <div className="relative w-full h-32 rounded-xl overflow-hidden group border border-white/20">
              <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setReceiptImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-rose-500 rounded-full text-white transition-colors backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={cn(
            "flex-1 py-4 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-[0.98]",
            editingTransaction ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
          )}
        >
          {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
