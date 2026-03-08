import { useState } from 'react';
import { Trash2, TrendingUp, TrendingDown, Image as ImageIcon, Edit2, CreditCard, Search, Landmark, X } from 'lucide-react';
import { Transaction } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm)
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp className="w-4 h-4" />;
      case 'expense': return <TrendingDown className="w-4 h-4" />;
      case 'loan': return <CreditCard className="w-4 h-4" />;
      case 'savings': return <Landmark className="w-4 h-4" />;
      default: return <TrendingDown className="w-4 h-4" />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'income': return "bg-emerald-500/20 text-emerald-400";
      case 'expense': return "bg-rose-500/20 text-rose-400";
      case 'loan': return "bg-amber-500/20 text-amber-400";
      case 'savings': return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income': return "text-emerald-400";
      case 'expense': return "text-rose-400";
      case 'loan': return "text-amber-400";
      case 'savings': return "text-cyan-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search Toggle */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          Transactions History
        </h3>
        <button 
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (isSearchOpen) setSearchTerm('');
          }}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors group"
        >
          {isSearchOpen ? (
            <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
          ) : (
            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
          )}
        </button>
      </div>

      {/* Search / History Bar */}
      {isSearchOpen && (
        <div className="sticky top-0 z-10 pb-4 mb-4 animate-in fade-in slide-in-from-top-2">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-20"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-lg flex items-center px-4 py-2 ring-1 ring-white/20">
              <Search className="w-4 h-4 text-indigo-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder-gray-500"
                autoFocus
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-2 p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
          <p className="text-xs">{searchTerm ? 'No transactions found.' : 'No transactions yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="group relative flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", getColorClass(transaction.type))}>
                  {getIcon(transaction.type)}
                </div>
                <div>
                  <h3 className="text-xs font-medium text-white">{transaction.category}</h3>
                  <p className="text-[10px] text-gray-400">{format(new Date(transaction.date), 'dd-MM-yyyy')} • {transaction.note}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className={cn("text-xs font-semibold", getAmountColor(transaction.type))}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  {transaction.phoneNumber && <p className="text-[9px] text-gray-500">{transaction.phoneNumber}</p>}
                </div>
                
                {transaction.receiptImage && (
                  <div className="relative group/image">
                    <ImageIcon className="w-4 h-4 text-gray-400 group-hover/image:text-white transition-colors cursor-pointer" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover/image:block z-50 w-32 h-32 rounded-lg overflow-hidden border border-white/20 shadow-xl">
                      <img src={transaction.receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-all"
                    title="Edit transaction"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
