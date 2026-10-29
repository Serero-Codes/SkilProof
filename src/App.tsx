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
    setCurrentPage(page);
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
            onNewAnalysis={() => handleNavigate('analyze')}
          />
        )}
        {currentPage === 'about' && <AboutPage />}
      </main>

      <Footer />
    </div>
  );
}
