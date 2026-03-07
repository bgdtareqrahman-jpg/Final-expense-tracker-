import { useMemo, useState } from 'react';
import { Building2, Globe, TrendingUp, Search } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface BankAccountsDetailsProps {
  transactions: Transaction[];
}

export function BankAccountsDetails({ transactions }: BankAccountsDetailsProps) {
  // Calculate bank balances based on savings categories
  const bankBalances = useMemo(() => {
    const savings = transactions.filter(t => t.type === 'savings');
    const balances = savings.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(balances)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3); // Top 3 banks
  }, [transactions]);

  const getBankIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('abroad') || lower.includes('international') || lower.includes('foreign') || lower.includes('usd') || lower.includes('tng') || lower.includes('malaysia')) {
      return Globe;
    }
    return Building2;
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Bank Accounts Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Bank Accounts
          </h3>
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors group">
            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
          </button>
        </div>
        <div className="grid gap-2">
          {bankBalances.length > 0 ? (
            bankBalances.map(([bankName, balance]) => {
              const Icon = getBankIcon(bankName);
              const isUSD = bankName.toLowerCase().includes('usd') || bankName.toLowerCase().includes('tng') || bankName.toLowerCase().includes('malaysia');
              
              return (
                <div key={bankName} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 hover:bg-black/30 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-xs">{bankName}</p>
                      <p className="text-[10px] text-gray-400">
                        {getBankIcon(bankName) === Globe ? 'International' : 'Local (BD)'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(balance, isUSD ? '$ ' : '৳ ')}</p>
                    <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" />
                      Active
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State / Placeholders
            <>
              <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 opacity-60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">Bank 1 (BD)</p>
                    <p className="text-[10px] text-gray-400">Local</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">$0.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 opacity-60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">Bank 2 (BD)</p>
                    <p className="text-[10px] text-gray-400">Local</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">$0.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 opacity-60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">Bank 3 (Int)</p>
                    <p className="text-[10px] text-gray-400">International</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">$0.00</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
