import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#090F1E] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[2rem] bg-white dark:bg-[#111A2E] border-2 border-[#102B69] dark:border-[#D6F45A] bento-shadow p-8 text-center space-y-4">
            <span className="inline-block px-4 py-1 rounded-full bg-[#FF5A5F] text-white border-2 border-[#102B69] font-display font-extrabold text-xs">
              SYSTEM NOTICE
            </span>
            <h1 className="font-display text-2xl font-extrabold text-[#102B69] dark:text-white">
              Terjadi Gangguan Tampilan
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Muat ulang halaman untuk memulihkan aplikasi GANESPACE.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#102B69] dark:bg-[#D6F45A] text-[#D6F45A] dark:text-[#102B69] text-xs font-extrabold"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}