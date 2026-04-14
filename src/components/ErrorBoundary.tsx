import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
          <div className="max-w-md w-full bg-white rounded-[24px] shadow-sm border border-zinc-200 p-8 text-center">
            <h2 className="text-2xl font-display font-bold text-red-600 mb-4">¡Ups! Algo salió mal.</h2>
            <p className="text-zinc-600 mb-6">
              Ha ocurrido un error inesperado en la aplicación.
            </p>
            <div className="bg-zinc-50 p-4 rounded-xl text-left text-sm text-zinc-800 overflow-auto max-h-40 mb-6 border border-zinc-200">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    // @ts-expect-error - React.Component has props
    return this.props.children;
  }
}
