import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unexpected application error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="fatal-error-page" role="alert">
        <div className="fatal-error-card">
          <span className="page-eyebrow">Weather Radar</span>
          <h1>Something went wrong</h1>
          <p>The dashboard hit an unexpected error. Reload it to start fresh.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload Weather Radar
          </button>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
