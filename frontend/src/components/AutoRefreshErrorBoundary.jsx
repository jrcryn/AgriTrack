import React from 'react';

export default class AutoRefreshErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    // Match React’s invalid child error
    this.match = props.match ?? /Objects are not valid as a React child/i;
    this.storageKey = 'agritrack_auto_refreshed_invalid_child';
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    try {
      const isTarget =
        typeof error?.message === 'string' && this.match.test(error.message);

      if (isTarget) {
        const alreadyReloaded = sessionStorage.getItem(this.storageKey) === '1';
        if (!alreadyReloaded) {
          sessionStorage.setItem(this.storageKey, '1');
          window.location.reload(); // full reload to reset state
          return;
        }
      }
    } catch {
      // no-op
    }
    // After a reload or other errors, render fallback (if any)
  }

  componentDidMount() {
    // Clear flag on a clean mount (no error)
    if (!this.state.hasError) {
      try { sessionStorage.removeItem(this.storageKey); } catch {}
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null; // minimalist fallback to avoid loops
    }
    return this.props.children;
  }
}