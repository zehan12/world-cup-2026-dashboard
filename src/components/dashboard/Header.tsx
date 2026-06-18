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
          All 104 matches — kickoff times in your timezone, the channel they're on, and every place to stream them. June 11 – July 19, 2026.
        </p>
        
        {/* Stats Badges */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 mt-8 font-mono">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white leading-tight">{totalMatches}</span>
            <span className="text-[10px] tracking-wider text-[#5E6C84] uppercase">Total Matches</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#F0B33A] leading-tight">{matchesTodayCount}</span>
            <span className="text-[10px] tracking-wider text-[#5E6C84] uppercase">Today</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white leading-tight">{upcomingMatchesCount}</span>
            <span className="text-[10px] tracking-wider text-[#5E6C84] uppercase">Upcoming</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#2DE89A] leading-tight">{currentRound}</span>
            <span className="text-[10px] tracking-wider text-[#5E6C84] uppercase">Current Round</span>
          </div>
        </div>
      </div>
    </header>
  );
}
