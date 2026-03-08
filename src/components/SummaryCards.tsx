import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  totalLoan: number;
  currentBalance: number;
}

export function SummaryCards({ totalIncome, totalExpense, totalLoan, currentBalance }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5 h-full">
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-lg border border-emerald-500/20 p-1.5 rounded-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all flex flex-col justify-center min-h-[50px]">
        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="absolute top-1.5 left-1.5 z-10 text-emerald-400 font-medium text-[9px] uppercase tracking-wider">Income</p>
        <div className="relative z-10 flex items-baseline">
          <span className="text-[10px] text-emerald-400/70 mr-0.5">৳</span>
          <h3 className="text-base sm:text-lg font-bold text-white truncate leading-tight">{formatAmount(totalIncome)}</h3>
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 backdrop-blur-lg border border-rose-500/20 p-1.5 rounded-lg relative overflow-hidden group hover:border-rose-500/30 transition-all flex flex-col justify-center min-h-[50px]">
        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingDown className="w-6 h-6 text-rose-400" />
        </div>
        <p className="absolute top-1.5 left-1.5 z-10 text-rose-400 font-medium text-[9px] uppercase tracking-wider">Expense</p>
        <div className="relative z-10 flex items-baseline">
          <span className="text-[10px] text-rose-400/70 mr-0.5">৳</span>
          <h3 className="text-base sm:text-lg font-bold text-white truncate leading-tight">{formatAmount(totalExpense)}</h3>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 backdrop-blur-lg border border-amber-500/20 p-1.5 rounded-lg relative overflow-hidden group hover:border-amber-500/30 transition-all flex flex-col justify-center min-h-[50px]">
        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
          <CreditCard className="w-6 h-6 text-amber-400" />
        </div>
        <p className="absolute top-1.5 left-1.5 z-10 text-amber-400 font-medium text-[9px] uppercase tracking-wider">Total Loan Paid</p>
        <div className="relative z-10 flex items-baseline">
          <span className="text-[10px] text-amber-400/70 mr-0.5">৳</span>
          <h3 className="text-base sm:text-lg font-bold text-white truncate leading-tight">{formatAmount(totalLoan)}</h3>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 backdrop-blur-lg border border-indigo-500/20 p-1.5 rounded-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col justify-center min-h-[50px]">
        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="absolute top-1.5 left-1.5 z-10 text-indigo-400 font-medium text-[9px] uppercase tracking-wider">Current Balance</p>
        <div className="relative z-10 flex items-baseline">
          <span className={`text-[10px] mr-0.5 ${currentBalance < 0 ? 'text-rose-500/70' : 'text-emerald-500/70'}`}>৳</span>
          <h3 className={`text-base sm:text-lg font-bold truncate leading-tight ${currentBalance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatAmount(currentBalance)}</h3>
        </div>
      </div>
    </div>
  );
}
