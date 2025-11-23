import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause' },
    { key: '→', action: 'Next Track' },
    { key: '←', action: 'Previous Track' },
    { key: 'M', action: 'Mute / Unmute' },
    { key: 'Esc', action: 'Close Modals' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-cyan-400" /> Keyboard Shortcuts
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-800 last:border-0 group">
              <span className="text-slate-300 group-hover:text-white transition-colors">{s.action}</span>
              <kbd className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-400 font-mono text-sm border border-slate-700 min-w-[3rem] text-center shadow-sm group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};