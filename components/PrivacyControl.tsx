
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { HistoryItem } from '../types';

const PrivacyControl: React.FC = () => {
  const [isDataSharing, setIsDataSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const deleteHistory = () => {
    if (confirm("Are you sure? This will permanently delete your local history.")) {
      localStorage.removeItem('careassist_history');
      window.location.reload();
    }
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const storedData = localStorage.getItem('careassist_history');
      const history: HistoryItem[] = storedData ? JSON.parse(storedData) : [];

      if (history.length === 0) {
        alert("No history found to export.");
        setIsExporting(false);
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 20;

      // --- Branded Header (First Page) ---
      // Draw Heart Icon manually using shapes to avoid FormObject errors
      doc.setFillColor(37, 99, 235); // blue-600
      doc.setDrawColor(37, 99, 235);
      
      const hX = 20;
      const hY = 20;
      // Heart consists of two circles and a triangle
      doc.circle(hX - 2, hY, 3, 'F');
      doc.circle(hX + 2, hY, 3, 'F');
      doc.triangle(hX - 4.8, hY + 1, hX + 4.8, hY + 1, hX, hY + 7, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("CareAssist Web", 30, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Personal Health History Report", 30, 28);
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(15, 35, pageWidth - 15, 35);
      
      y = 45;

      // --- Body ---
      history.forEach((item, index) => {
        if (!item || !item.data || !item.guidance) return;

        // Check for page overflow
        if (y > pageHeight - 45) {
          doc.addPage();
          y = 25;
        }

        const date = new Date(item.timestamp).toLocaleString();
        
        // Entry Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.text(`Record #${history.length - index} - ${date}`, 15, y);
        y += 8;

        // User Description
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // slate-700
        doc.text("Symptom Description:", 15, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(item.data.description || "No description provided", pageWidth - 30);
        doc.text(descLines, 15, y);
        y += (descLines.length * 5) + 5;

        // Possible Causes
        if (item.guidance.possibleCauses && item.guidance.possibleCauses.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("Possible Causes:", 15, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const causeLines = doc.splitTextToSize(item.guidance.possibleCauses.join(", "), pageWidth - 30);
          doc.text(causeLines, 15, y);
          y += (causeLines.length * 5) + 5;
        }

        // OTC Recommendations
        if (item.guidance.medicines && item.guidance.medicines.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("OTC Recommendations:", 15, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          item.guidance.medicines.forEach(med => {
            if (y > pageHeight - 30) {
              doc.addPage();
              y = 25;
            }
            const medText = `${med.name}: ${med.dosage} (${med.warnings})`;
            const medLines = doc.splitTextToSize(medText, pageWidth - 35);
            doc.text("- " + medLines[0], 18, y);
            y += (medLines.length * 5);
          });
          y += 5;
        }

        // Divider
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.line(15, y, pageWidth - 15, y);
        y += 12;
      });

      // --- Branded Footer ---
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139); // slate-500
        
        const footerInfo = "tonnychibambo@gmail.com | 0996464291";
        const developer = "Developed by Prop Industries";
        
        doc.text(footerInfo, pageWidth / 2, pageHeight - 18, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.text(developer, pageWidth / 2, pageHeight - 13, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 10);
      }

      doc.save(`CareAssist_History_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Check the browser console for more technical details.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-2">Data Privacy Control Panel</h2>
        <p className="text-sm text-slate-400">Manage your local data and privacy settings.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl divide-y dark:divide-slate-800">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Delete Local History</h3>
            <p className="text-xs text-slate-500">Wipe all symptom checks from this device.</p>
          </div>
          <button onClick={deleteHistory} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition">Clear All</button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Branded Health Report</h3>
            <p className="text-xs text-slate-500">Download your history as a professional PDF document.</p>
          </div>
          <button 
            onClick={exportAsPDF} 
            disabled={isExporting}
            className={`bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition flex items-center gap-2 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Local-Only Processing</h3>
            <p className="text-xs text-slate-500">Ensure data is not shared with 3rd parties (excluding AI analysis).</p>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!isDataSharing} onChange={() => setIsDataSharing(!isDataSharing)} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
        <p className="text-[10px] text-slate-500">Data encryption is handled by your browser's local storage engine. We do not store your data on our servers.</p>
      </div>
    </div>
  );
};

export default PrivacyControl;
