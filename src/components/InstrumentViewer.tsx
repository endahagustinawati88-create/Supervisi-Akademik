import React, { useState, useEffect } from 'react';
import { User, InstrumentItem } from '../types';
import { getInstrumentItems, getCategories, Category } from '../data';
import { ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  currentUser: User;
}

export default function InstrumentViewer({ currentUser }: Props) {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localInstruments, setLocalInstruments] = useState<InstrumentItem[]>([]);

  useEffect(() => {
    setLocalCategories(getCategories());
    setLocalInstruments(getInstrumentItems());
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-400" /> 
          Dashbor Indikator Penilaian Supervisi
        </h2>
        
        <div className="space-y-4">
          {localCategories.map(categoryObj => {
            const category = categoryObj.id;
            const itemsInCategory = localInstruments.filter(i => i.category === category);
            if (itemsInCategory.length === 0) return null;
            
            return (
              <div key={category} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-300 border-b border-slate-800">
                  {categoryObj.label}
                </div>
                <div className="divide-y divide-slate-800/50">
                  {itemsInCategory.map((item, index) => (
                    <div key={item.id} className="p-3 flex items-start gap-4 hover:bg-slate-900/30 transition-colors">
                      <span className="text-slate-500 text-sm font-mono mt-0.5">{index + 1}.</span>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ); 
          })}
          
          {localInstruments.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">Belum ada indikator penilaian.</div>
          )}
        </div>
      </div>
    </div>
  );
}
