import React, { useState } from 'react';
import { Globe, Phone, Mail, MapPin, ExternalLink, Building2, Copy, Check } from 'lucide-react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  index: number;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, index }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    if (!text || text === 'N/A') return;
    
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-900/10 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex-shrink-0 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Building2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg text-slate-100 leading-tight truncate" title={lead.name}>{lead.name}</h3>
            {lead.description && (
               <p className="text-xs text-slate-400 mt-1 line-clamp-1" title={lead.description}>{lead.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-grow">
        <div className="flex items-center text-sm text-slate-300 group/item">
          <div className="w-8 flex-shrink-0 flex items-center justify-center">
             <MapPin size={16} className="text-slate-500 group-hover/item:text-blue-400 transition-colors" />
          </div>
          <span className="truncate" title={lead.address}>{lead.address}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300 group/item h-6">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 flex-shrink-0 flex items-center justify-center">
               <Phone size={16} className="text-slate-500 group-hover/item:text-green-400 transition-colors" />
            </div>
            <span className="truncate">{lead.phone}</span>
          </div>
          {lead.phone && lead.phone !== 'N/A' && (
            <button 
              onClick={() => copyToClipboard(lead.phone, 'phone')}
              className="ml-2 p-1 hover:bg-slate-700 rounded-md transition-colors text-slate-500 hover:text-slate-200"
              title="Copy phone number"
            >
              {copiedPhone ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300 group/item h-6">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 flex-shrink-0 flex items-center justify-center">
               <Mail size={16} className="text-slate-500 group-hover/item:text-purple-400 transition-colors" />
            </div>
            <span className="truncate select-all">{lead.email}</span>
          </div>
          {lead.email && lead.email !== 'N/A' && (
            <button 
              onClick={() => copyToClipboard(lead.email, 'email')}
              className="ml-2 p-1 hover:bg-slate-700 rounded-md transition-colors text-slate-500 hover:text-slate-200"
              title="Copy email address"
            >
              {copiedEmail ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        {lead.website && lead.website !== 'N/A' ? (
          <a 
            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Visit Website <ExternalLink size={14} className="ml-1.5" />
          </a>
        ) : (
          <span className="text-sm text-slate-500 italic">No website available</span>
        )}
      </div>
    </div>
  );
};

export default LeadCard;