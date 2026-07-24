import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { AuditForm } from '../components/AuditForm';
import { ResultsView } from '../components/ResultsView';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { SettingsModal } from '../components/SettingsModal';
import { Footer } from '../components/Footer';
import { runPageAudit } from '../services/api';
import { AuditReport, AuditHistoryItem } from '../types/audit';
import { AlertCircle, RefreshCw, Sparkles, Activity, ShieldAlert } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'page_pulse_audit_history';

export const HomePage: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync Theme Class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load History from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 5));
        }
      }
    } catch (e) {
      console.error("Failed to load audit history:", e);
    }
  }, []);

  // Save History to LocalStorage
  const saveToHistory = (newReport: AuditReport, targetUrl: string) => {
    const newItem: AuditHistoryItem = {
      id: Date.now().toString(),
      url: targetUrl,
      timestamp: new Date().toISOString(),
      report: newReport,
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== targetUrl);
      const updated = [newItem, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save audit history:", e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  // Run Page Audit
  const handleAudit = async (targetUrl: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null); // Clear previous report before new request

    try {
      const result = await runPageAudit(targetUrl);
      setReport(result);
      saveToHistory(result, targetUrl);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during page audit.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AuditHistoryItem) => {
    setError(null);
    setReport(item.report);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-8">
        {/* Main Audit Input Section */}
        <AuditForm onAudit={handleAudit} isLoading={isLoading} />

        {/* Error Banner */}
        {error && (
          <div className="w-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-6 text-rose-800 dark:text-rose-200 shadow-lg shadow-rose-500/10 transition-all flex items-start gap-4">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                <span>Audit Request Failed</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-mono font-semibold">
                  {error}
                </span>
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed mb-3">
                The target URL could not be audited. Please verify that the domain exists, is publicly accessible, and serves standard HTML content over HTTP/HTTPS.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-rose-700 dark:text-rose-300">
                <span className="px-2.5 py-1 rounded-lg bg-rose-100/80 dark:bg-rose-900/40">
                  Tip: Ensure scheme starts with http:// or https://
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100/80 dark:bg-rose-900/40">
                  Tip: Check if destination server timed out (&gt;10s)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {report && !isLoading && <ResultsView report={report} />}
      </main>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <Footer />
    </div>
  );
};
