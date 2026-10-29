import { useState } from 'react';
import type { Page, AnalysisResult } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AnalyzePage } from './components/AnalyzePage';
import { ResultsPage } from './components/ResultsPage';
import { AboutPage } from './components/AboutPage';
import { Footer } from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setResults(result);
    setCurrentPage('results');
  };

  const handleNavigate = (page: Page) => {
    // If navigating to results without any results, redirect to analyze
    if (page === 'results' && !results) {
      setCurrentPage('analyze');
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setCurrentPage('analyze');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage onStart={() => handleNavigate('analyze')} />
        )}
        {currentPage === 'analyze' && (
          <AnalyzePage onComplete={handleAnalysisComplete} />
        )}
        {currentPage === 'results' && results && (
          <ResultsPage
            results={results}
            onNewAnalysis={handleNewAnalysis}
            onAbout={() => handleNavigate('about')}
          />
        )}
        {currentPage === 'results' && !results && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">No Analysis Results</h2>
            <p className="text-slate-600 mb-6">
              There are no results to display. Please run an analysis first.
            </p>
            <button
              onClick={() => handleNavigate('analyze')}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start an Analysis
            </button>
          </div>
        )}
        {currentPage === 'about' && <AboutPage />}
      </main>

      <Footer />
    </div>
  );
}
