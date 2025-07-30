import React, { Component, ReactNode } from 'react';
import { ErrorPage } from './error-page';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with error tracking service here
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorPage
          type="500"
          title="Application Error"
          description="Something unexpected happened. Please refresh the page or try again later."
          showRefreshButton={true}
          showHomeButton={true}
        />
      );
    }

    return this.props.children;
  }
}