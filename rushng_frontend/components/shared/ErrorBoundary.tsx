'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
    this.props.onReset?.();
  };

  toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV !== 'production';

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md border-slate-200 shadow-xs">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100/80 p-3 border border-red-200">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">Something went wrong</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
                <Button onClick={this.handleReset} className="gradient-rush text-white gap-2 shadow-xs">
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </Button>
                <Button variant="outline" asChild className="gap-2 border-slate-200 hover:bg-slate-50">
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Go home
                  </Link>
                </Button>
              </div>

              {/* Collapsible Technical Error Details for Debugging */}
              {isDev && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-left">
                  <button
                    onClick={this.toggleDetails}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-between w-full transition-colors"
                  >
                    <span>Technical Error Details</span>
                    {this.state.showDetails ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                      <p className="text-red-400 font-semibold">{this.state.error?.toString()}</p>
                      {this.state.errorInfo?.componentStack && (
                        <p className="mt-2 text-slate-400 text-[11px]">
                          {this.state.errorInfo.componentStack}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}