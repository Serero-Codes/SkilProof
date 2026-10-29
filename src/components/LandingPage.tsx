interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Show the work behind your skills
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-8 leading-relaxed">
              SkillProof inspects your public GitHub repository and identifies potential evidence 
              of your technical skills — transparently, with clear limitations.
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze a Repository
            </button>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
            The Problem SkillProof Addresses
          </h2>
          <p className="text-slate-600 text-center leading-relaxed mb-8 max-w-2xl mx-auto">
            Graduates often struggle to demonstrate their technical skills beyond listing them on a CV. 
            Recruiters and educators need ways to understand the <em>work behind the skills</em> — 
            not just the claims. SkillProof provides a transparent starting point for these conversations 
            by examining publicly available repository artifacts.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            Who SkillProof Is For
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">🎓</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Graduates & Students</h3>
              <p className="text-sm text-slate-600">
                Use your public GitHub work as a starting point for skills conversations 
                with career advisors, mentors, or potential employers.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">👩‍🏫</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Educators & Advisors</h3>
              <p className="text-sm text-slate-600">
                Help students understand how their project work connects to technical skills, 
                and identify areas for further development.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">💼</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Career Development</h3>
              <p className="text-sm text-slate-600">
                Explore how your repository artifacts relate to the skills you claim, 
                and identify gaps to address in your portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            How the Inspection Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Submit URL & Skills</h3>
              <p className="text-xs text-slate-600">
                Enter a public GitHub repository URL and select up to 8 technical skills.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Discover Files</h3>
              <p className="text-xs text-slate-600">
                The GitHub API lists eligible files. Binaries, secrets, and oversized files are skipped.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Pattern Matching</h3>
              <p className="text-xs text-slate-600">
                Transparent, deterministic rules check for relevant patterns in each file.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-amber-600">4</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Evidence Report</h3>
              <p className="text-xs text-slate-600">
                Results show findings with source links, snippets, categories, and clear limitations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Need */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
            What You Need Before Starting
          </h2>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>A <strong>public</strong> GitHub repository URL (private repos cannot be accessed)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>The repository should contain source code, configuration files, or project artifacts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>Selection of up to 8 technical skills you want to investigate</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>No GitHub account or API key required — works with unauthenticated public access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                <span>Note: GitHub limits unauthenticated requests to 60 per hour. If you hit this limit, wait a few minutes.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Results Mean */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            What the Results Mean
          </h2>
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-800 text-sm">Evidence Found</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Potentially relevant patterns were detected. This suggests possible supporting evidence 
                but does <strong>not</strong> establish authorship, proficiency, or job readiness.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 text-sm">Not Found in Inspected Files</h3>
              <p className="text-xs text-gray-600 mt-1">
                No matching patterns in the files examined. This does <strong>not</strong> mean the person 
                lacks the skill — evidence may exist in uninspected files or elsewhere.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 text-sm">Needs Further Assessment</h3>
              <p className="text-xs text-amber-700 mt-1">
                Available artifacts are insufficient for a meaningful conclusion. Additional examination 
                or practical assessment would be needed.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 text-sm">Inspection Incomplete</h3>
              <p className="text-xs text-red-700 mt-1">
                The inspection did not complete sufficiently for a reliable conclusion. Results should 
                not be relied upon without further investigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important disclaimers */}
      <section className="py-16 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            ⚠️ What SkillProof Cannot Establish
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-amber-100">
              <h3 className="font-semibold text-emerald-700 mb-3">✅ SkillProof IS:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  An evidence-support tool for graduate employability
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  A starting point for skills conversations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Transparent about its methods and limitations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Focused on public repositories only
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-amber-100">
              <h3 className="font-semibold text-red-700 mb-3">❌ SkillProof is NOT:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  A recruitment or hiring platform
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  A candidate-ranking or filtering tool
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  A formal certification or guarantee of proficiency
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  Proof of authorship or independent ability
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  An automatic hiring or rejection system
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-xl p-5 border border-amber-200">
            <p className="text-sm text-slate-700 leading-relaxed text-center">
              <strong>Repository evidence is only an indicator for further examination.</strong> It does not 
              establish technical proficiency, code quality, or suitability for any particular role. 
              Finding a keyword or code pattern does not prove proficiency. Failing to find evidence 
              does not prove that a person lacks a skill.
            </p>
          </div>
        </div>
      </section>

      {/* Supported skills */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            Supported Technical Skills
          </h2>
          <p className="text-center text-slate-600 text-sm mb-6 max-w-2xl mx-auto">
            Each skill has transparent detection rules based on file types, filenames, and content patterns. 
            No AI or LLM is used — all detection is deterministic and reproducible.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Python', 'JavaScript', 'TypeScript', 'Java', 'C/C++',
              'React', 'SQL', 'Git', 'Docker', 'HTML/CSS',
              'Node.js', 'REST APIs', 'Data Analysis', 'Machine Learning',
              'Testing', 'CI/CD', 'Cloud (AWS/GCP/Azure)', 'Linux/Shell',
              'MongoDB/NoSQL', 'Algorithms',
            ].map(skill => (
              <span
                key={skill}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to explore your evidence?</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Submit a public GitHub repository and see what SkillProof finds.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-400 transition-colors text-lg"
          >
            Get Started →
          </button>
        </div>
      </section>
    </div>
  );
}
