
import React from 'react';

const HowToUse: React.FC = () => {
  const steps = [
    {
      title: "1. Describe Symptoms",
      description: "Navigate to 'Check Symptoms' and type a detailed description of how you feel. Include where it hurts, when it started, and any specific sensations.",
      icon: "✍️"
    },
    {
      title: "2. Provide Context",
      description: "Enter your age and gender. This helps the AI refine its insights based on demographic-specific health patterns.",
      icon: "👤"
    },
    {
      title: "3. Review AI Insights",
      description: "Get immediate feedback on possible causes, non-medicinal actions to take right away, and safe Over-the-Counter (OTC) medicine suggestions.",
      icon: "💡"
    },
    {
      title: "4. Emergency Awareness",
      description: "Look out for red emergency banners. If the app detects critical keywords, it will prioritize instructions for seeking urgent medical care.",
      icon: "🚨"
    },
    {
      title: "5. Offline Safety",
      description: "Lost your connection? Switch to 'First Aid' mode for reliable, offline-stored guides for common emergencies like burns, cuts, and bites.",
      icon: "📶"
    },
    {
      title: "6. Data Control",
      description: "Your data stays on your device. Use the 'Privacy' tab to export your records or wipe your history at any time.",
      icon: "🛡️"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How to Use CareAssist</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Follow these steps to get the most out of your health assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{step.icon}</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-blue-500/20">
        <h3 className="text-xl font-bold mb-2">Ready to start?</h3>
        <p className="text-blue-100 mb-6 text-sm">Your journey to better wellness understanding is just a description away.</p>
        <div className="text-xs opacity-75 italic">CareAssist: Evidence-based guidance, anywhere, anytime.</div>
      </div>
    </div>
  );
};

export default HowToUse;
