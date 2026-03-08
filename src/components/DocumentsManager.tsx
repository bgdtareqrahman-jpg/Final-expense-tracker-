import { useState, useRef } from 'react';
import { Document } from '../types';
import { Upload, FileText, Image as ImageIcon, Trash2, X, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface DocumentsManagerProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
}

export function DocumentsManager({ documents, onAddDocument, onDeleteDocument }: DocumentsManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB for localStorage safety, though still risky)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload files smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 'pdf';
      
      const newDoc: Document = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        data: base64String,
        date: new Date().toISOString().split('T')[0],
        category: 'document',
      };

      onAddDocument(newDoc);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white/80 uppercase tracking-wider text-sm">My Documents</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl text-gray-400">
          <div className="p-4 bg-white/5 rounded-full mb-4">
            <FileText className="w-8 h-8 opacity-50" />
          </div>
          <p>No documents uploaded yet</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
            >
              <div 
                className="aspect-square bg-black/20 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedDoc(doc)}
              >
                {doc.type === 'image' ? (
                  <img 
                    src={doc.data} 
                    alt={doc.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <FileText className="w-12 h-12 text-rose-400" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a 
                    href={doc.data} 
                    download={doc.name}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(doc.date), 'dd-MM-yyyy')} • {doc.type.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-10">
                <h3 className="font-medium text-white truncate pr-4">{selectedDoc.name}</h3>
                <div className="flex items-center gap-2">
                  <a 
                    href={selectedDoc.data} 
                    download={selectedDoc.name}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 pt-20 flex items-center justify-center bg-black/50 min-h-[300px]">
                {selectedDoc.type === 'image' ? (
                  <img 
                    src={selectedDoc.data} 
                    alt={selectedDoc.name} 
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" 
                  />
                ) : (
                  <iframe 
                    src={selectedDoc.data} 
                    className="w-full h-[75vh] rounded-lg bg-white"
                    title={selectedDoc.name}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
