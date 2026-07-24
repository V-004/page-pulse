import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Heading,
  Image as ImageIcon,
  BookOpen,
  Copy,
  Check,
  Download,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react';
import { AuditReport } from '../types/audit';

interface ResultsViewProps {
  report: AuditReport;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-pulse-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Status Styling
  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        label: `${status} OK`,
      };
    } else if (status >= 300 && status < 400) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        label: `${status} Redirect`,
      };
    } else {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
        icon: <XCircle className="w-5 h-5 text-rose-500" />,
        label: `${status} Error`,
      };
    }
  };

  const statusInfo = getStatusBadge(report.status);

  // Response Time Rating
  const getResponseSpeedRating = (ms: number) => {
    if (ms < 300) return { label: 'Fast', color: 'text-emerald-600 dark:text-emerald-400', bar: 'w-full bg-emerald-500' };
    if (ms < 1000) return { label: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bar: 'w-2/3 bg-amber-500' };
    return { label: 'Slow', color: 'text-rose-600 dark:text-rose-400', bar: 'w-1/3 bg-rose-500' };
  };

  const speedRating = getResponseSpeedRating(report.response_time_ms);

  // Health Score Calculation
  const calculateHealthScore = () => {
    let score = 100;
    if (report.status !== 200) score -= 30;
    if (report.response_time_ms > 1000) score -= 15;
    else if (report.response_time_ms > 500) score -= 5;
    if (report.page_title === "No Title Found") score -= 15;
    if (report.meta_description === "No Meta Description Found") score -= 15;
    if (report.h1_count === 0) score -= 10;
    if (report.h1_count > 1) score -= 5;
    if (report.images_missing_alt > 0) {
      const penalty = Math.min(15, report.images_missing_alt * 3);
      score -= penalty;
    }
    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {/* Top Overview & Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {report.favicon ? (
              <img
                src={report.favicon}
                alt="Favicon"
                className="w-10 h-10 rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-contain shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
            )}

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {report.page_title !== "No Title Found" ? report.page_title : "Audited Webpage"}
                </h3>
                {report.url && (
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg font-mono">
                {report.url || "Audit Report Summary"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Health Meter & Key KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Audit Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {healthScore}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              HTTP Status Code
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold border ${statusInfo.bg}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-3">
              Server Response Protocol
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Response Time
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {report.response_time_ms}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">ms</span>
            </div>
            <span className={`text-xs font-semibold mt-2 ${speedRating.color}`}>
              ⚡ {speedRating.label} Performance
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Page Size & Words
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {report.page_size_kb || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">KB</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              ~{report.word_count} words
            </span>
          </div>
        </div>
      </div>

      {/* Audit Detail Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Page Title Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Page Title</h4>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {report.page_title.length} chars
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 mb-3">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words">
              {report.page_title}
            </p>
          </div>

          {report.page_title === "No Title Found" ? (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Missing title tag — critical SEO issue!
            </p>
          ) : report.page_title.length < 30 || report.page_title.length > 60 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Title length ({report.page_title.length} chars) outside optimal range (30-60 chars).
            </p>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Title length is optimal for Search Engine Result Pages.
            </p>
          )}
        </div>

        {/* Meta Description Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Meta Description</h4>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {report.meta_description.length} chars
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 mb-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 break-words line-clamp-3">
              {report.meta_description}
            </p>
          </div>

          {report.meta_description === "No Meta Description Found" ? (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Missing meta description tag!
            </p>
          ) : report.meta_description.length < 70 || report.meta_description.length > 160 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Recommended length is 120-160 characters.
            </p>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Excellent meta description length.
            </p>
          )}
        </div>

        {/* H1 Tag Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Heading className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">H1 Tag Count</h4>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                report.h1_count === 1
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {report.h1_count} {report.h1_count === 1 ? 'Heading' : 'Headings'}
            </span>
          </div>

          <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {report.h1_count}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            H1 tags define the main subject of a webpage for search engines.
          </p>

          {report.h1_count === 1 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Perfect! Page has exactly 1 primary H1 heading.
            </p>
          ) : report.h1_count === 0 ? (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> No H1 tag found. Adding a main H1 improves search ranking.
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Multiple H1 tags found ({report.h1_count}). Standard practice recommends using 1 primary H1.
            </p>
          )}
        </div>

        {/* Image Alt Text Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Images Missing Alt Text</h4>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                report.images_missing_alt === 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {report.images_missing_alt} / {report.total_images || 0} Missing
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {report.images_missing_alt}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              out of {report.total_images || 0} total images
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{
                width: `${
                  report.total_images > 0
                    ? Math.round((report.images_missing_alt / report.total_images) * 100)
                    : 0
                }%`,
              }}
            />
          </div>

          {report.images_missing_alt === 0 ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All images have descriptive alt attributes!
            </p>
          ) : (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {report.images_missing_alt} images missing alt text. Adding alt text improves web accessibility & image search indexing.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
