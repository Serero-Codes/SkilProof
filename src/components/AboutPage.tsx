export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">How SkillProof Works</h1>

      {/* Purpose */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Purpose</h2>
        <p className="text-slate-600 leading-relaxed">
          SkillProof is a small evidence-support prototype designed to help graduates demonstrate 
          the work behind their technical skills. By inspecting a public GitHub repository, it 
          identifies patterns and artifacts that may serve as starting points for skills conversations 
          in employability contexts.
        </p>
        <p className="text-slate-600 leading-relaxed mt-3">
          It is <strong>not</strong> a recruitment platform, candidate-ranking tool, automatic 
          hiring/rejection system, formal certification, or guarantee of employability.
        </p>
      </section>

      {/* Methodology */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Methodology</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="font-medium text-slate-700 mb-1">1. Input Validation</h3>
            <p className="text-sm text-slate-600">
              Only HTTPS URLs with the exact <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">github.com</code> host 
              are accepted. The owner and repository name are independently validated against GitHub's naming rules. 
              No arbitrary URLs are ever fetched.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-1">2. Repository Discovery</h3>
            <p className="text-sm text-slate-600">
              The GitHub REST API is used to fetch repository metadata and directory listings. 
              API URLs are always constructed from validated owner/repo names — never from raw user input.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-1">3. Bounded File Inspection</h3>
            <p className="text-sm text-slate-600">
              Files are collected up to a depth of 3 directories and a maximum of 50 files. 
              Binary files, oversized files (&gt;100KB), generated files (lock files, minified code), 
              and potentially sensitive files (.env, keys, credentials) are automatically skipped. 
              A hard cap of 30 API calls prevents runaway requests.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-1">4. Deterministic Pattern Matching</h3>
            <p className="text-sm text-slate-600">
              Each skill has a set of transparent rules: relevant file extensions, relevant filenames, 
              and content patterns (regex). When a pattern matches, it generates an evidence item with 
              the file path, a snippet, and a relevance description. No AI or LLM is used — all 
              detection is rule-based and reproducible.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700 mb-1">5. Evidence Status Assignment</h3>
            <p className="text-sm text-slate-600">
              Each skill receives one of four statuses:
            </p>
            <ul className="text-sm text-slate-600 mt-2 space-y-1 ml-4">
              <li><strong className="text-emerald-700">Evidence found</strong> — at least one potentially relevant pattern was detected</li>
              <li><strong className="text-gray-600">Not found in inspected files</strong> — no matching patterns in the files examined</li>
              <li><strong className="text-amber-700">Needs further assessment</strong> — inspection was limited or evidence was ambiguous</li>
              <li><strong className="text-red-700">Inspection incomplete</strong> — the inspection could not be completed (e.g., API errors)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Security & Privacy</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>URL validation:</strong> Only <code className="bg-slate-100 px-1 rounded text-xs">https://github.com/owner/repo</code> format accepted. Backend-independent validation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>No code execution:</strong> Repository code is never executed, imported, installed, or run. Content is read as text only.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>Bounded requests:</strong> Maximum 30 API calls, 50 files inspected, 100KB per file, 10-second timeouts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>File filtering:</strong> Binaries, generated files, lock files, and sensitive files (.env, keys) are skipped.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>Safe rendering:</strong> All repository content is displayed as escaped text — never rendered as HTML or executed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>No secrets exposure:</strong> Tokens, API keys, and credentials in files are never logged or transmitted beyond the browser session.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>No data storage:</strong> Analysis happens entirely in the user's browser. No data is sent to or stored on any server.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">✓</span>
              <span><strong>Public repos only:</strong> Private repositories are rejected. No authentication tokens are required or stored.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Fairness */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Fairness & Limitations</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <ul className="space-y-2 text-sm text-amber-800">
            <li>• Evidence detection is pattern-based and may produce false positives (patterns that look like skill usage but aren't) or false negatives (genuine skill usage not captured by current rules).</li>
            <li>• Repository structure and file organization vary widely; some skilled developers may have evidence in formats or locations not covered by current rules.</li>
            <li>• The bounded inspection (50 files max) means large repositories may have significant uninspected areas.</li>
            <li>• Code in a public repository may be copied, generated, or collaborative — evidence does not prove individual authorship or proficiency.</li>
            <li>• SkillProof should never be used as the sole basis for hiring, rejection, or ranking decisions.</li>
            <li>• The tool does not assess code quality, correctness, or best practices — only the presence of relevant patterns.</li>
          </ul>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Technical Implementation</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p className="font-medium text-slate-700 mb-1">Frontend</p>
              <p>React + TypeScript + Vite + Tailwind CSS</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">API</p>
              <p>GitHub REST API (unauthenticated, public repos)</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">Evidence Engine</p>
              <p>Client-side deterministic pattern matching</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">Data Storage</p>
              <p>None — all processing in-browser</p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Status Definitions */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Evidence Status Definitions</h2>
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-800 text-sm">Evidence Found</h3>
            <p className="text-xs text-emerald-700 mt-1">
              A potentially relevant pattern or artifact was found in inspected material. This suggests 
              the skill may be present but does <strong>not</strong> prove authorship, independent proficiency, 
              correctness, or job readiness.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 text-sm">Not Found in Inspected Files</h3>
            <p className="text-xs text-gray-600 mt-1">
              No matching patterns were found in the files that were inspected. This does <strong>not</strong> mean 
              the person lacks the skill — evidence may exist in uninspected files or in work not captured 
              in this repository.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 text-sm">Needs Further Assessment</h3>
            <p className="text-xs text-amber-700 mt-1">
              Evidence is ambiguous or insufficient to draw any conclusion. This may occur when inspection 
              was limited (not all files examined) or when patterns found are too generic to be meaningful.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 text-sm">Inspection Incomplete</h3>
            <p className="text-xs text-red-700 mt-1">
              The inspection could not be completed due to technical limitations (e.g., API rate limits, 
              timeouts, network errors). Results should not be relied upon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
