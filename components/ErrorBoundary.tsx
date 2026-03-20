import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    const { children } = this.props;
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      let errorDetails = null;

      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error && parsedError.operationType) {
          errorMessage = `Erro de Permissão no Firestore (${parsedError.operationType})`;
          errorDetails = (
            <div className="mt-4 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Detalhes Técnicos</p>
              <p className="text-[11px] text-slate-300 font-mono break-all">Path: {parsedError.path || 'N/A'}</p>
              <p className="text-[11px] text-slate-300 font-mono break-all">User: {parsedError.authInfo.email || 'Anônimo'} ({parsedError.authInfo.userId || 'N/A'})</p>
              <p className="text-[11px] text-red-400 mt-2 font-mono">{parsedError.error}</p>
            </div>
          );
        }
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl text-center animate-in zoom-in duration-500">
            <div className="inline-flex p-4 rounded-3xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
              {errorMessage}
            </p>

            {errorDetails}

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                <Home size={16} />
                Início
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-sky-900/20 active:scale-95"
              >
                <RefreshCcw size={16} />
                Recarregar
              </button>
            </div>
            
            <p className="mt-8 text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">
              Impacto X Terminal • Error Recovery
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
