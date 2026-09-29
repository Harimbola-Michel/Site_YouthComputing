'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={cn(
            'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center',
            this.props.className
          )}
        >
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h3 className="font-ubuntu text-lg font-semibold text-foreground">
            Une erreur est survenue
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
          </p>
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}