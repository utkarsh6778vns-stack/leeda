import React from 'react';
import { Search, Globe2 } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-slate-400">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative bg-slate-800 p-6 rounded-full border border-slate-700">
          <Globe2 size={48} className="text-blue-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">Ready to Find Leads?</h3>
      <p className="max-w-md mx-auto text-slate-400">
        Enter a business category and city above to unleash the power of AI search. We'll find contact details, emails, and websites for you.
      </p>
    </div>
  );
};

export default EmptyState;
