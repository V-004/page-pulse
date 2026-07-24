import React, { useState } from 'react';
import { Search, Loader2, X, Globe, Sparkles } from 'lucide-react';

interface AuditFormProps {
  onAudit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
}

const PRESET_URLS = [
  { label: 'Google', url: 'https://google.com' },
  { label: 'Wikipedia', url: 'https://wikipedia.org' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Test 404 Page', url: 'https://httpbin.org/status/404' },
  { label: 'Test PDF File', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
];

export const AuditForm: React.FC<AuditFormProps> = ({ onAudit, isLoading, initialUrl = '' }) => {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onAudit(url.trim());
  };

  const handleSelectPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    if (!isLoading) {
      onAudit(presetUrl);
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
        <Sparkles className="w-4 h-4" />
        <span>Instant Web Diagnostics</span>
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Audit Any Webpage URL
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Enter a public URL to perform an instant technical audit checking status code, response time, meta tags, H1 structure, alt attributes, and content length.
      </p>

      <form onSubmit={handleSubmit} className="relative mb-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Globe className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            placeholder="https://example.com or example.com"
            className="w-full pl-12 pr-28 py-4 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all disabled:opacity-60"
          />

          {url && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-28 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Audit</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Quick Links */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">
          Try Quick Examples:
        </span>
        {PRESET_URLS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPreset(preset.url)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/80 transition-colors disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
