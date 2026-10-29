import { useState, useRef, useCallback } from 'react';
import { TECHNICAL_SKILLS } from '../types';
import type { AnalysisResult } from '../types';
import { validateGitHubUrl, getRepoInfo, collectFilesToInspect, getFileContent } from '../utils/github';
import { analyzeSkills } from '../utils/evidence';

interface AnalyzePageProps {
  onComplete: (result: AnalysisResult) => void;
}

type AnalysisState = 'idle' | 'validating' | 'fetching_repo' | 'collecting_files' | 'reading_files' | 'analyzing' | 'error' | 'complete';

export function AnalyzePage({ onComplete }: AnalyzePageProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [state, setState] = useState<AnalysisState>('idle');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState('');
  const [limitWarning, setLimitWarning] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const analysisIdRef = useRef<number>(0);

  const toggleSkill = (skill: string) => {
    setLimitWarning('');
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }
      if (prev.length >= 8) {
        setLimitWarning('Maximum of 8 skills reached. Deselect a skill to choose a different one.');
        return prev;
      }
      return [...prev, skill];
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLimitWarning('');

    // Validate inputs
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please select at least one technical skill to investigate.');
      return;
    }

    if (selectedSkills.length > 8) {
      setError('Please select no more than 8 skills.');
      return;
    }

    // Cancel any previous analysis
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const currentAbort = new AbortController();
    abortRef.current = currentAbort;
    const currentAnalysisId = ++analysisIdRef.current;

    // Step 1: Validate URL
    setState('validating');
    setProgress('Validating repository URL...');
    const validation = validateGitHubUrl(repoUrl);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL.');
      setState('error');
      return;
    }

    const { owner, repo } = validation;
    const apiCallCount = { count: 0 };

    try {
      // Step 2: Fetch repo info
      setState('fetching_repo');
      setProgress('Fetching repository information...');

      if (currentAbort.signal.aborted) return;
      const repoInfo = await getRepoInfo(owner!, repo!);

      // Check if this analysis is still current
      if (currentAnalysisId !== analysisIdRef.current) return;

      if (repoInfo.private) {
        setError('This repository is private. SkillProof only works with public repositories.');
        setState('error');
        return;
      }

      // Step 3: Collect files
      setState('collecting_files');
      setProgress('Discovering repository files...');

      if (currentAbort.signal.aborted) return;
      const { inspectable, skipped, total, inspectionComplete } = await collectFilesToInspect(owner!, repo!, apiCallCount);

      if (currentAnalysisId !== analysisIdRef.current) return;

      if (inspectable.length === 0) {
        if (total === 0) {
          setError('This repository appears to be empty. No files were found to inspect.');
        } else {
          setError('No inspectable text files were found. The repository may contain only binary files, generated artifacts, or files in excluded directories.');
        }
        setState('error');
        return;
      }

      // Step 4: Read file contents
      setState('reading_files');
      const filesWithContent: { file: { name: string; path: string; html_url: string }; content: string }[] = [];
      let filesFailedToLoad = 0;

      for (let i = 0; i < inspectable.length; i++) {
        if (currentAbort.signal.aborted) return;

        const file = inspectable[i];
        setProgress(`Reading file ${i + 1} of ${inspectable.length}...`);

        if (file.download_url) {
          const content = await getFileContent(file.download_url, apiCallCount);
          if (content) {
            filesWithContent.push({
              file: { name: file.name, path: file.path, html_url: file.html_url },
              content,
            });
          } else {
            filesFailedToLoad++;
          }
        } else {
          filesFailedToLoad++;
        }
      }

      if (currentAnalysisId !== analysisIdRef.current) return;

      if (filesWithContent.length === 0) {
        setError('Unable to read any file contents. This may be due to API rate limits or network issues. Please try again in a few minutes.');
        setState('error');
        return;
      }

      // Step 5: Analyze skills
      setState('analyzing');
      setProgress('Analyzing files for skill evidence...');

      if (currentAbort.signal.aborted) return;
      const skills = await analyzeSkills(
        owner!,
        repo!,
        selectedSkills,
        filesWithContent,
        total,
        inspectable.length,
        inspectionComplete
      );

      if (currentAnalysisId !== analysisIdRef.current) return;

      const result: AnalysisResult = {
        repoUrl: repoInfo.html_url,
        owner: owner!,
        repo: repo!,
        defaultBranch: repoInfo.default_branch,
        skills,
        inspectionSummary: {
          totalFilesInRepo: total,
          filesInspected: inspectable.length,
          filesSkipped: skipped,
          filesFailedToLoad,
          inspectionTimestamp: new Date().toISOString(),
          apiCallsMade: apiCallCount.count,
          inspectionComplete,
        },
      };

      setState('complete');
      onComplete(result);
    } catch (err) {
      if (currentAnalysisId !== analysisIdRef.current) return;

      if (err instanceof Error) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please check your connection and try again.');
      }
      setState('error');
    }
  }, [repoUrl, selectedSkills, onComplete]);

  const isRunning = state !== 'idle' && state !== 'error' && state !== 'complete';

  const stateMessages: Record<AnalysisState, string> = {
    idle: '',
    validating: 'Validating repository URL...',
    fetching_repo: 'Fetching repository information...',
    collecting_files: 'Discovering repository files...',
    reading_files: progress || 'Reading file contents...',
    analyzing: 'Analyzing files for skill evidence...',
    error: '',
    complete: '',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Analyze a Repository</h1>
        <p className="text-slate-600 text-lg">
          Submit a public GitHub repository URL and select the skills you want evidence for.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* URL Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label htmlFor="repo-url" className="block text-sm font-semibold text-slate-700 mb-2">
            GitHub Repository URL
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Only public repositories on github.com are supported. Example: https://github.com/owner/repo
          </p>
          <input
            id="repo-url"
            type="url"
            value={repoUrl}
            onChange={e => { setRepoUrl(e.target.value); setError(''); }}
            placeholder="https://github.com/username/repository"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
            disabled={isRunning}
            aria-describedby="url-help"
          />
          <p id="url-help" className="text-xs text-slate-400 mt-2">
            Accepted formats: https://github.com/owner/repo, https://github.com/owner/repo.git
          </p>
        </div>

        {/* Skill Selection */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Technical Skills (up to 8)
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Choose the skills you want SkillProof to look for evidence of in the repository.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Technical skills">
            {TECHNICAL_SKILLS.map(skill => {
              const isSelected = selectedSkills.includes(skill);
              const isDisabled = !isSelected && selectedSkills.length >= 8;
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  disabled={isDisabled || isRunning}
                  aria-pressed={isSelected}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : isDisabled
                      ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">
              {selectedSkills.length} of 8 skills selected
            </p>
            {selectedSkills.length > 0 && (
              <button
                type="button"
                onClick={() => { setSelectedSkills([]); setLimitWarning(''); }}
                disabled={isRunning}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
              >
                Clear all
              </button>
            )}
          </div>
          {limitWarning && (
            <p className="text-xs text-amber-600 mt-2 font-medium" role="alert">
              ⚠️ {limitWarning}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && state === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  You can correct the URL or skill selection and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Display */}
        {isRunning && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              <p className="text-sm font-medium text-indigo-800">
                {stateMessages[state]}
              </p>
            </div>
            <p className="text-xs text-indigo-600 mt-2 ml-8">
              This may take a moment depending on repository size.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isRunning}
          className="w-full bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg shadow-sm"
        >
          {isRunning ? 'Analyzing...' : 'Analyze Repository'}
        </button>
      </form>

      {/* Info box */}
      <div className="mt-8 bg-slate-100 rounded-xl p-5 border border-slate-200">
        <h3 className="font-semibold text-slate-700 mb-2 text-sm">🔒 Privacy & Security</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• Only public GitHub repositories are accessed via the official GitHub REST API.</li>
          <li>• No code from the repository is executed, installed, or run.</li>
          <li>• Binary files, oversized files, and potentially sensitive files are automatically skipped.</li>
          <li>• File inspection is bounded (max 50 files, max 30 API calls) for safety and performance.</li>
          <li>• No data is stored — analysis happens in your browser session only.</li>
          <li>• Request timeouts and redirect blocking prevent unauthorized data access.</li>
        </ul>
      </div>
    </div>
  );
}
