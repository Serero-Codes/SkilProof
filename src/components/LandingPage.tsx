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

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            How SkillProof Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">1. Submit Your Repo</h3>
              <p className="text-slate-600">
                Enter a public GitHub repository URL and select up to 8 technical skills you'd like evidence for.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Automated Inspection</h3>
              <p className="text-slate-600">
                SkillProof uses the GitHub API to inspect repository files with transparent, deterministic rules. No AI, no guessing.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">3. Evidence Report</h3>
              <p className="text-slate-600">
                Receive a clear report showing potential evidence with source links, limitations, and honest status indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Important disclaimers */}
      <section className="py-16 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            ⚠️ Important: What SkillProof Is and Isn't
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
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Supported skills */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            Supported Technical Skills
          </h2>
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
