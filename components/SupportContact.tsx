
import React from 'react';

const SupportContact: React.FC = () => {
  return (
    <div className="bg-white border-t p-4 sticky bottom-0 w-full flex gap-4 md:justify-center">
      <a 
        href="tel:+265996464291"
        className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition shadow-md active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Call Support
      </a>
      <a 
        href="https://wa.me/265996464291"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-600 transition shadow-md active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.565.933 3.176 1.403 4.842 1.404h.005c5.303 0 9.617-4.312 9.619-9.617 0-2.569-1.001-4.985-2.818-6.802s-4.234-2.816-6.804-2.817c-5.304 0-9.618 4.313-9.621 9.618-.001 1.83.52 3.554 1.502 5.037l-.982 3.586 3.657-.959zm11.722-6.401c-.333-.167-1.97-.972-2.275-1.082-.306-.11-.528-.167-.75.167-.222.334-.861 1.082-1.055 1.305-.194.223-.389.25-.722.083-.333-.167-1.407-.518-2.679-1.653-.99-.883-1.658-1.973-1.852-2.306-.194-.333-.021-.513.146-.679.149-.15.333-.389.5-.584.167-.194.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.806-1.028-2.472-.27-.653-.545-.563-.75-.573-.194-.01-.417-.01-.639-.01s-.583.083-.889.417c-.306.333-1.166 1.139-1.166 2.778s1.194 3.223 1.361 3.445c.167.222 2.35 3.589 5.694 5.039.795.345 1.416.551 1.901.706.798.253 1.524.217 2.098.131.64-.096 1.97-.806 2.247-1.583s.278-1.445.194-1.584c-.083-.139-.306-.222-.639-.389z"/>
        </svg>
        WhatsApp
      </a>
    </div>
  );
};

export default SupportContact;
