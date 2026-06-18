export default function Footer() {
  return (
    <footer className="w-full max-w-[1180px] mx-auto px-6 py-8 border-t border-white/5 mt-16 text-xs text-[#5E6C84] leading-relaxed">
      <p>
        <strong className="text-[#8493AD]">Watch Options.</strong> Every match airs in English on FOX or FS1 and streams on FOX One and the FOX Sports app. Spanish-language coverage runs on Telemundo and Universo and streams on Peacock. Fubo carries all 104 games. Per-match channels are the announced English-language assignments.
      </p>
      <p className="mt-2.5">
        Times are resolved in your selected timezone. Late "12:00 AM ET" kickoffs are shown under the prior matchday (following tournament guidelines) but resolve to the correct next day locally when shifted. Knockout matchups list seeding (e.g. <strong>1C</strong> = Group C winner, <strong>2F</strong> = Group F runner-up, <strong>3rd</strong> = a qualifying third-place team) until teams are confirmed. Schedule subject to change.
      </p>
      <div className="mt-6 pt-6 border-t border-white/5 font-mono text-[11px] flex flex-wrap gap-x-2 gap-y-1 items-center justify-between">
        <div>
          Built by <a href="https://hatch.org/" target="_blank" rel="noopener noreferrer" className="text-[#8493AD] hover:text-[#2DE89A] underline underline-offset-2 transition-colors">Steve Hatch</a> with <a href="https://claude.com/claude-code" target="_blank" rel="noopener noreferrer" className="text-[#8493AD] hover:text-[#2DE89A] underline underline-offset-2 transition-colors">Claude</a>. Re-engineered to React &amp; Shadcn.
        </div>
        <div className="flex items-center gap-2 text-[#5E6C84]">
          <a href="https://github.com/shatch/world-cup-2026-dashboard" target="_blank" rel="noopener noreferrer" className="hover:text-[#2DE89A] transition-colors">Source on GitHub</a>
          <span>·</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
