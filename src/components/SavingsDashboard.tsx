import { useState, useEffect, useRef } from 'react';
import { Landmark, TrendingUp, Calendar, Building2, Globe, Pencil, Check, X, Plus, Upload, FileText, Eye, Trash2, Download, Share2, MessageCircle, Mail, Edit2, ArrowRightLeft, Calculator } from 'lucide-react';
import { Transaction, Document, ManualBank } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SavingsDashboardProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onUpdateDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  banks: ManualBank[];
  onUpdateBanks: (banks: ManualBank[]) => void;
}

export function SavingsDashboard({ 
  transactions, 
  onDelete, 
  documents, 
  onAddDocument, 
  onUpdateDocument, 
  onDeleteDocument,
  banks,
  onUpdateBanks
}: SavingsDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'receipt' | 'document'>('receipt');
  
  // Document Editing State
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editDocName, setEditDocName] = useState('');

  // Currency Conversion State
  const [showBDT, setShowBDT] = useState<Record<string, boolean>>({});
  const MYR_TO_BDT = 28.5;

  // Convert & Add Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertBankId, setConvertBankId] = useState<string>('');
  const [convertAmount, setConvertAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('28.5');
  const [sourceCurrency, setSourceCurrency] = useState<'MYR' | 'BDT'>('BDT');

  // Helper to identify foreign banks
  const isForeignBank = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('malaysia') || 
           lower.includes('tng') || 
           lower.includes('intl') || 
           lower.includes('usd') || 
           lower.includes('foreign') || 
           lower.includes('abroad') ||
           lower.includes('cimb') ||
           lower.includes('maybank') ||
           lower.includes('wise') ||
           lower.includes('euro') ||
           lower.includes('gbp') ||
           lower.includes('global') ||
           lower.includes('dollar');
  };

  const openConvertModal = (bankId: string) => {
    setConvertBankId(bankId);
    setConvertAmount('');
    setExchangeRate('28.5');
    setSourceCurrency('BDT');
    setIsConvertModalOpen(true);
  };

  const handleConvertAndAdd = () => {
    const amount = parseFloat(convertAmount);
    const rate = parseFloat(exchangeRate);
    
    if (isNaN(amount) || amount <= 0) return;
    if (sourceCurrency === 'BDT' && (isNaN(rate) || rate <= 0)) return;

    // If source is Bank Currency (MYR/USD/etc), we add directly (1:1).
    // If source is BDT, we divide by rate to get Bank Currency.
    const convertedAmount = sourceCurrency === 'MYR' ? amount : amount / rate;

    const newBanks = banks.map(bank => {
      if (bank.id === convertBankId) {
        return { ...bank, amount: bank.amount + convertedAmount };
      }
      return bank;
    });

    onUpdateBanks(newBanks);
    setIsConvertModalOpen(false);
  };

  useEffect(() => {
    if (selectedDoc) {
      setEditDocName(selectedDoc.name);
      setIsEditingDoc(false);
    }
  }, [selectedDoc]);

  const handleUploadClick = (category: 'receipt' | 'document') => {
    setUploadCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input to allow selecting the same file
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload files smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const base64String = reader.result as string;
        const type = file.type.startsWith('image/') ? 'image' : 'pdf';
        
        const newDoc: Document = {
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          name: file.name,
          type,
          category: uploadCategory,
          data: base64String,
          date: new Date().toISOString().split('T')[0],
        };

        onAddDocument(newDoc);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      console.error("File reading error");
      setIsUploading(false);
      alert("Error reading file.");
    };

    reader.readAsDataURL(file);
  };

  const handleDocNameSave = () => {
    if (selectedDoc && editDocName.trim()) {
      const updatedDoc = { ...selectedDoc, name: editDocName.trim() };
      onUpdateDocument(updatedDoc);
      setSelectedDoc(updatedDoc);
      setIsEditingDoc(false);
    }
  };

  const handleShare = async (platform: 'whatsapp' | 'email' | 'native') => {
    if (!selectedDoc) return;

    if (platform === 'native') {
      if (navigator.share) {
        try {
          // Convert base64 to blob
          const res = await fetch(selectedDoc.data);
          const blob = await res.blob();
          const file = new File([blob], selectedDoc.name, { type: selectedDoc.type === 'image' ? 'image/png' : 'application/pdf' });

          await navigator.share({
            title: selectedDoc.name,
            text: 'Check out this document',
            files: [file]
          });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        // Fallback to clipboard or alert
        alert('Web Share API not supported on this browser. Use the download button instead.');
      }
    } else if (platform === 'whatsapp') {
       window.open(`https://wa.me/?text=Check out this document: ${selectedDoc.name}`, '_blank');
    } else if (platform === 'email') {
       window.open(`mailto:?subject=${encodeURIComponent(selectedDoc.name)}&body=Check out this document.`, '_blank');
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Add Funds Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addBankId, setAddBankId] = useState<string>('');
  const [addAmount, setAddAmount] = useState('');

  // Calculate total from manual banks
  const totalSavings = banks.reduce((acc, curr) => {
    if (isForeignBank(curr.name)) {
      return acc + (curr.amount * MYR_TO_BDT);
    }
    return acc + curr.amount;
  }, 0);

  const handleEditStart = (bank: ManualBank) => {
    setEditingId(bank.id);
    setEditName(bank.name);
    setEditAmount(bank.amount.toString());
  };

  const handleEditSave = () => {
    if (!editingId) return;
    
    const newBanks = banks.map(bank => {
      if (bank.id === editingId) {
        return {
          ...bank,
          name: editName,
          amount: parseFloat(editAmount) || 0
        };
      }
      return bank;
    });
    
    onUpdateBanks(newBanks);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const openAddModal = () => {
    setAddBankId(banks[0]?.id || '1');
    setAddAmount('');
    setIsAddModalOpen(true);
  };

  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newBanks = banks.map(bank => {
      if (bank.id === addBankId) {
        return { ...bank, amount: bank.amount + amount };
      }
      return bank;
    });

    onUpdateBanks(newBanks);
    setIsAddModalOpen(false);
  };

  const getBankIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('abroad') || lower.includes('international') || lower.includes('foreign') || lower.includes('usd') || lower.includes('intl') || lower.includes('tng') || lower.includes('malaysia')) {
      return Globe;
    }
    return Building2;
  };

  return (
    <div className="space-y-8 h-full relative">
      {/* Header Section */}
      <div className="w-full">
        {/* Total Savings Card */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 backdrop-blur-lg border border-cyan-500/20 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark className="w-32 h-32 text-cyan-400" />
          </div>
          
          <div className="relative z-10 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-cyan-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3 h-3" /> Total Savings
              </h2>
            </div>
            <h1 className="text-3xl font-bold text-white mb-0.5">{formatCurrency(totalSavings)}</h1>
            <p className="text-gray-400 max-w-md text-[10px]">
              Your financial fortress across all accounts.
            </p>
          </div>

          {/* Right corner color accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Bank Accounts Rows (Editable) */}
          <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
            {banks.map((bank, index) => {
              const Icon = getBankIcon(bank.name);
              const isEditing = editingId === bank.id;
              const isForeign = isForeignBank(bank.name);
              const isUSD = bank.name.toLowerCase().includes('usd');
              
              return (
                <div 
                  key={bank.id} 
                  className={cn(
                    "flex flex-col justify-between p-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-xl border border-white/5 transition-all relative group min-h-[70px]",
                    index === 2 ? "col-span-2" : ""
                  )}
                >
                  {isEditing ? (
                    <div className="flex flex-col h-full justify-between gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-cyan-500"
                        placeholder="Bank Name"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-lg font-bold text-cyan-300 w-full focus:outline-none focus:border-cyan-500"
                        placeholder="Amount"
                      />
                      <div className="flex gap-2 mt-1">
                        <button onClick={handleEditSave} className="flex-1 p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleEditCancel} className="flex-1 p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-white font-medium truncate text-xs" title={bank.name}>{bank.name}</span>
                      </div>
                      
                      {isForeign ? (
                        <div className="flex flex-col w-full">
                          <span className="text-cyan-300 font-bold text-base tracking-tight">
                            {formatCurrency(bank.amount, 'RM ')}
                          </span>
                          <div className="flex justify-end mt-1">
                            <span className="text-emerald-400 font-bold text-xs tracking-tight flex items-center gap-1 bg-emerald-900/40 px-2 py-1 rounded-md border border-emerald-500/30 shadow-sm backdrop-blur-sm">
                              <ArrowRightLeft className="w-3 h-3" />
                              {formatCurrency(bank.amount * MYR_TO_BDT, '৳ ')}
                              <span className="text-[9px] opacity-80 font-normal ml-0.5">BDT</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-cyan-300 font-bold text-base tracking-tight">
                          {formatCurrency(bank.amount, isUSD ? '$ ' : '৳ ')}
                        </span>
                      )}
                      
                      <div className="absolute top-1 right-1 flex gap-1">
                        {isForeign && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openConvertModal(bank.id);
                            }}
                            className="p-1.5 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all"
                            title="Convert & Add Funds"
                          >
                            <Calculator className="w-3 h-3" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditStart(bank)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Large Add Button at top right */}
          <button 
            onClick={openAddModal}
            className="absolute top-0 right-0 p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-bl-[2rem] rounded-tr-3xl shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all z-20 group"
            title="Add Funds"
          >
            <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Accounts Book Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-white/80 font-medium text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Accounts Book
            </h3>
            <button
              onClick={() => handleUploadClick('receipt')}
              disabled={isUploading}
              className="text-xs bg-white/10 hover:bg-white/20 text-cyan-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isUploading && uploadCategory === 'receipt' ? 'Uploading...' : <><Upload className="w-3 h-3" /> Upload</>}
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
            {/* Document Cards */}
            {documents.filter(doc => doc.category === 'receipt' || !doc.category).map((doc) => (
              <div 
                key={doc.id}
                className="flex-shrink-0 w-28 h-28 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl relative group overflow-hidden"
              >
                <div 
                  className="w-full h-full flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedDoc(doc)}
                >
                  {doc.type === 'image' ? (
                    <img 
                      src={doc.data} 
                      alt={doc.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-rose-400" />
                  )}
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-[10px] text-white text-center truncate w-full px-1">{doc.name}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 rounded-full text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full bg-black flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  {isEditingDoc ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editDocName}
                        onChange={(e) => setEditDocName(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                        autoFocus
                      />
                      <button 
                        onClick={handleDocNameSave}
                        className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsEditingDoc(false)}
                        className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate text-lg shadow-black drop-shadow-md">{selectedDoc.name}</h3>
                      <button 
                        onClick={() => setIsEditingDoc(true)}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare('native')}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this document?')) {
                        onDeleteDocument(selectedDoc.id);
                        setSelectedDoc(null);
                      }
                    }}
                    className="p-2.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-full transition-all backdrop-blur-md"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center bg-black relative w-full h-full">
                {selectedDoc.type === 'image' ? (
                  <img 
                    src={selectedDoc.data} 
                    alt={selectedDoc.name} 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <iframe 
                    src={selectedDoc.data} 
                    className="w-full h-full bg-white pt-16"
                    title={selectedDoc.name}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Convert & Add Modal */}
      <AnimatePresence>
        {isConvertModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsConvertModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                Convert & Add
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-lg font-mono"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSourceCurrency('MYR')}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-medium transition-all",
                      sourceCurrency === 'MYR'
                        ? "bg-purple-500/20 border-purple-500/50 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    )}
                  >
                    Source: Bank Currency
                    <span className="block text-[10px] opacity-60">Add Directly</span>
                  </button>
                  <button
                    onClick={() => setSourceCurrency('BDT')}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-medium transition-all",
                      sourceCurrency === 'BDT'
                        ? "bg-purple-500/20 border-purple-500/50 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    )}
                  >
                    Source: BDT
                    <span className="block text-[10px] opacity-60">Convert to Bank Currency</span>
                  </button>
                </div>

                {sourceCurrency === 'BDT' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm text-gray-400 mb-2 block">Exchange Rate (BDT per Unit)</label>
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                      placeholder="28.5"
                    />
                  </motion.div>
                )}

                <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Will Add to Bank:</span>
                  <span className="text-lg font-bold text-purple-300">
                    {formatCurrency(
                      sourceCurrency === 'MYR' 
                        ? (parseFloat(convertAmount) || 0)
                        : (parseFloat(convertAmount) || 0) / (parseFloat(exchangeRate) || 1),
                      ' '
                    )}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsConvertModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConvertAndAdd}
                    className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 transition-all"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
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
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Add Funds
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Bank</label>
                  <div className="grid gap-2">
                    {banks.map(bank => (
                      <button
                        key={bank.id}
                        onClick={() => setAddBankId(bank.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          addBankId === bank.id 
                            ? "bg-cyan-500/20 border-cyan-500/50 text-white" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        )}
                      >
                        <span className="font-medium">{bank.name}</span>
                        {addBankId === bank.id && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Amount to Add</label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-lg font-mono"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFunds}
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
