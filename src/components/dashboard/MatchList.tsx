import { Badge } from "@/components/ui/badge";
import type { Match } from "@/data/matches";
import { fmtDay } from "@/lib/date-helpers";
import { useFilterStore } from "@/store";
import MatchCard from "./MatchCard";

interface MatchListProps {
  days: string[];
  groupedMatches: Record<string, Match[]>;
  todayStr: string;
  filteredMatchesCount: number;
}

export default function MatchList({
  days,
  groupedMatches,
  todayStr,
  filteredMatchesCount
}: MatchListProps) {
  const tz = useFilterStore((s) => s.tz);

  return (
    <main className="flex-1 max-w-[1180px] w-full mx-auto px-6 mt-2">
      {/* Count Label */}
      <div className="font-mono text-xs text-muted-foreground/60 tracking-widest uppercase py-4 border-b border-white/5">
        {filteredMatchesCount} Match{filteredMatchesCount !== 1 ? "es" : ""} Shown
      </div>

      {/* Matches List */}
      <div className="flex flex-col gap-2 mt-4 pb-12">
        {days.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="font-bold text-2xl uppercase text-foreground mb-2">No Matches Found</div>
            Try clearing a filter or searching a different team/city.
          </div>
        ) : (
          days.map(d => {
            const dayHelper = fmtDay(d);
            const isToday = d === todayStr;
            const matchesOfDay = groupedMatches[d].sort((a, b) => a.sk - b.sk);

            return (
              <section 
                key={d} 
                className={`daygroup mt-6 scroll-mt-[190px] md:scroll-mt-[140px] ${isToday ? "daygroup-today" : ""}`}
              >
                {/* Sticky Date Header */}
                <div className="sticky top-[162px] md:top-[112px] z-10 py-3 mb-3 flex items-baseline gap-3 bg-gradient-to-b from-background via-background/90 to-transparent">
                  <span className={`font-bold text-2xl uppercase tracking-wider ${isToday ? "text-gold" : "text-foreground"}`}>
                    {dayHelper.dow}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground mr-2">
                    {dayHelper.dt}, 2026
                  </span>
                  
                  {isToday ? (
                    <Badge className="bg-gold/10 border border-gold/40 text-gold hover:bg-gold/15 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full">
                      Today
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground/75 border-white/5 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/3">
                      {matchesOfDay.length} Game{matchesOfDay.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Match Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchesOfDay.map((m, idx) => (
                    <MatchCard 
                      key={`${m.d}-${idx}`}
                      m={m}
                      tz={tz}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
