import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Keep a console trace for diagnostics in development and production logs.
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '12px' }}>Bir hata olustu</h1>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Beklenmeyen bir sorun olustu. Sayfayi yenileyip tekrar deneyin.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
