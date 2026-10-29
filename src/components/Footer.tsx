export function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 border-t border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-white">SkillProof</span>
            </div>
            <p className="text-sm text-slate-400">
              Show the work behind your skills. An evidence-support prototype for graduate employability.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-2">Disclaimer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SkillProof is not a recruitment platform, hiring tool, or certification body. 
              "Evidence found" does not prove authorship, proficiency, or job readiness. 
              "Not found" does not indicate lack of skill. Results require human interpretation 
              and should not be used for automated decisions.
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            SkillProof Prototype — No data is stored. All analysis happens in your browser.
          </p>
          <p className="text-xs text-slate-500">
            Built with transparency and fairness in mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
