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
    ? "bg-[#2DE89A]/10 text-[#2DE89A] border-[#2DE89A]/30" 
    : m.tv === "FS1" 
      ? "bg-[#5AA9FF]/10 text-[#5AA9FF] border-[#5AA9FF]/30" 
      : "border border-white/10 text-[#8493AD] bg-white/5";

  const esClass = m.es === "Universo" 
    ? "text-[#F2B27A] border border-[#F2A65A]/30 bg-[#F2A65A]/5" 
    : "text-[#C9B8FF] border border-[#9A82FF]/30 bg-[#9A82FF]/5";

  const homeTeam = m.h || m._th;
  const awayTeam = m.a || m._ta;

  // Score parsing for highlights
  let homeScore: string | number | null = null;
  let awayScore: string | number | null = null;
  let hasScore = false;

  if (m._scoreH != null && m._scoreA != null) {
    homeScore = m._scoreH;
    awayScore = m._scoreA;
    hasScore = true;
  } else if (m.res) {
    const parts = m.res.split("-");
    if (parts.length === 2) {
      homeScore = parts[0].trim();
      awayScore = parts[1].trim();
      hasScore = true;
    }
  }

  const hVal = homeScore != null ? parseInt(String(homeScore), 10) : 0;
  const aVal = awayScore != null ? parseInt(String(awayScore), 10) : 0;
  const homeWon = hasScore && hVal > aVal;
  const awayWon = hasScore && aVal > hVal;

  return (
    <Card 
      className={`border transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-[#121A2B] to-[#0E1525] ${
        isLive 
          ? 'border-[#F0524B]/40 shadow-[0_0_15px_rgba(240,82,75,0.05)]' 
          : 'border-white/5 hover:border-white/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:from-[#151F33] hover:to-[#0F1829]'
      } ${isCompleted ? 'opacity-75' : ''}`}
    >
      {/* Top ambient glow line for live matches */}
      {isLive && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F0524B] to-transparent animate-pulse" />
      )}
      
      <CardContent className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] gap-4 sm:gap-6 items-center">
        
        {/* Left Column: Kickoff Time */}
        <div className="flex flex-col gap-1 sm:items-center sm:justify-center border-b sm:border-b-0 sm:border-r border-white/5 pb-3 sm:pb-0 sm:pr-6 min-w-[100px]">
          <span className={`font-mono font-bold text-lg sm:text-xl tracking-tight ${isLive ? 'text-[#F0524B]' : 'text-white'}`}>
            {timeDetail.time}
          </span>
          {timeDetail.zone && (
            <span className="font-mono text-[9px] tracking-widest text-[#5E6C84] uppercase">
              {timeDetail.zone}
            </span>
          )}
        </div>

        {/* Center Column: Teams & Stage */}
        <div className="flex flex-col gap-3 min-w-0">
          {homeTeam ? (
            /* Stacked Teams Scoreboard Layout */
            <div className="flex flex-col gap-2.5 max-w-[400px]">
              {/* Home Team Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl sm:text-3xl leading-none select-none saturate-110 flex-shrink-0">
                    {FLAGS[homeTeam] || "⚽"}
                  </span>
                  <span className={`text-base sm:text-[17px] tracking-wide uppercase truncate ${
                    hasScore 
                      ? homeWon 
                        ? 'font-bold text-white' 
                        : 'text-[#8493AD] font-medium' 
                      : 'font-semibold text-[#EAF0FA]'
                  }`}>
                    {homeTeam}
                  </span>
                </div>
                {hasScore && (
                  <span className={`font-mono text-base sm:text-lg font-bold px-2 py-0.5 rounded min-w-[28px] text-center ${
                    homeWon 
                      ? 'text-[#2DE89A] bg-[#2DE89A]/10 border border-[#2DE89A]/20' 
                      : 'text-[#5E6C84] bg-white/3'
                  }`}>
                    {homeScore}
                  </span>
                )}
              </div>

              {/* Away Team Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl sm:text-3xl leading-none select-none saturate-110 flex-shrink-0">
                    {FLAGS[awayTeam || ""] || "⚽"}
                  </span>
                  <span className={`text-base sm:text-[17px] tracking-wide uppercase truncate ${
                    hasScore 
                      ? awayWon 
                        ? 'font-bold text-white' 
                        : 'text-[#8493AD] font-medium' 
                      : 'font-semibold text-[#EAF0FA]'
                  }`}>
                    {awayTeam}
                  </span>
                </div>
                {hasScore && (
                  <span className={`font-mono text-base sm:text-lg font-bold px-2 py-0.5 rounded min-w-[28px] text-center ${
                    awayWon 
                      ? 'text-[#2DE89A] bg-[#2DE89A]/10 border border-[#2DE89A]/20' 
                      : 'text-[#5E6C84] bg-white/3'
                  }`}>
                    {awayScore}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Knockout Placeholder */
            <div className="font-bold text-base sm:text-lg tracking-widest uppercase text-[#C7D2E6] py-1 bg-white/3 border border-white/5 px-3 rounded-lg w-fit">
              {m.desc}
            </div>
          )}

          {/* stage and Venue details */}
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
            <Badge variant="outline" className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md ${
              m.grp.startsWith("Group") 
                ? 'text-[#2DE89A] border-[#2DE89A]/20 bg-[#2DE89A]/5' 
                : 'text-[#F0B33A] border-[#F0B33A]/20 bg-[#F0B33A]/5'
            }`}>
              {m.grp}
            </Badge>
            <span className="text-[#8493AD] flex items-center gap-1.5 select-none text-[11px] truncate">
              <MapPin className="size-3.5 flex-shrink-0 text-[#5E6C84]" />
              {m.v}
            </span>
          </div>
        </div>

        {/* Right Column: Status & Channels */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3.5 border-t sm:border-t-0 border-white/5 pt-3.5 sm:pt-0 sm:pl-6">
          {/* TV Badges */}
          <div className="flex items-center gap-2">
            <span className={`font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded font-sans select-none border ${tvClass}`}>
              {m.tv}
            </span>
            <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded select-none border ${esClass}`}>
              {m.es}
            </span>
          </div>

          {/* Match Status Pills */}
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="font-mono text-[9px] tracking-wider uppercase text-[#F0524B] flex items-center gap-1.5 font-bold bg-[#F0524B]/10 border border-[#F0524B]/20 px-2.5 py-0.5 rounded-full select-none">
                <span className="size-1.5 rounded-full bg-[#F0524B] pulse-red"></span>
                LIVE {m._detail ? `· ${m._detail}` : ""}
              </span>
            ) : isCompleted ? (
              <span className="font-mono text-[9px] tracking-wider uppercase text-[#2DE89A] font-bold bg-[#2DE89A]/10 border border-[#2DE89A]/20 px-2.5 py-0.5 rounded-full select-none">
                FT
              </span>
            ) : (
              <span className="font-mono text-[9px] tracking-wider uppercase text-[#8493AD] bg-white/3 border border-white/5 px-2.5 py-0.5 rounded-full select-none">
                UPCOMING
              </span>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
