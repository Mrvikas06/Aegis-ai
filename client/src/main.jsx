import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[React App ErrorBoundary Caught]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#06080F] text-white p-6 font-sans">
          <div className="max-w-md w-full bg-surface-elevated border border-white/10 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚡
            </div>
            <h1 className="text-lg font-bold text-white">Aegis Core Recovering</h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              An unexpected client render state occurred. Aegis Incident Commander fallback engine is active.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono tracking-wide transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Reboot Command Center
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
