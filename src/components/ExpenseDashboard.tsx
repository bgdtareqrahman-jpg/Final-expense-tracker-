import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Wallet, Calendar, Tag, CreditCard, DollarSign, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '../lib/utils';

// Types
export interface DailyExpense {
  id: string;
  date: string; // ISO string
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Bills & Utilities',
  'Groceries',
  'Personal Care',
  'Education',
  'Travel',
  'Other'
];

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Digital Wallet',
  'Bank Transfer'
];

export function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<DailyExpense[]>(() => {
    const saved = localStorage.getItem('daily_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<DailyExpense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Food & Dining',
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    localStorage.setItem('daily_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    const expense: DailyExpense = {
      id: crypto.randomUUID(),
      date: newExpense.date || new Date().toISOString().split('T')[0],
      description: newExpense.description,
      category: newExpense.category || 'Other',
      amount: Number(newExpense.amount),
      paymentMethod: newExpense.paymentMethod || 'Cash'
    };

    setExpenses(prev => [expense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Food & Dining',
      paymentMethod: 'Cash',
      description: '',
      amount: undefined
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const totalToday = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const totalMonth = expenses
    .filter(e => {
      const expenseDate = parseISO(e.date);
      return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, DailyExpense[]>);

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-500/20 to-orange-500/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Wallet className="w-16 h-16 text-rose-500" />
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">Spent Today</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-rose-300">$</span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalToday.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-rose-300">
            <TrendingUp className="w-3 h-3" />
            <span>Daily Tracker</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Calendar className="w-16 h-16 text-indigo-500" />
          </div>
          <h3 className="text-white/60 text-sm font-medium mb-1">This Month</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-indigo-300">$</span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalMonth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-indigo-300">
            <TrendingDown className="w-3 h-3" />
            <span>{format(today, 'MMMM yyyy')}</span>
          </div>
        </motion.div>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Recent Daily Spends</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Expenses List */}
      <div className="space-y-6">
        {Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((date, index) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <h3 className="text-sm font-medium text-white/50 mb-3 ml-1">
              {isToday(parseISO(date)) ? 'Today' : isYesterday(parseISO(date)) ? 'Yesterday' : format(parseISO(date), 'dd-MM-yyyy')}
            </h3>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              {groupedExpenses[date].map((expense) => (
                <div 
                  key={expense.id}
                  className="group flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white",
                      "bg-gradient-to-br from-gray-700 to-gray-600"
                    )}>
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{expense.description}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-white/10">{expense.category}</span>
                        <span>•</span>
                        <span>{expense.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button 
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {expenses.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No daily spends recorded yet</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-white mb-6">Add Daily Spend</h2>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={newExpense.description || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    placeholder="What did you buy?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <div className="relative">
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-8 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Tag className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment</label>
                    <div className="relative">
                      <select
                        value={newExpense.paymentMethod}
                        onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-8 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        {PAYMENT_METHODS.map(method => (
                          <option key={method} value={method} className="bg-slate-800">{method}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-rose-500/20 mt-4"
                >
                  Add Daily Spend
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
