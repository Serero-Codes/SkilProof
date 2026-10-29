import type { AnalysisResult } from '../types';
import { getStatusLabel, getStatusColor, getCategoryLabel } from '../utils/evidence';

interface ResultsPageProps {
  results: AnalysisResult;
  onNewAnalysis: () => void;
}

export function ResultsPage({ results, onNewAnalysis }: ResultsPageProps) {
  const { skills, inspectionSummary, owner, repo, repoUrl } = results;

  const evidenceCount = skills.filter(s => s.status === 'evidence_found').length;
  const notFoundCount = skills.filter(s => s.status === 'not_found_in_inspected_files').length;
  const needsAssessmentCount = skills.filter(s => s.status === 'needs_further_assessment').length;
  const incompleteCount = skills.filter(s => s.status === 'inspection_incomplete').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Analysis Results</h1>
            <p className="text-slate-600">
              Repository:{' '}
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                {owner}/{repo}
              </a>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Default branch: {results.defaultBranch}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.hash = '#about'}
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 border border-slate-300 px-3 py-2 rounded-lg"
            >
              How to interpret
            </button>
            <button
              onClick={onNewAnalysis}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{evidenceCount}</p>
          <p className="text-xs text-emerald-600 font-medium">Evidence found</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{needsAssessmentCount}</p>
          <p className="text-xs text-amber-600 font-medium">Needs assessment</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{incompleteCount}</p>
          <p className="text-xs text-red-600 font-medium">Incomplete</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{notFoundCount}</p>
          <p className="text-xs text-gray-500 font-medium">Not found</p>
        </div>
      </div>

      {/* Inspection Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Inspection Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Files in repo</p>
            <p className="font-semibold text-slate-800">{inspectionSummary.totalFilesInRepo}</p>
          </div>
          <div>
            <p className="text-slate-500">Files inspected</p>
            <p className="font-semibold text-slate-800">{inspectionSummary.filesInspected}</p>
          </div>
          <div>
            <p className="text-slate-500">Files skipped</p>
            <p className="font-semibold text-slate-800">{inspectionSummary.filesSkipped}</p>
          </div>
          <div>
            <p className="text-slate-500">Failed to load</p>
            <p className="font-semibold text-slate-800">{inspectionSummary.filesFailedToLoad}</p>
          </div>
          <div>
            <p className="text-slate-500">API calls</p>
            <p className="font-semibold text-slate-800">{inspectionSummary.apiCallsMade}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            inspectionSummary.inspectionComplete
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {inspectionSummary.inspectionComplete ? '✓ Inspection complete' : '⚠ Inspection limited'}
          </span>
          <span className="text-xs text-slate-500">
            Performed at: {new Date(inspectionSummary.inspectionTimestamp).toLocaleString()}
          </span>
        </div>
        {!inspectionSummary.inspectionComplete && (
          <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-100">
            <strong>Inspection was limited.</strong> Not all repository files could be examined due to
            inspection bounds (max 50 files, max 30 API calls). Results for some skills may be incomplete.
            This does not mean evidence doesn't exist — it may be in uninspected files.
          </p>
        )}
      </div>

      {/* Skills Results */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800">Skill-by-Skill Results</h2>

        {skills.map(skillResult => (
          <div
            key={skillResult.skill}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Skill Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-slate-800">{skillResult.skill}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(skillResult.status)}`}>
                  {getStatusLabel(skillResult.status)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {skillResult.statusExplanation}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {skillResult.filesInspected} files inspected ({skillResult.totalFilesAvailable} total in repo)
                {!skillResult.inspectionComplete && ' — inspection was limited'}
              </p>
            </div>

            {/* Evidence Items */}
            {skillResult.evidence.length > 0 && (
              <div className="p-5 space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Evidence found:</h4>
                {skillResult.evidence.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-slate-700">{item.filePath}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <a
                        href={item.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline flex-shrink-0"
                      >
                        View on GitHub ↗
                      </a>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 italic">{item.relevance}</p>
                    {item.snippet && (
                      <pre className="text-xs bg-white border border-slate-200 rounded p-2 overflow-x-auto text-slate-700 font-mono whitespace-pre-wrap break-all">
                        {item.snippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No evidence message */}
            {skillResult.evidence.length === 0 && skillResult.status === 'not_found_in_inspected_files' && (
              <div className="p-5 bg-gray-50">
                <p className="text-sm text-gray-600">
                  No matching patterns were found in the inspected files for this skill.
                </p>
              </div>
            )}

            {/* Limitations */}
            <div className="p-5 bg-slate-50 border-t border-slate-100">
              <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Limitations & Notes</h4>
              <ul className="space-y-1">
                {skillResult.limitations.map((lim, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">•</span>
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Final Disclaimer */}
      <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3 text-sm">⚠️ Important Disclaimers</h3>
        <ul className="text-xs text-amber-700 space-y-1.5">
          <li>• <strong>"Evidence found"</strong> means a potentially relevant pattern was detected. It does <strong>not</strong> prove authorship, independent proficiency, correctness, or job readiness.</li>
          <li>• <strong>"Not found"</strong> does <strong>not</strong> mean the person lacks the skill. Evidence may exist in uninspected files or in work not captured in this repository.</li>
          <li>• <strong>"Needs further assessment"</strong> means the available artifacts are insufficient for a meaningful conclusion without additional examination.</li>
          <li>• <strong>"Inspection incomplete"</strong> means the inspection did not complete sufficiently for a reliable conclusion.</li>
          <li>• SkillProof is not a recruitment platform, hiring tool, certification, or guarantee of employability.</li>
          <li>• Results should be used only as a starting point for further human assessment and conversation.</li>
          <li>• More evidence matches do not automatically mean greater capability than fewer matches.</li>
          <li>• Inspection is bounded: not all repository files may have been examined.</li>
        </ul>
      </div>
    </div>
  );
}
