export default function Footer() {
  return (
    <footer className="w-full max-w-[1180px] mx-auto px-6 py-8 border-t border-white/5 mt-16 text-xs text-muted-foreground/60 leading-relaxed">
      <p className="mt-2.5">
        Times are resolved in your selected timezone. Late "12:00 AM ET" kickoffs are shown under the prior matchday (following tournament guidelines) but resolve to the correct next day locally when shifted. Knockout matchups list seeding (e.g. <strong>1C</strong> = Group C winner, <strong>2F</strong> = Group F runner-up, <strong>3rd</strong> = a qualifying third-place team) until teams are confirmed. Schedule subject to change.
      </p>
      <div className="mt-6 pt-6 border-t border-white/5 font-mono text-[11px] flex flex-wrap gap-x-2 gap-y-1 items-center justify-between">
        <div>
          Made with <span className="animate-pulse inline-block mx-1">❤️</span> by <a href="https://zehankhan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-foreground font-semibold hover:text-fox hover:underline underline-offset-2 transition-colors">Zehan</a>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground/60">
          <a href="https://github.com/zehan12/world-cup-2026-dashboard" target="_blank" rel="noopener noreferrer" className="hover:text-fox text-muted-foreground transition-colors font-medium underline underline-offset-2">zehan12/world-cup-2026-dashboard</a>
          <span>·</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
