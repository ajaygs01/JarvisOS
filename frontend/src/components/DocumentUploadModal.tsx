import React, { useState } from 'react';
import { UploadCloud, FileText, X, Check, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDocument: (fileName: string, content: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitDocument,
}) => {
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds 2MB limit.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || text.trim().length === 0) {
        setError('Selected file is empty. Please provide accessible text content.');
        return;
      }
      setContent(text);
    };
    reader.onerror = () => {
      setError('Failed to read file content.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please upload a file or paste document content.');
      return;
    }
    if (content.trim().length < 20) {
      setError('Document content must be at least 20 characters long.');
      return;
    }

    onSubmitDocument(fileName || 'document.txt', content.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="hud-card rounded-2xl max-w-lg w-full p-6 border border-cyber-red/40 shadow-2xl relative glow-red-sm">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#08090E]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-[#090A10] border border-cyber-red/40 text-cyber-red glow-red-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              Document Intelligence Analyzer
            </h3>
            <span className="text-xs text-cyber-gold font-mono">
              Upload .txt, .md, .json, .csv for autonomous summarization
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-cyber-border hover:border-cyber-red/50 rounded-xl p-5 text-center bg-[#08090E]/80 transition-all cursor-pointer relative group">
            <input
              type="file"
              accept=".txt,.md,.json,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileText className="w-8 h-8 text-cyber-red mx-auto mb-2 opacity-80 group-hover:scale-105 transition-transform" />
            <p className="text-xs font-semibold text-white">
              {fileName ? fileName : 'Click to select or drag document here'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Supports Text, Markdown, JSON, and CSV (Max 2MB)
            </p>
          </div>

          {/* Direct Text Paste Option */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Or paste text directly:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw document text here..."
              className="w-full bg-[#08090E] border border-cyber-border focus:border-cyber-red rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyber-red font-mono resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-xs text-cyber-rose bg-cyber-rose/10 border border-cyber-rose/30 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#090A10] border border-cyber-border text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyber-red text-white font-bold text-xs hover:bg-cyber-red/90 disabled:opacity-50 glow-red-sm border border-cyber-red active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Analyze Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
