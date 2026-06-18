import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/data/matches";
import { FLAGS } from "@/data/matches";
import { fmtTime } from "@/lib/date-helpers";

interface MatchCardProps {
  m: Match;
  tz: string;
}

export default function MatchCard({ m, tz }: MatchCardProps) {
  const st = m._st || "up";
  const timeDetail = fmtTime(m, tz);
  const isLive = st === "live";
  const isCompleted = st === "ft";

  const tvClass = m.tv === "FOX" 
    ? "bg-[#2DE89A] text-[#06231a]" 
    : m.tv === "FS1" 
      ? "bg-[#5AA9FF] text-[#06182e]" 
      : "border border-white/10 text-[#8493AD] bg-white/5";

  const esClass = m.es === "Universo" 
    ? "text-[#F2B27A] border border-[#F2A65A]/42 bg-[#F2A65A]/10" 
    : "text-[#C9B8FF] border border-[#9A82FF]/42 bg-[#9A82FF]/10";

  const homeTeam = m.h || m._th;
  const awayTeam = m.a || m._ta;

  // Live Score Overlay vs Static fallback
  const hasLiveScore = m._scoreH != null && m._scoreA != null;
  const scoreStr = hasLiveScore 
    ? `${m._scoreH}-${m._scoreA}` 
    : m.res ? m.res : null;

  return (
    <Card 
      className={`border transition-all duration-300 bg-[#111A2B] ${isLive ? 'border-[#F0524B]/55 bg-gradient-to-r from-[#F0524B]/5 via-[#111A2B] to-[#111A2B]' : 'border-white/5 hover:border-white/10'} ${isCompleted ? 'opacity-65' : ''}`}
    >
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-4 items-center">
        
        {/* Left: Kickoff Time */}
        <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-white/5 pb-2.5 sm:pb-0 sm:pr-4">
          <span className={`font-mono font-bold text-[16px] ${isLive ? 'text-[#F0524B]' : 'text-white'}`}>
            {timeDetail.time}
          </span>
          {timeDetail.zone && (
            <span className="font-mono text-[9px] tracking-widest text-[#5E6C84] uppercase">
              {timeDetail.zone}
            </span>
          )}
        </div>

        {/* Middle: Teams details */}
        <div className="min-w-0">
          {homeTeam ? (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Home Team */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl leading-none select-none saturate-110">
                  {FLAGS[homeTeam] || "⚽"}
                </span>
                <span className="font-bold text-lg sm:text-xl tracking-wide uppercase truncate">
                  {homeTeam}
                </span>
              </div>

              {/* Score or VS */}
              {scoreStr ? (
                <span className="font-mono font-bold text-sm sm:text-base text-[#2DE89A] px-2.5 py-1 bg-white/5 border border-white/10 rounded-md">
                  {scoreStr}
                </span>
              ) : (
                <span className="font-mono text-xs text-[#5E6C84] tracking-wider select-none">
                  vs
                </span>
              )}

              {/* Away Team */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-bold text-lg sm:text-xl tracking-wide uppercase truncate">
                  {awayTeam}
                </span>
                <span className="text-xl sm:text-2xl leading-none select-none saturate-110">
                  {FLAGS[awayTeam || ""] || "⚽"}
                </span>
              </div>
            </div>
          ) : (
            <div className="font-bold text-lg sm:text-xl tracking-wide uppercase text-[#C7D2E6]">
              {m.desc}
            </div>
          )}

          {/* Venue & Stage Info */}
          <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs">
            <Badge variant="outline" className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded ${m.grp.startsWith("Group") ? 'text-[#1FB87A] border-[#1FB87A]/35' : 'text-[#F0B33A] border-[#F0B33A]/35'}`}>
              {m.grp}
            </Badge>
            <span className="text-[#8493AD] flex items-center gap-1 select-none">
              <MapPin className="size-3 text-[#8493AD]/60" />
              {m.v}
            </span>
          </div>
        </div>

        {/* Right: Broadcast & Status */}
        <div className="flex flex-col sm:items-end justify-center gap-2 sm:text-right border-t sm:border-t-0 border-white/5 pt-2.5 sm:pt-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-xs tracking-wider uppercase px-2.5 py-1 rounded-md font-sans select-none ${tvClass}`}>
              {m.tv}
            </span>
            <span className={`font-mono text-[9px] tracking-wide px-2 py-1 rounded-md select-none ${esClass}`}>
              {m.es}
            </span>
          </div>

          <span className="font-mono text-[10px] text-[#8493AD] tracking-wider">
            Stream: <span className="text-[#B9C6DC] font-semibold">FOX One</span> · Peacock · Fubo
          </span>

          {/* Match Status indicator */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {isLive ? (
              <span className="font-mono text-[10px] tracking-wider uppercase text-[#F0524B] flex items-center gap-1.5 font-bold">
                <span className="size-1.5 rounded-full bg-[#F0524B] pulse-red"></span>
                LIVE {m._detail ? `· ${m._detail}` : ""}
              </span>
            ) : isCompleted ? (
              <span className="font-mono text-[10px] tracking-wider uppercase text-[#1FB87A] font-bold">
                FULL TIME
              </span>
            ) : (
              <span className="font-mono text-[10px] tracking-wider uppercase text-[#5E6C84]">
                UPCOMING
              </span>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
