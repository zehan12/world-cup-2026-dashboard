import { useState } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/data/matches";
import { FLAGS } from "@/data/matches";
import { fmtTime } from "@/helpers/date-helpers";
import MatchDetailsModal from "./MatchDetailsModal";

interface MatchCardProps {
  m: Match;
  tz: string;
  matches: Match[];
}

export default function MatchCard({ m, tz, matches }: MatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const st = m._st || "up";
  const timeDetail = fmtTime(m, tz);
  const isLive = st === "live";
  const isCompleted = st === "ft";

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
    <>
      <Card 
        onClick={() => setIsModalOpen(true)}
        className={`border transition-all duration-300 relative overflow-hidden cursor-pointer bg-[#121212]/40 backdrop-blur-md ${
          isLive 
            ? 'border-red/40 shadow-[0_0_12px_rgba(255,23,68,0.04)]' 
            : 'border-white/5 hover:border-white/10 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-[#161616]/50'
        } ${isCompleted ? 'opacity-70' : ''}`}
      >
      {/* Top ambient glow line for live matches */}
      {isLive && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red to-transparent animate-pulse" />
      )}
      
      <CardContent className="p-3 sm:py-3 sm:px-4 grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-3 sm:gap-5 items-center">
        
        {/* Left Column: Kickoff Time */}
        <div className="flex flex-col gap-0.5 sm:items-center sm:justify-center border-b sm:border-b-0 sm:border-r border-white/5 pb-2 sm:pb-0 sm:pr-4 min-w-[80px]">
          <span className={`font-mono font-bold text-base sm:text-[17px] tracking-tight ${isLive ? 'text-red' : 'text-foreground/90'}`}>
            {timeDetail.time}
          </span>
          {timeDetail.zone && (
            <span className="font-mono text-[8px] tracking-widest text-muted-foreground/45 uppercase">
              {timeDetail.zone}
            </span>
          )}
        </div>

        {/* Center Column: Teams & Stage */}
        <div className="flex flex-col gap-2 min-w-0">
          {homeTeam ? (
            /* One-Row Scoreboard Layout */
            <div className="flex items-center justify-between w-full gap-3 sm:gap-4 max-w-[500px]">
              {/* Home Team (Left side, right-aligned) */}
              <div className="flex items-center justify-end gap-2 sm:gap-2.5 flex-1 min-w-0">
                <span className={`text-[13px] sm:text-[14px] tracking-wide uppercase truncate text-right ${
                  hasScore 
                    ? homeWon 
                      ? 'font-bold text-foreground' 
                      : 'text-muted-foreground/50 font-medium' 
                    : 'font-semibold text-foreground/80'
                }`}>
                  {homeTeam}
                </span>
                <span className="text-xl sm:text-2xl leading-none select-none saturate-110 flex-shrink-0">
                  {FLAGS[homeTeam] || "⚽"}
                </span>
              </div>

              {/* Score or VS in the middle */}
              <div className="flex-shrink-0 flex items-center justify-center min-w-[64px] sm:min-w-[72px]">
                {hasScore ? (
                  <span className="font-mono text-xs sm:text-sm font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1.5 select-none">
                    <span className={homeWon ? 'text-foreground' : 'text-muted-foreground/50'}>{homeScore}</span>
                    <span className="text-white/20">—</span>
                    <span className={awayWon ? 'text-foreground' : 'text-muted-foreground/50'}>{awayScore}</span>
                  </span>
                ) : (
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground/40 font-bold bg-white/3 border border-white/5 px-2 py-0.5 rounded uppercase">
                    VS
                  </span>
                )}
              </div>

              {/* Away Team (Right side, left-aligned) */}
              <div className="flex items-center justify-start gap-2 sm:gap-2.5 flex-1 min-w-0">
                <span className="text-xl sm:text-2xl leading-none select-none saturate-110 flex-shrink-0">
                  {FLAGS[awayTeam || ""] || "⚽"}
                </span>
                <span className={`text-[13px] sm:text-[14px] tracking-wide uppercase truncate text-left ${
                  hasScore 
                    ? awayWon 
                      ? 'font-bold text-foreground' 
                      : 'text-muted-foreground/50 font-medium' 
                    : 'font-semibold text-foreground/80'
                }`}>
                  {awayTeam}
                </span>
              </div>
            </div>
          ) : (
            /* Knockout Placeholder */
            <div className="flex justify-center sm:justify-start w-full">
              <div className="font-bold text-xs sm:text-sm tracking-wider uppercase text-foreground/70 py-0.5 bg-white/3 border border-white/5 px-2 rounded-md">
                {m.desc}
              </div>
            </div>
          )}

          {/* Stage and Venue details */}
          <div className="flex flex-wrap items-center gap-2.5 mt-0.5 text-[10px]">
            <Badge variant="outline" className={`font-mono text-[8px] tracking-wider uppercase px-1.5 py-0 rounded ${
              m.grp.startsWith("Group") 
                ? 'text-[#2DE89A] border-[#2DE89A]/20 bg-[#2DE89A]/5' 
                : 'text-gold border-gold/20 bg-gold/5'
            }`}>
              {m.grp}
            </Badge>
            <span className="text-muted-foreground/75 flex items-center gap-1 select-none text-[10px] truncate">
              <MapPin className="size-3 flex-shrink-0 text-muted-foreground/50" />
              {m.v}
            </span>
          </div>
        </div>

        {/* Right Column: Status */}
        <div className="flex items-center sm:items-end justify-end sm:justify-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 sm:pl-4">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="font-mono text-[8px] tracking-wider uppercase text-red flex items-center gap-1 font-bold bg-red/10 border border-red/20 px-2 py-0.5 rounded-full select-none">
                <span className="size-1 rounded-full bg-red pulse-red"></span>
                LIVE {m._detail ? `· ${m._detail}` : ""}
              </span>
            ) : isCompleted ? (
              <span className="font-mono text-[8px] tracking-wider uppercase text-[#2DE89A] font-bold bg-[#2DE89A]/10 border border-[#2DE89A]/20 px-2 py-0.5 rounded-full select-none">
                FT
              </span>
            ) : (
              <span className="font-mono text-[8px] tracking-wider uppercase text-muted-foreground/60 bg-white/3 border border-white/5 px-2 py-0.5 rounded-full select-none">
                UPCOMING
              </span>
            )}
          </div>
        </div>

      </CardContent>
      </Card>
      
      <MatchDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        m={m} 
        tz={tz} 
        matches={matches}
      />
    </>
  );
}
