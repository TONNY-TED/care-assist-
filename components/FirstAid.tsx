
import React from 'react';

const FIRST_AID_DATA = [
  {
    title: "Burns",
    steps: [
      "Run cool (not cold) water over the burn for 20 minutes.",
      "Remove jewelry or tight clothing before area swells.",
      "Cover with a sterile non-stick bandage.",
      "Do NOT use butter, oils, or ice directly on the burn."
    ],
    color: "bg-orange-500"
  },
  {
    title: "Cuts & Bleeding",
    steps: [
      "Apply direct pressure with a clean cloth until bleeding stops.",
      "Clean the wound with mild soap and water.",
      "Apply an antibiotic ointment.",
      "Cover with a clean bandage. Seek help if cut is deep."
    ],
    color: "bg-red-500"
  },
  {
    title: "Fever",
    steps: [
      "Rest and drink plenty of fluids.",
      "Keep the room temperature comfortable.",
      "Use light clothing.",
      "Seek help if fever exceeds 103°F (39.4°C) or lasts over 3 days."
    ],
    color: "bg-blue-500"
  },
  {
    title: "Dehydration",
    steps: [
      "Sip small amounts of water or oral rehydration salts.",
      "Avoid caffeinated or sugary drinks.",
      "Seek shaded/cool areas.",
      "Look for dry mouth or decreased urination as key signs."
    ],
    color: "bg-emerald-500"
  },
  {
    title: "Snake Bite",
    steps: [
      "Remain calm and move away from the snake's strike zone.",
      "Keep the bitten limb at or below heart level.",
      "Remove rings or constricting items.",
      "Seek EMERGENCY medical care immediately. Do NOT cut the wound or try to suck out venom."
    ],
    color: "bg-amber-600"
  }
];

const FirstAid: React.FC = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-2">Offline First Aid Mode</h2>
        <p className="text-sm text-blue-100 opacity-90">This guide works without an internet connection. Essential steps for emergencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIRST_AID_DATA.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <h3 className="font-bold text-slate-800 dark:text-white">{item.title}</h3>
            </div>
            <ul className="space-y-3">
              {item.steps.map((step, sIdx) => (
                <li key={sIdx} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                  <span className="text-slate-300 dark:text-slate-700 font-mono">{sIdx + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirstAid;
