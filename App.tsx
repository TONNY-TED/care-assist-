
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSymptoms } from './services/geminiService';
import { SymptomData, HealthGuidance, HistoryItem } from './types';
import DisclaimerModal from './components/DisclaimerModal';
import HistoryPanel from './components/HistoryPanel';
import SupportContact from './components/SupportContact';
import Footer from './components/Footer';
import { EMERGENCY_KEYWORDS, MEDICAL_DISCLAIMER } from './constants';

const App: React.FC = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <DisclaimerModal onAccept={() => {}} />

      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CareAssist <span className="text-blue-600">Web</span></h1>
        </div>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
        {showEmergencyBanner && (
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6 animate-bounce-short">
            <h2 className="text-red-700 dark:text-red-400 font-bold text-lg">EMERGENCY DETECTED</h2>
            <p className="text-red-600 dark:text-red-300 text-sm">Symptoms described may require immediate medical attention.</p>
            <a href="tel:911" className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition hover:bg-red-700">Call Emergency Services Now</a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Check Your Symptoms</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Describe how you feel</label>
                  <textarea
                    name="description"
                    rows={4}
                    className={inputClasses}
                    placeholder="Describe your symptoms in detail..."
                    value={symptoms.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                    <input type="number" name="age" className={inputClasses} value={symptoms.age} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select name="gender" className={inputClasses} value={symptoms.gender} onChange={handleInputChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <input type="text" name="duration" className={inputClasses} placeholder="e.g. 2 days" value={symptoms.duration} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Severity (1-10)</label>
                    <input type="range" name="severity" min="1" max="10" className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-3" value={symptoms.severity} onChange={handleInputChange} />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                >
                  {loading ? 'AI Reasoning in Progress...' : 'Get Health Guidance'}
                </button>
              </form>
            </section>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

            <div ref={resultsRef} className="space-y-6">
              {guidance && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl text-xs text-blue-800 dark:text-blue-300 italic border border-blue-100 dark:border-blue-900/50">
                    <strong>Note:</strong> {MEDICAL_DISCLAIMER}
                  </div>

                  {/* New AI Reasoning Section */}
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50">
                    <h3 className="text-md font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      AI Reasoning Insight
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
                      {guidance.reasoning}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Possible Explanations
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {guidance.possibleCauses.map((item, idx) => (
                        <li key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-emerald-500">Immediate Actions</h3>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        {guidance.immediateActions.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-blue-500">OTC Recommendations</h3>
                      <ul className="space-y-4">
                        {guidance.medicines.map((med, i) => (
                          <li key={i} className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                            <span className="font-bold block uppercase text-slate-700 dark:text-slate-300">{med.name}</span>
                            <p className="text-slate-500 mt-1">{med.dosage}</p>
                            <p className="text-red-500/80 mt-1 font-medium italic">⚠️ {med.warnings}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6 animate-in slide-in-from-right-8 duration-700">
            <HistoryPanel items={history} onSelectItem={(item) => { setSymptoms(item.data); setGuidance(item.guidance); }} onClear={() => setHistory([])} />
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
               <h3 className="font-bold text-slate-800 dark:text-white mb-3">
                 <span className="text-blue-500">Prop</span> Industries
               </h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                 Professional health tool delivering evidence-based insights through Gemini-3 intelligence.
               </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <SupportContact />
    </div>
  );
};

export default App;
