import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Ralat tidak dijangka telah berlaku.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let parsedDetails: Record<string, unknown> | null = null;
      try {
        parsedDetails = JSON.parse(this.state.errorMessage);
      } catch {
        parsedDetails = null;
      }

      return (
        <div className="min-h-screen camp-gradient-bg text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel-elevated rounded-3xl p-6 border border-rose-400/30 space-y-4">
            <div className="flex items-center gap-3 text-rose-300">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h2 className="font-display font-bold text-lg text-white">
                Gangguan Sambungan Pangkalan Data
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aplikasi mengesan ralat semasa menyegerakkan data. Semua data tempatan anda kekal selamat.
            </p>
            {parsedDetails ? (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] font-mono text-amber-200 space-y-1 overflow-x-auto">
                <div>Operasi: {String(parsedDetails.operationType || '-')}</div>
                <div>Laluan: {String(parsedDetails.path || '-')}</div>
                <div>Mesej: {String(parsedDetails.error || '-')}</div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] font-mono text-amber-200 break-words">
                {this.state.errorMessage}
              </div>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#f5c427] to-[#ea6c15] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Muat Semula Aplikasi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
