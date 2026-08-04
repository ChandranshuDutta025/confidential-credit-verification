import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 440, textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>&#9888;</div>
            <h2 style={{ marginBottom: 8, color: '#0F172A' }}>Something went wrong</h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 16 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
