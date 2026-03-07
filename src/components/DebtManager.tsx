import { useState } from 'react';
import { Plus, Trash2, User, ArrowUpRight, ArrowDownLeft, Phone } from 'lucide-react';
import { Debt, DebtType } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
}

export function DebtManager({ debts, onAddDebt, onDeleteDebt }: DebtManagerProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<DebtType>('receivable'); // Default: Receivable
  const [note, setNote] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newDebt: Debt = {
      id: crypto.randomUUID(),
      type,
      name,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      note,
      phoneNumber: phoneNumber || undefined,
    };

    onAddDebt(newDebt);
    setName('');
    setAmount('');
    setNote('');
    setPhoneNumber('');
  };

  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');

  const totalReceivable = receivables.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayable = payables.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-lg border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownLeft className="w-12 h-12 text-emerald-400" />
          </div>
          <p className="text-emerald-400 font-medium mb-1 text-sm uppercase tracking-wider">Total Receivable</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(totalReceivable)}</h3>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 backdrop-blur-lg border border-rose-500/20 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-12 h-12 text-rose-400" />
          </div>
          <p className="text-rose-400 font-medium mb-1 text-sm uppercase tracking-wider">Total Payable</p>
          <h3 className="text-3xl font-bold text-white">{formatCurrency(totalPayable)}</h3>
        </div>
      </div>

      {/* Add New Debt Form */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" /> Add New Record
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-medium">Type</label>
              <div className="flex bg-black/20 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('receivable')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    type === 'receivable' ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  )}
                >
                  Receivable
                </button>
                <button
                  type="button"
                  onClick={() => setType('payable')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    type === 'payable' ? "bg-rose-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                  )}
                >
                  Payable
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-medium">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Person / Entity Name"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase font-medium">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is this for?"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            Add Record
          </button>
        </form>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Receivables List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/80 uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Receivables (Debtors)
          </h3>
          <div className="space-y-3">
            {receivables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                No receivables found.
              </div>
            ) : (
              receivables.map((debt) => (
                <div key={debt.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{debt.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{format(new Date(debt.date), 'MMM d, yyyy')}</span>
                        {debt.phoneNumber && (
                          <span className="flex items-center gap-1">
                            • <Phone className="w-3 h-3" /> {debt.phoneNumber}
                          </span>
                        )}
                      </div>
                      {debt.note && <p className="text-xs text-gray-500 mt-1">{debt.note}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{formatCurrency(debt.amount)}</p>
                    <button
                      onClick={() => onDeleteDebt(debt.id)}
                      className="mt-2 p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payables List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/80 uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Payables (Creditors)
          </h3>
          <div className="space-y-3">
            {payables.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                No payables found.
              </div>
            ) : (
              payables.map((debt) => (
                <div key={debt.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{debt.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{format(new Date(debt.date), 'MMM d, yyyy')}</span>
                        {debt.phoneNumber && (
                          <span className="flex items-center gap-1">
                            • <Phone className="w-3 h-3" /> {debt.phoneNumber}
                          </span>
                        )}
                      </div>
                      {debt.note && <p className="text-xs text-gray-500 mt-1">{debt.note}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-400">{formatCurrency(debt.amount)}</p>
                    <button
                      onClick={() => onDeleteDebt(debt.id)}
                      className="mt-2 p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
