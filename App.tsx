
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
import { EMERGENCY_KEYWORDS, MEDICAL_DISCLAIMER } from './constants';

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
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" name="age" className={inputClasses} placeholder="Age" value={symptoms.age} onChange={handleInputChange} />
                  <select name="gender" className={inputClasses} value={symptoms.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl text-red-700 dark:text-red-400 animate-in fade-in zoom-in duration-300">
                <div className="flex gap-4">
                  <div className="bg-red-100 dark:bg-red-800/50 p-2 rounded-lg h-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Analysis Could Not Complete</h4>
                    <p className="text-sm opacity-90 mb-3">{error}</p>
                    <div className="text-xs space-y-2 border-t border-red-200 dark:border-red-800 pt-3">
                      <p className="font-semibold uppercase tracking-wider">Troubleshooting:</p>
                      <ul className="list-disc ml-4 space-y-1 opacity-75">
                        <li>Ensure you have a <strong>.env</strong> file with <code>API_KEY=your_key</code> in your project root.</li>
                        <li>Check if your API key from <a href="https://aistudio.google.com/" target="_blank" className="underline font-bold">Google AI Studio</a> is correct.</li>
                        <li>If you are opening the <code>index.html</code> file directly (without a server), environment variables will not work.</li>
                      </ul>
                    </div>
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

      {/* Main Navigation Tabs */}
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
        
        {/* Cool transition wrapper using key to trigger CSS animations on view switch */}
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
