import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { VisualAidPayload } from '../../types';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  BarChart3,
  Table as TableIcon,
  GitFork,
  Sparkles,
  Binary,
  Copy,
  Check,
  Download,
  FileText,
  ArrowRight,
  ArrowDown,
  Layers,
  Network,
  Maximize2
} from 'lucide-react';

interface ChatVisualAidProps {
  visualAid: VisualAidPayload;
}

const COLORS = ['#0070F3', '#00A3FF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

export const ChatVisualAid: React.FC<ChatVisualAidProps> = ({ visualAid }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [diagramLayout, setDiagramLayout] = useState<'flow' | 'grid'>('flow');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!visualAid) return null;

  const copyFormula = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllDiagram = () => {
    if (!visualAid.diagramNodes) return;
    const text = visualAid.diagramNodes.map((n, i) => `${i + 1}. ${n.label}: ${n.desc || ''}`).join('\n');
    navigator.clipboard.writeText(`${visualAid.title}\n\n${text}`);
    setCopiedIndex(999);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadUniversalPdf = () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const title = visualAid.title || 'StudyForge AI Academic Visual Aid';

      // Header Banner
      doc.setFillColor(0, 112, 243); // #0070F3
      doc.rect(0, 0, 210, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('STUDYFORGE AI ACADEMIC COPILOT', 16, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const subtitle =
        visualAid.type === 'diagram' ? 'STUDY CONCEPT DIAGRAM & WORKFLOW' :
        visualAid.type === 'formula' ? 'HIGH-YIELD EXAM FORMULA & EQUATION SHEET' :
        visualAid.type === 'table' ? 'ACADEMIC COMPARISON MATRIX' :
        'DATA & MASTERY ANALYTICS REPORT';
      doc.text(subtitle, 16, 19);

      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 19);

      // Title Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, 16, 36);

      let yPos = 44;

      // 1. DIAGRAM PDF RENDERER
      if (visualAid.type === 'diagram' && visualAid.diagramNodes) {
        visualAid.diagramNodes.forEach((node, index) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          // Card Box background
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(16, yPos, 178, 26, 3, 3, 'FD');

          // Left Accent Pill
          doc.setFillColor(0, 112, 243);
          doc.roundedRect(16, yPos, 3.5, 26, 1, 1, 'F');

          // Step Circle
          doc.setFillColor(224, 242, 254);
          doc.setDrawColor(56, 189, 248);
          doc.circle(26, yPos + 13, 6, 'FD');

          doc.setTextColor(2, 132, 199);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(String(index + 1), 24.5, yPos + 16.5);

          // Node Label
          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(node.label || `Stage ${index + 1}`, 36, yPos + 9);

          // Description
          if (node.desc) {
            doc.setTextColor(71, 85, 105);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const splitDesc = doc.splitTextToSize(node.desc, 150);
            doc.text(splitDesc, 36, yPos + 16);
          }

          yPos += 30;

          // Connecting flow arrow indicator for subsequent nodes
          if (index < (visualAid.diagramNodes?.length || 0) - 1 && yPos <= 245) {
            doc.setTextColor(148, 163, 184);
            doc.setFont('courier', 'bold');
            doc.setFontSize(12);
            doc.text('|', 25.5, yPos - 1.5);
            doc.text('v', 25.5, yPos + 2.5);
            yPos += 5;
          }
        });
      }

      // 2. FORMULA PDF RENDERER
      if (visualAid.type === 'formula' && visualAid.formulas) {
        visualAid.formulas.forEach((item, index) => {
          if (yPos > 245) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(16, yPos, 178, 34, 3, 3, 'FD');

          doc.setFillColor(16, 185, 129); // emerald
          doc.roundedRect(16, yPos, 3.5, 34, 1, 1, 'F');

          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`${index + 1}. ${item.label}`, 23, yPos + 8);

          doc.setFillColor(15, 20, 32);
          doc.roundedRect(23, yPos + 11, 164, 10, 2, 2, 'F');

          doc.setTextColor(56, 189, 248);
          doc.setFont('courier', 'bold');
          doc.setFontSize(10);
          doc.text(item.formula, 27, yPos + 17.5);

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

      // 3. TABLE PDF RENDERER
      if (visualAid.type === 'table' && visualAid.headers && visualAid.rows) {
        const colWidth = 178 / visualAid.headers.length;
        // Table Header
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(16, yPos, 178, 9, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        visualAid.headers.forEach((h, hIdx) => {
          doc.text(h, 18 + hIdx * colWidth, yPos + 6);
        });
        yPos += 11;

        // Table Rows
        visualAid.rows.forEach((row, rIdx) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(rIdx % 2 === 0 ? 248 : 255, rIdx % 2 === 0 ? 250 : 255, rIdx % 2 === 0 ? 252 : 255);
          doc.rect(16, yPos, 178, 8, 'F');
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          row.forEach((cell, cIdx) => {
            const cellText = doc.splitTextToSize(cell, colWidth - 4);
            doc.text(cellText[0] || '', 18 + cIdx * colWidth, yPos + 5.5);
          });
          yPos += 8.5;
        });
      }

      // 4. CHART SUMMARY PDF RENDERER
      if (visualAid.type === 'chart' && visualAid.data) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(16, yPos, 178, 12 + visualAid.data.length * 8, 3, 3, 'FD');
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Key Metric Breakdown:', 22, yPos + 8);
        yPos += 12;

        visualAid.data.forEach((item) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(`• ${item.name}:`, 24, yPos);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 112, 243);
          doc.text(`${item.value}`, 90, yPos);
          yPos += 7;
        });
      }

      // Summary
      if (visualAid.summary) {
        if (yPos > 255) {
          doc.addPage();
          yPos = 20;
        }
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const splitSummary = doc.splitTextToSize(`Summary: ${visualAid.summary}`, 178);
        doc.text(splitSummary, 16, yPos + 6);
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
        doc.text('StudyForge AI Academic Assistant — Revision & Concept Document', 16, 287);
        doc.text(`Page ${i} of ${pageCount}`, 174, 287);
      }

      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_document.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('Error generating PDF visual aid:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mt-3 my-2 p-3 sm:p-5 rounded-2xl bg-[#070B14] border border-[#0070F3]/30 shadow-[0_0_25px_rgba(0,112,243,0.15)] text-white space-y-3.5 max-w-full overflow-hidden">
      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#0070F3]/20 border border-[#0070F3]/40 flex items-center justify-center text-[#0070F3] shrink-0">
            {visualAid.type === 'chart' && <BarChart3 className="w-4 h-4" />}
            {visualAid.type === 'table' && <TableIcon className="w-4 h-4 text-cyan-400" />}
            {visualAid.type === 'diagram' && <GitFork className="w-4 h-4 text-purple-400" />}
            {visualAid.type === 'formula' && <Binary className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {visualAid.title}
            </h4>
            <p className="text-[10px] text-gray-400 font-mono">
              {visualAid.type === 'diagram' ? 'Interactive Concept & Process Diagram' :
               visualAid.type === 'formula' ? 'High-Yield Formula Cheat Sheet' :
               visualAid.type === 'table' ? 'Structured Academic Matrix' :
               'Data Visualization & Analysis'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {visualAid.type === 'diagram' && (
            <div className="flex items-center bg-[#0E1526] border border-white/10 rounded-lg p-0.5 text-[10px]">
              <button
                onClick={() => setDiagramLayout('flow')}
                className={`px-2 py-0.5 rounded transition-all ${
                  diagramLayout === 'flow'
                    ? 'bg-[#0070F3] text-white font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Flowchart Timeline View"
              >
                Flow
              </button>
              <button
                onClick={() => setDiagramLayout('grid')}
                className={`px-2 py-0.5 rounded transition-all ${
                  diagramLayout === 'grid'
                    ? 'bg-[#0070F3] text-white font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid Matrix View"
              >
                Grid
              </button>
            </div>
          )}

          {visualAid.type === 'diagram' && (
            <button
              onClick={copyAllDiagram}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-semibold transition-all active:scale-95"
              title="Copy diagram steps to clipboard"
            >
              {copiedIndex === 999 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedIndex === 999 ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={downloadUniversalPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0070F3] to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(0,112,243,0.3)] transition-all active:scale-95 disabled:opacity-50"
            title="Download full visual aid document as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* 1. CONCEPT DIAGRAM RENDERER */}
      {visualAid.type === 'diagram' && visualAid.diagramNodes && (
        <div className="space-y-3 pt-1">
          {diagramLayout === 'flow' ? (
            /* Interactive Sequential Flow Layout */
            <div className="flex flex-col space-y-2.5">
              {visualAid.diagramNodes.map((node, nIdx) => {
                const isSelected = selectedNodeId === (node.id || String(nIdx));
                const isLast = nIdx === (visualAid.diagramNodes?.length || 0) - 1;

                return (
                  <React.Fragment key={node.id || nIdx}>
                    <div
                      onClick={() => setSelectedNodeId(isSelected ? null : (node.id || String(nIdx)))}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-[#10182E] border-[#0070F3] shadow-[0_0_20px_rgba(0,112,243,0.3)]'
                          : 'bg-[#0B101D] border-white/10 hover:border-[#0070F3]/50 hover:bg-[#0E1526]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Number Badge */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#0070F3] to-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-md">
                          {nIdx + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {node.label}
                            </h5>
                            {node.category && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                {node.category}
                              </span>
                            )}
                          </div>
                          {node.desc && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                              {node.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Connecting Flow Arrow */}
                    {!isLast && (
                      <div className="flex items-center justify-center my-0.5 py-0.5">
                        <div className="flex items-center gap-1 text-[#0070F3] opacity-80 animate-pulse">
                          <ArrowDown className="w-4 h-4" />
                          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-cyan-400">Next Stage</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            /* Compact Matrix Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {visualAid.diagramNodes.map((node, nIdx) => (
                <div
                  key={node.id || nIdx}
                  className="p-3.5 rounded-xl bg-[#0B101D] border border-white/10 hover:border-[#0070F3]/50 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0070F3]/20 text-[#0070F3] font-bold text-xs flex items-center justify-center shrink-0 border border-[#0070F3]/40">
                      {nIdx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {node.label}
                    </h5>
                  </div>
                  {node.desc && (
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {node.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. FORMULA SHEET RENDERER */}
      {visualAid.type === 'formula' && visualAid.formulas && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {visualAid.formulas.map((item, fIdx) => (
              <div
                key={fIdx}
                className="p-3 sm:p-3.5 rounded-xl bg-[#0B101D] border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-2 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-300 font-mono tracking-wide truncate">
                    {item.label}
                  </span>
                  <button
                    onClick={() => copyFormula(item.formula, fIdx)}
                    className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shrink-0"
                    title="Copy formula"
                  >
                    {copiedIndex === fIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-[#04060C] border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 font-semibold text-center tracking-wider overflow-x-auto scrollbar-thin">
                  {item.formula}
                </div>

                {item.explanation && (
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TABLE MATRIX RENDERER */}
      {visualAid.type === 'table' && visualAid.headers && visualAid.rows && (
        <div className="overflow-x-auto rounded-xl border border-white/10 max-w-full scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F1626] text-gray-200 font-semibold border-b border-white/10">
                {visualAid.headers.map((head, hIdx) => (
                  <th key={hIdx} className="px-3 sm:px-4 py-2.5 whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visualAid.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={`px-3 sm:px-4 py-2 text-gray-300 ${cIdx === 0 ? 'font-semibold text-white' : ''}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. RECHARTS ANALYTICS */}
      {visualAid.type === 'chart' && visualAid.data && visualAid.data.length > 0 && (
        <div className="h-44 sm:h-52 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {visualAid.chartType === 'line' ? (
              <LineChart data={visualAid.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#0070F3', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#0070F3" strokeWidth={2.5} dot={{ fill: '#00A3FF', r: 3.5 }} />
              </LineChart>
            ) : visualAid.chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={visualAid.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
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
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#0070F3', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#0070F3" radius={[5, 5, 0, 0]}>
                  {visualAid.data.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Note */}
      {visualAid.summary && (
        <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-gray-400 text-xs italic">
          <Sparkles className="w-3.5 h-3.5 text-[#0070F3] shrink-0 mt-0.5" />
          <span>{visualAid.summary}</span>
        </div>
      )}
    </div>
  );
};
