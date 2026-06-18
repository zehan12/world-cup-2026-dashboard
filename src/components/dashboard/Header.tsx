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
    <header className="relative py-16 px-6 min-h-[100dvh] pb-12 flex items-end border-b border-white/5 overflow-hidden bg-[#0f0f0f]">
      {/* Background Image Container - Full Image without Overall Backdrop */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="/hero.jpg" 
          alt="World Cup 2026 Hero" 
          className="w-full h-full object-cover object-center"
        />
        {/* Bottom-up local gradient backdrop to make text readable at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
      </div>

      <div className="w-full max-w-[1180px] mx-auto z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="font-mono text-xs tracking-[0.25em] text-[#2DE89A] uppercase flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2DE89A] pulse-ring"></span>
            FIFA World Cup 26 · USA · Canada · Mexico
          </div>
          
          {/* Live Data Badge */}
          <div className={`font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5 transition-colors duration-300 ${isFresh ? 'text-[#2DE89A]' : 'text-[#5E6C84]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isFresh ? 'bg-[#2DE89A]' : 'bg-[#5E6C84]'}`}></span>
            {isFresh ? "Live Data Connected" : "Static Schedule Only"}
          </div>
        </div>
        
        <h1 className="font-bold text-[clamp(40px,7.5vw,96px)] leading-[0.92] tracking-wide uppercase my-4 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Every Match. <span className="text-[#F0B33A]">One Screen.</span>
        </h1>
        
        <p className="text-[#8493AD] text-[15px] max-w-[640px] leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          All 104 matches — kickoff times in your local timezone, live scores, and match details. June 11 – July 19, 2026.
        </p>
        
        {/* Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-[800px]">
          <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-mono">Total Matches</span>
            <span className="text-3xl font-extrabold text-foreground leading-tight mt-1.5">{totalMatches}</span>
          </div>
          <div className="bg-gold/5 backdrop-blur-sm border border-gold/10 rounded-xl p-3.5 flex flex-col justify-between hover:border-gold/20 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-gold/80 uppercase font-mono">Today</span>
            <span className="text-3xl font-extrabold text-gold leading-tight mt-1.5">{matchesTodayCount}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-mono">Upcoming</span>
            <span className="text-3xl font-extrabold text-foreground leading-tight mt-1.5">{upcomingMatchesCount}</span>
          </div>
          <div className="bg-[#2DE89A]/5 backdrop-blur-sm border border-[#2DE89A]/10 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#2DE89A]/20 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-[#2DE89A]/80 uppercase font-mono">Current Stage</span>
            <span className="text-2xl font-extrabold text-[#2DE89A] leading-tight mt-1.5 truncate">{currentRound}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
