
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onSelectItem, onClear }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="w-full text-left p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition group"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-700 truncate block max-w-[150px]">
                {item.data.description}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
