import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Catches render / lazy-chunk failures for sub-tabs (e.g. dynamic import offline).
 */
export default class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[TabErrorBoundary]", error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    const { error } = this.state;
    const { children, title = "This section could not load" } = this.props;

    if (error) {
      const isChunkError =
        /Failed to fetch dynamically imported module|Loading chunk|ChunkLoadError/i.test(
          String(error?.message || error)
        );

      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-10 text-center max-w-lg mx-auto my-8">
          <AlertTriangle className="mx-auto text-amber-600 mb-3" size={32} />
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-2">
            {isChunkError
              ? "This tab was not available offline. Open it once while online, or use the production app with sync enabled."
              : "An unexpected error occurred while loading this section."}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-amber-300 rounded-lg hover:bg-amber-100 text-amber-900"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
