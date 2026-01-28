
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSymptoms } from './services/geminiService';
import { SymptomData, HealthGuidance, HistoryItem, ViewState } from './types';
import DisclaimerModal from './components/DisclaimerModal';
import HistoryPanel from './components/HistoryPanel';
import SupportContact from './components/SupportContact';
import Footer from './components/Footer';
import FirstAid from './components/FirstAid';
import PrivacyControl from './components/PrivacyControl';
import HowToUse from './components/HowToUse';
import { EMERGENCY_KEYWORDS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('careassist_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [symptoms, setSymptoms] = useState<SymptomData>({
    description: '',
    age: '',
    gender: 'Other',
    duration: '',
    severity: 5
  });
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<HealthGuidance | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('careassist_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('careassist_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const checkForEmergency = (text: string) => {
    const lowerText = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSymptoms(prev => ({ ...prev, [name]: value }));
    if (name === 'description') setShowEmergencyBanner(checkForEmergency(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.description.trim()) return;

    setLoading(true);
    setError(null);
    setGuidance(null);

    try {
      const result = await analyzeSymptoms(symptoms);
      setGuidance(result);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: { ...symptoms },
        guidance: result
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('careassist_history', JSON.stringify(updatedHistory));

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-400";

  const renderContent = () => {
    switch (view) {
      case 'how-to': return <HowToUse />;
      case 'first-aid': return <FirstAid />;
      case 'privacy': return <PrivacyControl />;
      default: return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Symptom Check</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea name="description" rows={4} className={inputClasses} placeholder="Describe your symptoms (e.g., I have a sharp pain in my left knee...)" value={symptoms.description} onChange={handleInputChange} required />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="number" name="age" className={inputClasses} placeholder="Age" value={symptoms.age} onChange={handleInputChange} />
                  <select name="gender" className={inputClasses} value={symptoms.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="text" name="duration" className={inputClasses} placeholder="Duration (e.g. 3 days)" value={symptoms.duration} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Severity: {symptoms.severity}/10</label>
                  <input type="range" name="severity" min="1" max="10" value={symptoms.severity} onChange={handleInputChange} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI Processing...
                    </span>
                  ) : 'Get Guidance'}
                </button>
              </form>
            </section>

            {error && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-5 rounded-2xl text-amber-700 dark:text-amber-400 animate-in fade-in zoom-in duration-300">
                <div className="flex gap-4">
                  <div className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-lg h-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-1">Status Update</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{error}</p>
                    {error.includes("busy") && (
                       <button 
                         onClick={handleSubmit} 
                         className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 underline"
                       >
                         Try Again Now
                       </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={resultsRef} className="space-y-6">
              {guidance && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Health Insights</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {guidance.possibleCauses.map((item, idx) => (
                        <li key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/50">
                      <h3 className="font-bold text-emerald-500 mb-3">Immediate Actions</h3>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        {guidance.immediateActions.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50">
                      <h3 className="font-bold text-blue-500 mb-3">OTC Suggestions</h3>
                      <ul className="space-y-4 text-xs">
                        {guidance.medicines.map((med, i) => (
                          <li key={i} className="border-b dark:border-slate-800 pb-2 last:border-0">
                            <span className="font-bold block uppercase">{med.name}</span>
                            <p className="text-slate-500">{med.dosage}</p>
                            <p className="text-red-500/80 mt-1 italic">⚠️ {med.warnings}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <aside className="space-y-6">
            <HistoryPanel items={history} onSelectItem={(item) => { setSymptoms(item.data); setGuidance(item.guidance); setError(null); }} onClear={() => setHistory([])} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
               <h3 className="font-bold text-slate-800 dark:text-white mb-3">Prop Industries</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Professional health tool delivering evidence-based insights through AI.</p>
            </div>
          </aside>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <DisclaimerModal onAccept={() => {}} />

      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold dark:text-white">CareAssist <span className="text-blue-600">Web</span></h1>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">{isDarkMode ? '☀️' : '🌙'}</button>
      </header>

      <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-[68px] z-20 px-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="max-w-4xl mx-auto flex">
          {[
            { id: 'home', label: 'Check Symptoms', icon: '🩺' },
            { id: 'first-aid', label: 'First Aid', icon: '🆘' },
            { id: 'privacy', label: 'Privacy', icon: '🛡️' },
            { id: 'how-to', label: 'How to Use', icon: '📖' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setView(tab.id as ViewState); setError(null); }}
              className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${view === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 pb-32 overflow-hidden">
        {showEmergencyBanner && view === 'home' && (
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 animate-bounce-short mb-6">
            <h2 className="text-red-700 dark:text-red-400 font-bold text-lg">EMERGENCY DETECTED</h2>
            <p className="text-red-600 dark:text-red-300 text-sm">Seek professional help immediately. Call emergency services.</p>
          </div>
        )}
        
        <div key={view} className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
          {renderContent()}
        </div>
      </main>

      <Footer />
      <SupportContact />
    </div>
  );
};

export default App;
