
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSymptoms } from './services/geminiService';
import { SymptomData, HealthGuidance, HistoryItem } from './types';
import DisclaimerModal from './components/DisclaimerModal';
import HistoryPanel from './components/HistoryPanel';
import SupportContact from './components/SupportContact';
import { EMERGENCY_KEYWORDS, MEDICAL_DISCLAIMER } from './constants';

const App: React.FC = () => {
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
    const savedHistory = localStorage.getItem('careassist_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const checkForEmergency = (text: string) => {
    const lowerText = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSymptoms(prev => ({ ...prev, [name]: value }));
    
    if (name === 'description') {
      setShowEmergencyBanner(checkForEmergency(value));
    }
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

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: { ...symptoms },
        guidance: result
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('careassist_history', JSON.stringify(updatedHistory));

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('careassist_history');
  };

  const loadFromHistory = (item: HistoryItem) => {
    setSymptoms(item.data);
    setGuidance(item.guidance);
    setShowEmergencyBanner(checkForEmergency(item.data.description));
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-slate-50">
      <DisclaimerModal onAccept={() => {}} />

      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">CareAssist <span className="text-blue-600">Web</span></h1>
        </div>
        <div className="hidden md:block text-xs text-slate-400 max-w-[300px] text-right">
          Educational health guidance tool.
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8">
        {/* Emergency Alert Banner */}
        {(showEmergencyBanner || (guidance && guidance.isEmergency)) && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex gap-4 animate-pulse">
            <div className="bg-red-600 text-white w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-red-700 font-bold text-lg">EMERGENCY DETECTED</h2>
              <p className="text-red-600 text-sm">Symptoms described may require immediate medical attention. Please call emergency services or go to the nearest hospital right away.</p>
              <a href="tel:911" className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider">Call Emergency Services Now</a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Check Your Symptoms</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Describe how you feel</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g. I have a throbbing headache and slight fever since yesterday..."
                    value={symptoms.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                      value={symptoms.age}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                      value={symptoms.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 2 days"
                      value={symptoms.duration}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                      Severity <span>{symptoms.severity}/10</span>
                    </label>
                    <input
                      type="range"
                      name="severity"
                      min="1"
                      max="10"
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={symptoms.severity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Symptoms...
                    </>
                  ) : 'Get Health Guidance'}
                </button>
              </form>
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Results Section */}
            <div ref={resultsRef}>
              {guidance && (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-800 leading-relaxed italic">
                    <strong>Disclaimer:</strong> {MEDICAL_DISCLAIMER}
                  </div>

                  {/* Possible Causes */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Possible Explanations
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {guidance.possibleCauses.map((item, idx) => (
                        <li key={idx} className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-100">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What to do & Prevention */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What to do now
                      </h3>
                      <ul className="space-y-2">
                        {guidance.immediateActions.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-blue-500">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Prevention Tips
                      </h3>
                      <ul className="space-y-2">
                        {guidance.preventiveMeasures.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-emerald-500">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* OTC Medicines */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.718 2.152a2 2 0 01-1.414 1.414l-2.152.718a2 2 0 00-1.414 1.96l.477 2.387a2 2 0 00.547 1.022l1.583 1.583a2 2 0 002.828 0l1.583-1.583a2 2 0 00.547-1.022l.477-2.387a2 2 0 00-1.414-1.96l-2.152-.718a2 2 0 01-1.414-1.414l-.718-2.152a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-1.583 1.583a2 2 0 000 2.828l1.583 1.583z" />
                      </svg>
                      OTC Suggestions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guidance.medicines.map((med, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-indigo-50/20">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-indigo-700 uppercase text-sm tracking-wide">{med.name}</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-bold">OTC Only</span>
                          </div>
                          <p className="text-xs text-slate-700 mb-2"><strong>Dosage:</strong> {med.dosage}</p>
                          <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">
                            <strong>Warning:</strong> {med.warnings}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* When to see doctor */}
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      When to see a doctor
                    </h3>
                    <ul className="space-y-2">
                      {guidance.whenToSeeDoctor.map((item, idx) => (
                        <li key={idx} className="text-sm text-orange-700 font-medium flex gap-2">
                          <span className="text-orange-400">⚠️</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <HistoryPanel items={history} onSelectItem={loadFromHistory} onClear={clearHistory} />
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3">About CareAssist</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                CareAssist Web uses advanced AI to provide helpful health information. Our goal is to empower users with self-care knowledge for common symptoms.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">Safe Educational Platform</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-xs text-blue-100 mb-4">Our support team is available for general inquiries.</p>
              <div className="space-y-2">
                 <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-semibold transition text-center border border-white/20">
                   View FAQ
                 </button>
                 <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-semibold transition text-center border border-white/20">
                   Privacy Policy
                 </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer / Fixed Action Bar */}
      <SupportContact />
    </div>
  );
};

export default App;
