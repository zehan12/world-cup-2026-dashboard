interface HeaderProps {
  totalMatches: number;
  matchesTodayCount: number;
  upcomingMatchesCount: number;
  currentRound: string;
  isFresh: boolean;
}

export default function Header({
  totalMatches,
  matchesTodayCount,
  upcomingMatchesCount,
  currentRound,
  isFresh
}: HeaderProps) {
  return (
    <header className="relative py-16 px-6 min-h-[100dvh] pb-24 flex items-end border-b border-white/5 overflow-hidden bg-[#0f0f0f]">
      {/* Background Image Container - Full Image without Backdrop/Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="/hero.jpg" 
          alt="World Cup 2026 Hero" 
          className="w-full h-full object-cover object-center"
        />
        {/* Bottom-up local gradient backdrop to make text readable at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
      </div>

      <div className="w-full max-w-[1180px] mx-auto z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-end pb-8">
        {/* Left Column: Title & Text content positioned at bottom-left */}
        <div className="md:col-span-7 space-y-4 text-left">
          <div className="font-mono text-xs tracking-[0.25em] text-[#2DE89A] uppercase flex flex-wrap items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2DE89A] pulse-ring"></span>
            <span>FIFA World Cup 26 · USA · Canada · Mexico</span>
            <span className="text-white/20">|</span>
            <span className={`flex items-center gap-1.5 transition-colors duration-300 ${isFresh ? 'text-[#2DE89A]' : 'text-muted-foreground/60'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFresh ? 'bg-[#2DE89A]' : 'bg-muted-foreground/60'}`}></span>
              {isFresh ? "Live Connected" : "Offline Schedule"}
            </span>
          </div>
          
          <h1 className="font-bold text-[clamp(36px,5.5vw,68px)] leading-[0.95] tracking-wide uppercase select-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Every Match. <br />
            <span className="text-[#F0B33A]">One Screen.</span>
          </h1>
          
          <p className="text-muted-foreground text-[14px] md:text-[15px] max-w-[580px] leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            All 104 matches — kickoff times in your local timezone, live scores, and match details. June 11 – July 19, 2026.
          </p>
        </div>

        {/* Right Column: Floating Stats Card mimicking Subscription Card style */}
        <div className="md:col-span-5 flex justify-end w-full">
          <div className="backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl overflow-hidden max-w-[340px] w-full shadow-2xl">
            {/* Solid White Banner Header */}
            <div className="bg-white text-black px-5 py-3 font-mono text-[10px] tracking-wider uppercase font-bold">
              Tournament Status
            </div>
            
            {/* Card Body */}
            <div className="p-5 grid grid-cols-2 gap-4 items-center">
              {/* Left Part: Today's Matches */}
              <div className="border-r border-white/10 pr-4">
                <span className="text-[9px] tracking-wider text-muted-foreground uppercase font-mono block">Today</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold text-[#F0B33A] leading-none">{matchesTodayCount}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-mono">Matches</span>
                </div>
              </div>
              
              {/* Right Part: List details */}
              <div className="pl-2 space-y-2 font-mono text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                  <span>Total: <strong className="text-foreground">{totalMatches}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                  <span>Upcoming: <strong className="text-foreground">{upcomingMatchesCount}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DE89A]"></span>
                  <span className="truncate">Stage: <strong className="text-[#2DE89A]">{currentRound}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animated Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/40 text-[9px] uppercase font-mono tracking-[0.25em] select-none pointer-events-none">
        <span>Scroll to view</span>
        <svg className="w-4 h-4 animate-bounce text-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </header>
  );
}
