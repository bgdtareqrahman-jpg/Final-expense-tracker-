import { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoryManagerProps {
  categories: {
    income: string[];
    expense: string[];
    loan: string[];
    savings: string[];
  };
  onAddCategory: (type: 'income' | 'expense' | 'loan' | 'savings', category: string) => void;
  onUpdateCategory: (type: 'income' | 'expense' | 'loan' | 'savings', oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (type: 'income' | 'expense' | 'loan' | 'savings', category: string) => void;
  onClose: () => void;
}

export function CategoryManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory, onClose }: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'loan' | 'savings'>('expense');
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(activeTab, newCategory.trim());
      setNewCategory('');
    }
  };

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };

  const saveEdit = () => {
    if (editingCategory && editValue.trim() && editValue.trim() !== editingCategory) {
      onUpdateCategory(activeTab, editingCategory, editValue.trim());
    }
    setEditingCategory(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">Manage Categories</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {(['income', 'expense', 'loan', 'savings'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl transition-all font-medium text-sm capitalize whitespace-nowrap",
                activeTab === type 
                  ? type === 'income' ? "bg-emerald-500 text-white" 
                    : type === 'expense' ? "bg-rose-500 text-white" 
                    : type === 'loan' ? "bg-amber-500 text-white"
                    : "bg-cyan-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Add New */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={`New ${activeTab} category...`}
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newCategory.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {(categories[activeTab] || []).filter(c => c !== 'Other').map((category) => (
            <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
              {editingCategory === category ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 bg-black/40 border border-indigo-500/50 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <button onClick={saveEdit} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-white">{category}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(activeTab, category)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {(categories[activeTab] || []).length <= 1 && (
             <p className="text-center text-gray-500 text-sm py-4">No custom categories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
