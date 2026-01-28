
import React, { useState, useEffect } from 'react';
import { MEDICAL_DISCLAIMER } from '../constants';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('careassist_consented');
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (hasConsented) {
      localStorage.setItem('careassist_consented', 'true');
      setIsOpen(false);
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
        <div className="text-center">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Medical Disclaimer</h2>
        </div>
        
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          {MEDICAL_DISCLAIMER}
        </p>

        <div className="space-y-4 border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
            />
            <span className="text-sm text-slate-700 select-none">
              I understand that CareAssist Web is an informational tool and does not provide medical diagnosis. I agree to the <span className="text-blue-600 font-medium">Privacy Policy</span>.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!hasConsented}
            className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg ${
              hasConsented 
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            I Accept and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
