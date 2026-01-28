
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6 mt-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CareAssist <span className="text-blue-500">Web</span></span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Empowering patients with accessible, informational health guidance and self-care tools.
          </p>
          <div className="pt-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">Contact Us</p>
            <a href="mailto:tonnychibambo@gmail.com" className="text-blue-400 hover:text-blue-300 transition text-sm">
              tonnychibambo@gmail.com
            </a>
          </div>
        </div>

        {/* Product Section */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Product</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Features</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Symptom Checker</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">OTC Directory</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Health Resources</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">API Access</a></li>
          </ul>
        </div>

        {/* Industries Section */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Industries</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Telehealth Providers</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Retail Pharmacy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Community Clinics</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Insurance Partners</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Global NGOs</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} CareAssist Web. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
          <a href="#" className="hover:text-slate-300 transition">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
