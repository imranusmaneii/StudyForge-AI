import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { VisualAidPayload } from '../../types';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, Table, GitFork, Sparkles, Binary, Copy, Check, Download, FileText } from 'lucide-react';

interface ChatVisualAidProps {
  visualAid: VisualAidPayload;
}

const COLORS = ['#0070F3', '#00A3FF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

export const ChatVisualAid: React.FC<ChatVisualAidProps> = ({ visualAid }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!visualAid) return null;

  const copyFormula = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadPdfFormulaSheet = () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const title = visualAid.title || 'Academic Formula Sheet';

      // Header Banner
      doc.setFillColor(0, 112, 243); // #0070F3
      doc.rect(0, 0, 210, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('STUDYFORGE AI ACADEMIC COPILOT', 16, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('HIGH-YIELD EXAM FORMULA & CONCEPT SHEET', 16, 19);

      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 19);

      // Title Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, 16, 36);

      let yPos = 44;

      if (visualAid.type === 'formula' && visualAid.formulas) {
        visualAid.formulas.forEach((item, index) => {
          // Check page overflow
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          // Card Box background
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(16, yPos, 178, 34, 3, 3, 'FD');

          // Left accent pill
          doc.setFillColor(0, 112, 243);
          doc.roundedRect(16, yPos, 3.5, 34, 1, 1, 'F');

          // Label
          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`${index + 1}. ${item.label}`, 23, yPos + 8);

          // Formula Equation Box
          doc.setFillColor(15, 20, 32);
          doc.roundedRect(23, yPos + 11, 164, 10, 2, 2, 'F');

          doc.setTextColor(56, 189, 248); // cyan
          doc.setFont('courier', 'bold');
          doc.setFontSize(10);
          doc.text(item.formula, 27, yPos + 17.5);

          // Explanation / Note
          if (item.explanation) {
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8.5);
            const splitText = doc.splitTextToSize(`Note: ${item.explanation}`, 164);
            doc.text(splitText, 23, yPos + 27);
          }

          yPos += 38;
        });
      }

      // Summary
      if (visualAid.summary) {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const splitSummary = doc.splitTextToSize(`Summary: ${visualAid.summary}`, 178);
        doc.text(splitSummary, 16, yPos + 4);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(16, 282, 194, 282);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('StudyForge AI Academic Assistant — Prepared for Examination Revision', 16, 287);
        doc.text(`Page ${i} of ${pageCount}`, 174, 287);
      }

      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sheet.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('Error generating PDF formula sheet:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mt-2 my-2 p-2.5 sm:p-4 rounded-xl bg-[#080B12] border border-[#0070F3]/30 shadow-[0_0_20px_rgba(0,112,243,0.1)] text-white space-y-2.5 max-w-full overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {visualAid.type === 'chart' && <BarChart3 className="w-3.5 h-3.5 text-[#0070F3] shrink-0" />}
          {visualAid.type === 'table' && <Table className="w-3.5 h-3.5 text-[#00A3FF] shrink-0" />}
          {visualAid.type === 'diagram' && <GitFork className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
          {visualAid.type === 'formula' && <Binary className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">{visualAid.title}</h4>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {visualAid.type === 'formula' && (
            <button
              onClick={downloadPdfFormulaSheet}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Download formula sheet as PDF document"
            >
              <Download className="w-3 h-3" />
              <span>{isGeneratingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          )}

          <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono border border-[#0070F3]/20 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Interactive</span>
          </span>
        </div>
      </div>

      {/* Render Chart */}
      {visualAid.type === 'chart' && visualAid.data && visualAid.data.length > 0 && (
        <div className="h-40 sm:h-48 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {visualAid.chartType === 'line' ? (
              <LineChart data={visualAid.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#0070F3', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#0070F3" strokeWidth={2.5} dot={{ fill: '#00A3FF', r: 3 }} />
              </LineChart>
            ) : visualAid.chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={visualAid.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {visualAid.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#0070F3', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            ) : (
              <BarChart data={visualAid.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#0070F3', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#0070F3" radius={[4, 4, 0, 0]}>
                  {visualAid.data.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Render Table */}
      {visualAid.type === 'table' && visualAid.headers && visualAid.rows && (
        <div className="overflow-x-auto rounded-xl border border-white/10 max-w-full scrollbar-thin">
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F1420] text-gray-300 font-semibold border-b border-white/10">
                {visualAid.headers.map((head, hIdx) => (
                  <th key={hIdx} className="px-2.5 sm:px-3.5 py-2 whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visualAid.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={`px-2.5 sm:px-3.5 py-1.5 text-gray-300 ${cIdx === 0 ? 'font-semibold text-white' : ''}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Concept Diagram */}
      {visualAid.type === 'diagram' && visualAid.diagramNodes && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
          {visualAid.diagramNodes.map((node, nIdx) => (
            <div key={node.id || nIdx} className="p-2.5 sm:p-3 rounded-xl bg-[#0F1420] border border-white/10 flex items-start gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0070F3]/20 text-[#0070F3] font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 border border-[#0070F3]/30">
                {nIdx + 1}
              </span>
              <div className="min-w-0">
                <h5 className="text-xs font-semibold text-white truncate">{node.label}</h5>
                {node.desc && <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 leading-snug">{node.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Formula Sheet */}
      {visualAid.type === 'formula' && visualAid.formulas && (
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visualAid.formulas.map((item, fIdx) => (
              <div
                key={fIdx}
                className="p-2.5 sm:p-3 rounded-xl bg-[#0D121F] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-1.5 relative group"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-300 font-mono tracking-wide truncate">{item.label}</span>
                  <button
                    onClick={() => copyFormula(item.formula, fIdx)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shrink-0"
                    title="Copy formula"
                  >
                    {copiedIndex === fIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="p-2 rounded-lg bg-[#05080E] border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 font-semibold text-center tracking-wider overflow-x-auto scrollbar-thin">
                  {item.formula}
                </div>

                {item.explanation && (
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug italic">{item.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {/* Download PDF Action Banner */}
          <button
            onClick={downloadPdfFormulaSheet}
            disabled={isGeneratingPdf}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF Sheet...' : 'Download Full PDF Formula Sheet'}</span>
          </button>
        </div>
      )}

      {/* Visual Aid Summary Footnote */}
      {visualAid.summary && (
        <p className="text-[10px] sm:text-[11px] text-gray-400 italic pt-1 border-t border-white/5">
          {visualAid.summary}
        </p>
      )}
    </div>
  );
};
