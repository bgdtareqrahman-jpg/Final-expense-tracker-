import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Plus, X, ArrowUpRight, ArrowDownLeft, HandCoins, Landmark } from 'lucide-react';
import { Transaction, UserProfile, Debt, TransactionType, Document, ManualBank } from './types';
import { cn } from './lib/utils';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { BankAccountsDetails } from './components/BankAccountsDetails';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { DebtManager } from './components/DebtManager';
import { CategoryManager } from './components/CategoryManager';
import { SavingsDashboard } from './components/SavingsDashboard';
import { DocumentsManager } from './components/DocumentsManager';
import { ExpenseDashboard } from './components/ExpenseDashboard';
import { Account } from './components/Account';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Loan', 'Other'],
  expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'],
  loan: ['Personal Loan', 'Home Loan', 'Car Loan', 'Credit Card', 'Lent to Friend', 'Other'],
  savings: ['Emergency Fund', 'Retirement', 'Vacation', 'New Car', 'House Downpayment', 'Other'],
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse transactions', e);
      return [];
    }
  });

  const [categories, setCategories] = useState<typeof DEFAULT_CATEGORIES>(() => {
    try {
      const saved = localStorage.getItem('categories');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...DEFAULT_CATEGORIES, ...parsed };
    } catch (e) {
      console.error('Failed to parse categories', e);
      return DEFAULT_CATEGORIES;
    }
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    try {
      const saved = localStorage.getItem('debts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse debts', e);
      return [];
    }
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem('documents');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse documents', e);
      return [];
    }
  });

  const [banks, setBanks] = useState<ManualBank[]>(() => {
    try {
      const saved = localStorage.getItem('savings_banks');
      return saved ? JSON.parse(saved) : [
        { id: '1', name: 'Bank 1 (BD)', amount: 0 },
        { id: '2', name: 'Bank 2 (BD)', amount: 0 },
        { id: '3', name: 'Bank 3 (Intl)', amount: 0 }
      ];
    } catch (e) {
      console.error('Failed to parse banks', e);
      return [
        { id: '1', name: 'Bank 1 (BD)', amount: 0 },
        { id: '2', name: 'Bank 2 (BD)', amount: 0 },
        { id: '3', name: 'Bank 3 (Intl)', amount: 0 }
      ];
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : { name: 'Guest' };
    } catch (e) {
      console.error('Failed to parse userProfile', e);
      return { name: 'Guest' };
    }
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'debts' | 'history' | 'savings' | 'account' | 'documents' | 'daily-expenses'>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved as any) || 'dashboard';
  });
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<TransactionType>('expense');

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('savings_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const addCategory = (type: 'income' | 'expense' | 'loan' | 'savings', category: string) => {
    setCategories(prev => {
      const currentList = prev[type];
      if (currentList.includes(category)) return prev;
      
      // Insert before 'Other' if it exists, otherwise append
      const otherIndex = currentList.indexOf('Other');
      let newList;
      if (otherIndex !== -1) {
        newList = [...currentList.slice(0, otherIndex), category, 'Other'];
      } else {
        newList = [...currentList, category];
      }
      
      return {
        ...prev,
        [type]: newList
      };
    });
  };

  const updateCategory = (type: 'income' | 'expense' | 'loan' | 'savings', oldCategory: string, newCategory: string) => {
    setCategories(prev => {
      const list = prev[type];
      const index = list.indexOf(oldCategory);
      if (index === -1) return prev;
      
      const newList = [...list];
      newList[index] = newCategory;
      
      return { ...prev, [type]: newList };
    });
  };

  const deleteCategory = (type: 'income' | 'expense' | 'loan' | 'savings', category: string) => {
    setCategories(prev => {
      const list = prev[type];
      const newList = list.filter(c => c !== category);
      return { ...prev, [type]: newList };
    });
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setIsTransactionModalOpen(false);
    setIsFabOpen(false);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
    setIsTransactionModalOpen(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addDebt = (debt: Debt) => {
    setDebts(prev => [debt, ...prev]);
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const addDocument = (doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const updateDocument = (updatedDoc: Document) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateBanks = (newBanks: ManualBank[]) => {
    setBanks(newBanks);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setInitialTransactionType(transaction.type);
    setIsTransactionModalOpen(true);
  };

  const openAddModal = (type: TransactionType) => {
    setEditingTransaction(null);
    setInitialTransactionType(type);
    setIsTransactionModalOpen(true);
    setIsFabOpen(false);
  };

  const closeTransactionModal = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(false);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      Note: t.note,
      Phone: t.phoneNumber || '',
    })));
    
    const wsDebts = XLSX.utils.json_to_sheet(debts.map(d => ({
      Date: d.date,
      Type: d.type === 'receivable' ? 'Receivable' : 'Payable',
      Name: d.name,
      Amount: d.amount,
      Note: d.note || '',
      Phone: d.phoneNumber || '',
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.utils.book_append_sheet(wb, wsDebts, "Debts");
    XLSX.writeFile(wb, "ExpenseTracker_Data.xlsx");
  };

  const deleteAccount = () => {
    // Clear all data from localStorage
    localStorage.removeItem('transactions');
    localStorage.removeItem('categories');
    localStorage.removeItem('debts');
    localStorage.removeItem('documents');
    localStorage.removeItem('savings_banks');
    localStorage.removeItem('userProfile');

    // Reset state
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setDebts([]);
    setDocuments([]);
    setBanks([
      { id: '1', name: 'Bank 1 (BD)', amount: 0 },
      { id: '2', name: 'Bank 2 (BD)', amount: 0 },
      { id: '3', name: 'Bank 3 (Intl)', amount: 0 }
    ]);
    setUserProfile({ name: 'Guest' });
    setActiveTab('dashboard');
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalLoan = transactions
    .filter(t => t.type === 'loan')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSavings = transactions
    .filter(t => t.type === 'savings')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Balance = Income - Expense - Loan Payments - Savings (if savings are considered outflow from checking)
  // However, usually savings are assets. But if "Balance" means "Cash to Spend", then savings are deducted.
  // Let's assume Balance is "Net Cash Flow" excluding savings transfers?
  // Or maybe Balance = Income - Expense - Loan. Savings is just a separate metric.
  // If I transfer to savings, I still have the money.
  // But if I want to see "Personal Savings" as a separate row, I probably want to see how much I saved.
  // Let's keep Balance as is for now, or maybe deduct savings if the user treats it as an expense.
  // Given the request "add new row in dashboard Personal Savings", I will just display it.
  const currentBalance = totalIncome - totalExpense - totalLoan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans selection:bg-indigo-500/30 flex flex-col relative">
      <TopBar 
        userProfile={userProfile} 
        onUpdateProfile={setUserProfile} 
        onExport={exportToExcel}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onOpenAccount={() => setActiveTab('account')}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pt-20 pb-24">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
            
            {/* Top Left: Summary Stats & Bank Accounts */}
            <section className="space-y-6 flex flex-col">
              <h2 className="text-xl font-semibold text-white/80 uppercase tracking-wider text-sm">Overview</h2>
              <div className="flex-1 space-y-6">
                <SummaryCards 
                  totalIncome={totalIncome} 
                  totalExpense={totalExpense} 
                  totalLoan={totalLoan}
                  currentBalance={currentBalance} 
                />
                <BankAccountsDetails transactions={transactions} />
              </div>
            </section>

            {/* Top Right: Recent Transactions (Full Width on Mobile, Span 2 on Desktop) */}
            <section className="space-y-6 flex flex-col xl:row-span-2">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-4 shadow-xl flex-1 overflow-hidden flex flex-col min-h-[300px]">
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                  <TransactionList 
                    transactions={transactions} 
                    onDelete={deleteTransaction} 
                    onEdit={openEditModal}
                  />
                </div>
              </div>
            </section>

          </div>
        )}

        {activeTab === 'daily-expenses' && (
          <div className="h-full">
            <ExpenseDashboard />
          </div>
        )}

        {activeTab === 'savings' && (
          <div className="h-full">
            <SavingsDashboard 
              transactions={transactions} 
              onDelete={deleteTransaction}
              documents={documents}
              onAddDocument={addDocument}
              onUpdateDocument={updateDocument}
              onDeleteDocument={deleteDocument}
              banks={banks}
              onUpdateBanks={updateBanks}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full">
            <section className="space-y-6 flex flex-col h-full">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                  <TransactionList 
                    transactions={transactions} 
                    onDelete={deleteTransaction} 
                    onEdit={openEditModal}
                  />
                </div>
              </div>
            </section>
          </div>
        )}



        {activeTab === 'debts' && (
          <div className="h-full">
            <section className="space-y-6 flex flex-col h-full">
              <h2 className="text-xl font-semibold text-white/80 uppercase tracking-wider text-sm">Debts Management</h2>
              <div className="flex-1">
                <DebtManager 
                  debts={debts} 
                  onAddDebt={addDebt} 
                  onDeleteDebt={deleteDebt} 
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="h-full">
            <DocumentsManager 
              documents={documents.filter(d => d.category !== 'receipt')}
              onAddDocument={addDocument}
              onDeleteDocument={deleteDocument}
            />
          </div>
        )}

        {activeTab === 'account' && (
          <div className="h-full">
            <Account 
              userProfile={userProfile} 
              onUpdateProfile={setUserProfile} 
              onExport={exportToExcel} 
              onDeleteAccount={deleteAccount}
            />
          </div>
        )}
      </main>

      <Navbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Speed Dial FAB - Only show on Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="fixed bottom-24 right-8 z-40 flex flex-col items-end gap-3">
          <AnimatePresence>
            {isFabOpen && (
              <>
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => openAddModal('savings')}
                  className="flex items-center gap-2 pr-4 pl-2 py-2 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-400 group"
                >
                  <div className="p-2 bg-white/20 rounded-full">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Savings</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => openAddModal('loan')}
                  className="flex items-center gap-2 pr-4 pl-2 py-2 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-400 group"
                >
                  <div className="p-2 bg-white/20 rounded-full">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Loan</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => openAddModal('expense')}
                  className="flex items-center gap-2 pr-4 pl-2 py-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-400 group"
                >
                  <div className="p-2 bg-white/20 rounded-full">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Expense</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  onClick={() => openAddModal('income')}
                  className="flex items-center gap-2 pr-4 pl-2 py-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-400 group"
                >
                  <div className="p-2 bg-white/20 rounded-full">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Income</span>
                </motion.button>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={cn(
              "p-4 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95",
              isFabOpen ? "bg-slate-700 rotate-45" : "bg-indigo-600 shadow-indigo-600/40"
            )}
            aria-label="Add Transaction"
          >
            <Plus className="w-8 h-8 transition-transform duration-300" />
          </button>
        </div>
      )}

      {/* Transaction Modal */}
      <AnimatePresence>
        {isTransactionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeTransactionModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-[0_0_60px_-15px_rgba(255,255,255,0.1)] relative max-h-[90vh] overflow-y-auto custom-scrollbar ring-1 ring-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10 rounded-[2.5rem] pointer-events-none" />
              
              <button
                onClick={closeTransactionModal}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mt-2 relative z-10">
                <TransactionForm 
                  onAddTransaction={addTransaction} 
                  onUpdateTransaction={updateTransaction}
                  editingTransaction={editingTransaction}
                  onCancelEdit={closeTransactionModal}
                  categories={categories}
                  onAddCategory={addCategory}
                  initialType={initialTransactionType}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {isCategoryManagerOpen && (
          <CategoryManager 
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onClose={() => setIsCategoryManagerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
