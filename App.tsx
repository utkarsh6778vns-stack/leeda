import React, { useState, useCallback, useEffect } from 'react';
import { LayoutGrid, MapPin, Search, Loader2, Sparkles, Download, AlertCircle } from 'lucide-react';
import AutocompleteInput from './components/AutocompleteInput';
import LeadCard from './components/LeadCard';
import EmptyState from './components/EmptyState';
import { POPULAR_CATEGORIES, POPULAR_CITIES } from './constants';
import { generateLeads } from './services/geminiService';
import { Lead, GroundingSource } from './types';

const LOADING_MESSAGES = [
  "Scouring the web for businesses...",
  "Analyzing websites for contact info...",
  "Extracting email addresses...",
  "Verifying phone numbers...",
  "Compiling your lead list..."
];

const App: React.FC = () => {
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = useCallback(async () => {
    if (!category.trim() || !city.trim()) {
      setError("Please fill in both category and city fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setLeads([]);
    setSources([]);

    try {
      const result = await generateLeads(category, city);
      
      if (result.leads.length === 0) {
        setError("No leads found. Please try a different category or broader location.");
      } else {
        setLeads(result.leads);
        setSources(result.sources);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, city]);

  const handleExport = () => {
    if (leads.length === 0) return;
    
    // Properly escape CSV fields
    const escapeCsv = (field: string) => {
      if (!field) return '""';
      return `"${field.replace(/"/g, '""')}"`;
    };

    const headers = ["Name", "Website", "Phone", "Email", "Address", "Description"];
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        escapeCsv(lead.name),
        escapeCsv(lead.website),
        escapeCsv(lead.phone),
        escapeCsv(lead.email),
        escapeCsv(lead.address),
        escapeCsv(lead.description || '')
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${category.replace(/\s+/g, '_')}_${city.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 pb-20 font-sans">
      
      {/* Header / Hero */}
      <header className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800/50 bg-slate-950 relative z-40">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="space-y-4">
             <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 mb-2">
                <Sparkles size={12} className="mr-1.5" />
                <span>Powered by Gemini 2.5 AI</span>
             </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
              Leeds<span className="text-blue-500">AI</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Instantly discover business contacts, emails, and website URLs for any industry in any city.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-2xl shadow-blue-900/10 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5 relative z-20">
                  <AutocompleteInput
                    label="Business Category"
                    placeholder="e.g. Plumbers, Digital Marketing"
                    value={category}
                    onChange={setCategory}
                    suggestions={POPULAR_CATEGORIES}
                    icon={<LayoutGrid size={18} />}
                  />
                </div>
                <div className="md:col-span-5 relative z-10">
                   <AutocompleteInput
                    label="City / Location"
                    placeholder="e.g. Austin, TX"
                    value={city}
                    onChange={setCity}
                    suggestions={POPULAR_CITIES}
                    icon={<MapPin size={18} />}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full h-[46px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Search size={20} className="mr-2" />
                        Find
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {loading && (
              <div className="mt-4 text-center animate-pulse">
                <p className="text-sm text-blue-300 font-medium">{LOADING_MESSAGES[loadingMsgIndex]}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
             <AlertCircle size={20} className="mr-3 text-red-400" />
             {error}
          </div>
        )}

        {!loading && leads.length === 0 && !error && <EmptyState />}

        {leads.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                Found {leads.length} Leads
                <span className="ml-3 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-normal border border-slate-700">
                  {category} in {city}
                </span>
              </h2>
              <button 
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors shadow-sm"
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads.map((lead, index) => (
                <LeadCard key={index} lead={lead} index={index} />
              ))}
            </div>

            {/* Grounding Sources */}
            {sources.length > 0 && (
              <div className="mt-16 pt-8 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Information Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {sources.slice(0, 10).map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-blue-400 px-3 py-1.5 rounded-full border border-slate-800 transition-colors truncate max-w-[200px]"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;