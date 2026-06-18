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
    <header 
      className="relative py-12 px-6 min-h-[340px] flex items-center border-b border-white/5 overflow-hidden"
      style={{
        background: `
          linear-gradient(90deg, rgba(10,15,28,0.96) 0%, rgba(10,15,28,0.85) 34%, rgba(10,15,28,0.45) 66%, rgba(10,15,28,0.55) 100%),
          linear-gradient(180deg, transparent 42%, rgba(10,15,28,0.65) 100%),
          radial-gradient(900px 240px at 12% -40%, rgba(31,184,122,0.18), transparent 70%),
          url('/hero.jpg') center right / cover no-repeat,
          #0E1525
        `
      }}
    >
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
        
        <h1 className="font-bold text-[clamp(40px,7.5vw,96px)] leading-[0.92] tracking-wide uppercase my-4 select-none">
          Every Match. <span className="text-[#F0B33A]">One Screen.</span>
        </h1>
        
        <p className="text-[#8493AD] text-[15px] max-w-[640px] leading-relaxed">
          All 104 matches — kickoff times in your timezone and TV channel listings. June 11 – July 19, 2026.
        </p>
        
        {/* Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-[800px]">
          <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-[#8493AD] uppercase font-mono">Total Matches</span>
            <span className="text-3xl font-extrabold text-white leading-tight mt-1.5">{totalMatches}</span>
          </div>
          <div className="bg-[#F0B33A]/5 backdrop-blur-sm border border-[#F0B33A]/10 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#F0B33A]/20 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-[#F0B33A]/80 uppercase font-mono">Today</span>
            <span className="text-3xl font-extrabold text-[#F0B33A] leading-tight mt-1.5">{matchesTodayCount}</span>
          </div>
          <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/10 transition-colors duration-300">
            <span className="text-[10px] tracking-wider text-[#8493AD] uppercase font-mono">Upcoming</span>
            <span className="text-3xl font-extrabold text-white leading-tight mt-1.5">{upcomingMatchesCount}</span>
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
