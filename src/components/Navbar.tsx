import { LayoutDashboard, Users, History, Landmark, User, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface NavbarProps {
  activeTab: 'dashboard' | 'analytics' | 'debts' | 'history' | 'savings' | 'account' | 'documents';
  onTabChange: (tab: 'dashboard' | 'analytics' | 'debts' | 'history' | 'savings' | 'account' | 'documents') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'savings', icon: Landmark, label: 'Savings' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'debts', icon: Users, label: 'Debts' },
    { id: 'documents', icon: FileText, label: 'Documents' },
  ] as const;

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
      <nav className="pointer-events-auto bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-full p-1.5 flex items-center gap-1 mx-4 ring-1 ring-white/5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 py-2.5 rounded-full transition-all duration-300 outline-none",
                isActive ? "text-white pl-4 pr-5" : "text-gray-400 hover:text-white hover:bg-white/5 px-3"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navbar-active"
                  className="absolute inset-0 bg-indigo-600 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className="w-5 h-5 relative z-10" />
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-medium whitespace-nowrap relative z-10"
                >
                  {tab.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
