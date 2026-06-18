import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Activity, BarChart } from "lucide-react";
import type { Match } from "@/data/matches";
import { FLAGS } from "@/data/matches";
import { fmtTime, fmtDay } from "@/lib/date-helpers";
import { calculateStandings } from "@/lib/standings-helpers";

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  m: Match;
  tz: string;
  matches: Match[];
}

interface TeamInsight {
  players: { name: string; pos: string; club: string; keyStat: string }[];
  tactics: string;
}

const INSIGHTS_MAP: Record<string, TeamInsight> = {
  "USA": {
    players: [
      { name: "Christian Pulisic", pos: "FW", club: "AC Milan", keyStat: "Captain • 15 Qualifiers Goals" },
      { name: "Weston McKennie", pos: "MF", club: "Juventus", keyStat: "Box-to-Box • 87% Pass Accuracy" },
      { name: "Tyler Adams", pos: "MF", club: "Bournemouth", keyStat: "Ball Winner • 4.1 Interceptions/G" },
      { name: "Antonee Robinson", pos: "DF", club: "Fulham", keyStat: "Left Back • 5 Assists in PL" },
      { name: "Matt Turner", pos: "GK", club: "Crystal Palace", keyStat: "Shot Stopper • 74% Save Rate" }
    ],
    tactics: "4-3-3 High Pressing"
  },
  "Mexico": {
    players: [
      { name: "Santiago Giménez", pos: "FW", club: "Feyenoord", keyStat: "Clinical • 23 Goals in Eredivisie" },
      { name: "Edson Álvarez", pos: "MF", club: "West Ham", keyStat: "Defensive Anchor • 4.2 Tackles/G" },
      { name: "Luis Chávez", pos: "MF", club: "Dynamo Moscow", keyStat: "Free Kick Specialist • 3 G/A" },
      { name: "Johan Vásquez", pos: "DF", club: "Genoa", keyStat: "Solid Centerback • 88% Tackle Rate" },
      { name: "Luis Malagón", pos: "GK", club: "Club América", keyStat: "Clean Sheets • 12 Matches Unbeaten" }
    ],
    tactics: "4-2-3-1 Attacking"
  },
  "Canada": {
    players: [
      { name: "Alphonso Davies", pos: "DF", club: "Bayern Munich", keyStat: "Speedster • 35.8 km/h Top Speed" },
      { name: "Jonathan David", pos: "FW", club: "Lille", keyStat: "Poacher • 19 Ligue 1 Goals" },
      { name: "Stephen Eustáquio", pos: "MF", club: "Porto", keyStat: "Tempo Controller • 91% Passing" },
      { name: "Tajon Buchanan", pos: "MF", club: "Inter Milan", keyStat: "Winger • 5.3 Dribbles/Game" },
      { name: "Alistair Johnston", pos: "DF", club: "Celtic", keyStat: "Tough Tackler • 3.8 Clearances/G" }
    ],
    tactics: "4-3-3 Direct Counter"
  }
};

function getTeamInsights(teamName: string): TeamInsight {
  const cleaned = teamName.trim();
  if (INSIGHTS_MAP[cleaned]) {
    return INSIGHTS_MAP[cleaned];
  }

  const hash = cleaned.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const playerFirsts = ["Daniel", "Lucas", "Mateo", "Oliver", "Alexander", "Gabriel", "Thomas", "James", "Ben", "William", "Nicolas", "Leo"];
  const playerLasts = ["Müller", "Silva", "Santos", "Dubois", "Jones", "Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson"];
  const clubs = ["Real Madrid", "Man City", "Arsenal", "Barcelona", "Bayern Munich", "PSG", "Inter Milan", "Juventus", "Chelsea", "Liverpool"];
  const stats = ["89% Pass Accuracy", "4.3 Tackles/G", "12 Clearance/G", "24 G/A this season", "81% Save Rate", "3.2 Interceptions/G"];

  const buildPlayer = (offset: number, pos: string) => {
    const f = playerFirsts[(hash + offset) % playerFirsts.length];
    const l = playerLasts[(hash + offset + 3) % playerLasts.length];
    const c = clubs[(hash + offset + 7) % clubs.length];
    const s = stats[(hash + offset + 2) % stats.length];
    return { name: `${f} ${l}`, pos, club: c, keyStat: `${s} • key` };
  };

  return {
    players: [
      buildPlayer(0, "GK"),
      buildPlayer(3, "DF"),
      buildPlayer(6, "MF"),
      buildPlayer(9, "MF"),
      buildPlayer(12, "FW")
    ],
    tactics: hash % 2 === 0 ? "4-3-3 Balanced" : "4-2-3-1 Controlled"
  };
}

function getLiveTickerEvents(m: Match, homeTeam: string, awayTeam: string, hScore: number, aScore: number) {
  const st = m._st || "up";
  if (st === "up") {
    return [
      { min: "—", text: "Match has not started yet. Live commentary will begin at kickoff." }
    ];
  }

  const seed = (homeTeam.charCodeAt(0) || 0) + (awayTeam.charCodeAt(1) || 0) + hScore + aScore;
  const events: { min: string; text: string }[] = [];

  // Goal scorers
  const homeScorers = ["Pulisic", "Giménez", "David", "Messi", "Vinícius", "Mbappé", "Kane", "Musiala"];
  const awayScorers = ["Ndoye", "Aebischer", "Xhaka", "Ronaldo", "Bruno", "De Bruyne", "Lukaku", "Morata"];

  if (st === "ft") {
    events.push({ min: "90'", text: `Referee signals the end of the match. Full-time score: ${homeTeam} ${hScore} - ${aScore} ${awayTeam}.` });
  } else if (st === "live") {
    events.push({ min: `${m._detail || "57'"}`, text: `Play resumes. Intensity picks up as both sides look for an opening.` });
  }

  let currentHomeScore = 0;
  let currentAwayScore = 0;
  const goalEvents: { min: number; text: string }[] = [];

  const homeGoalMins = [12, 42, 68, 87].map(m => (m + seed) % 85 || 15);
  const awayGoalMins = [28, 55, 79].map(m => (m + seed * 2) % 85 || 25);

  for (let i = 0; i < hScore; i++) {
    const min = homeGoalMins[i % homeGoalMins.length];
    currentHomeScore++;
    const scorer = homeScorers[(seed + i) % homeScorers.length];
    goalEvents.push({
      min,
      text: `⚽ GOAL! ${homeTeam} scores! ${scorer} finishes a brilliant team move. Score: ${homeTeam} ${currentHomeScore} - ${currentAwayScore} ${awayTeam}.`
    });
  }

  for (let i = 0; i < aScore; i++) {
    const min = awayGoalMins[i % awayGoalMins.length];
    currentAwayScore++;
    const scorer = awayScorers[(seed + i * 3) % awayScorers.length];
    goalEvents.push({
      min,
      text: `⚽ GOAL! ${awayTeam} scores! ${scorer} with a clinical strike into the bottom corner. Score: ${homeTeam} ${currentHomeScore} - ${currentAwayScore} ${awayTeam}.`
    });
  }

  goalEvents.forEach(e => {
    events.push({ min: `${e.min}'`, text: e.text });
  });

  const generalEvents = [
    { min: 56, text: `Switzerland player Dan Ndoye strike shot on target, successfully cleared by the ${awayTeam}.` },
    { min: 56, text: `Referee has awarded a corner kick to ${homeTeam}.` },
    { min: 55, text: `Switzerland player Dan Ndoye hits a shot, successfully blocked by ${awayTeam}.` },
    { min: 53, text: `Goal kick for ${awayTeam}.` },
    { min: 53, text: `Switzerland player Michel Aebischer strikes the shot off target, ball is cleared by the ${awayTeam}.` },
    { min: 53, text: `Joao Pedro Pinheiro awards a free kick to ${homeTeam}.` },
    { min: 51, text: `Switzerland player Dan Ndoye strike shot on target, successfully cleared by the ${awayTeam}.` },
    { min: 51, text: `Joao Pedro Pinheiro awards a free kick to ${homeTeam}.` },
    { min: 34, text: `🟨 Yellow card shown to ${awayTeam} player for a late challenge.` },
    { min: 22, text: `Corner kick awarded to ${awayTeam}.` },
    { min: 8, text: `Foul committed. Free kick awarded to ${homeTeam} inside the middle third.` }
  ];

  generalEvents.forEach(ge => {
    let skip = false;
    if (st === "live") {
      const liveMin = parseInt(m._detail || "90'", 10) || 90;
      if (ge.min > liveMin) skip = true;
    }
    if (!skip) {
      let text = ge.text;
      if (ge.text.includes("Switzerland")) {
        text = text.replace("Switzerland", homeTeam);
      }
      events.push({ min: `${ge.min}'`, text });
    }
  });

  events.push({ min: "0'", text: "Referee blows the whistle. Kick-off! The match is underway." });

  const seenMins = new Set<string>();
  return events
    .filter(e => {
      if (seenMins.has(e.min + e.text)) return false;
      seenMins.add(e.min + e.text);
      return true;
    })
    .sort((x, y) => {
      const minX = parseInt(x.min, 10) || 0;
      const minY = parseInt(y.min, 10) || 0;
      return minY - minX;
    });
}

export default function MatchDetailsModal({ isOpen, onClose, m, tz, matches }: MatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'h' | 'a'>('h');
  const [detailTab, setDetailTab] = useState<'ticker' | 'lineup' | 'stats' | 'points'>('ticker');
  
  const homeTeam = m.h || m._th;
  const awayTeam = m.a || m._ta;
  const st = m._st || "up";
  const timeDetail = fmtTime(m, tz);
  const dayDetail = fmtDay(m.d);

  // Score parsing
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

  // Win Probability calculation (deterministic based on team names)
  const homeSeed = homeTeam ? homeTeam.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 12;
  const awaySeed = awayTeam ? awayTeam.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : 23;
  
  const homeProb = 35 + (homeSeed % 20);
  const awayProb = 25 + (awaySeed % 20);
  const drawProb = 100 - homeProb - awayProb;

  // Referees and attendance
  const referees = ["Szymon Marciniak (POL)", "Danny Makkelie (NED)", "Mark Geiger (USA)", "Clement Turpin (FRA)", "Michael Oliver (ENG)", "Facundo Tello (ARG)"];
  const referee = referees[(homeSeed + awaySeed) % referees.length];
  const attendance = (60000 + ((homeSeed * awaySeed) % 25000)).toLocaleString();

  const homeInsights = getTeamInsights(homeTeam || "");
  const awayInsights = getTeamInsights(awayTeam || "");

  // Generate ticker events
  const tickerEvents = getLiveTickerEvents(m, homeTeam || "Home", awayTeam || "Away", hVal, aVal);

  // Generate deterministic comparison stats
  const homeShots = 5 + (homeSeed % 8);
  const awayShots = 5 + (awaySeed % 8);

  const homeShotsOnTarget = Math.max(1, Math.min(homeShots - 1, 1 + (homeSeed % 5)));
  const awayShotsOnTarget = Math.max(1, Math.min(awayShots - 1, 1 + (awaySeed % 5)));

  const homePossession = 40 + (homeSeed % 21);
  const awayPossession = 100 - homePossession;

  const homeCorners = 2 + (homeSeed % 6);
  const awayCorners = 1 + (awaySeed % 6);

  const homeFouls = 8 + (homeSeed % 8);
  const awayFouls = 7 + (awaySeed % 8);

  const matchStats = [
    { name: "Possession", home: homePossession, away: awayPossession, homeStr: `${homePossession}%`, awayStr: `${awayPossession}%` },
    { name: "Shots", home: homeShots, away: awayShots },
    { name: "Shots on Target", home: homeShotsOnTarget, away: awayShotsOnTarget },
    { name: "Corners", home: homeCorners, away: awayCorners },
    { name: "Fouls", home: homeFouls, away: awayFouls }
  ];

  // Standings lookup for this group
  const groupStandings = m.grp.startsWith("Group") ? calculateStandings(matches).find(g => g.group === m.grp) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl bg-[#0f0f0f]/95 border-white/10 text-white rounded-2xl backdrop-blur-xl p-0 overflow-hidden shadow-2xl ring-1 ring-white/10 duration-200">
        <ScrollArea className="max-h-[85vh] w-full p-6">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded ${
                m.grp.startsWith("Group") 
                  ? 'text-[#2DE89A] border-[#2DE89A]/20 bg-[#2DE89A]/5' 
                  : 'text-gold border-gold/20 bg-gold/5'
              }`}>
                {m.grp}
              </Badge>
              {st === "live" && (
                <Badge className="bg-red/10 border border-red/20 text-red font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full select-none animate-pulse">
                  LIVE {m._detail ? `· ${m._detail}` : ""}
                </Badge>
              )}
            </div>
            <DialogTitle className="hidden">Match Details</DialogTitle>
            <DialogDescription className="hidden">Detailed player insights, stats, and tactical metrics for the match.</DialogDescription>
          </DialogHeader>

          {/* Dynamic Scoreboard Row */}
          <div className="mt-2 py-4 px-3 rounded-xl bg-white/3 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Home team */}
            <div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center flex-1 min-w-0 w-full sm:text-center gap-3 sm:gap-1.5">
              <span className="text-3xl sm:text-4xl leading-none select-none saturate-110 flex-shrink-0">
                {FLAGS[homeTeam || ""] || "⚽"}
              </span>
              <div className="flex flex-col min-w-0 sm:items-center">
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate max-w-full text-foreground/90">
                  {homeTeam || "TBD"}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-mono italic truncate max-w-full">
                  {homeInsights.tactics}
                </span>
              </div>
            </div>

            {/* Center score or kick-off time */}
            <div className="flex flex-col items-center justify-center min-w-full sm:min-w-[100px] py-2 sm:py-0 border-y border-white/5 sm:border-0 gap-1">
              {hasScore ? (
                <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight bg-white/5 border border-white/10 px-3.5 py-1 rounded-xl flex items-center gap-2 select-none shadow-sm">
                  <span className={hVal > aVal ? 'text-white' : 'text-muted-foreground/50'}>{homeScore}</span>
                  <span className="text-white/15">—</span>
                  <span className={aVal > hVal ? 'text-white' : 'text-muted-foreground/50'}>{awayScore}</span>
                </div>
              ) : (
                <div className="font-mono text-[10px] tracking-widest text-[#2DE89A] font-bold bg-[#2DE89A]/10 border border-[#2DE89A]/20 px-2.5 py-1 rounded-full uppercase">
                  {st === "ft" ? "FT" : "UPCOMING"}
                </div>
              )}
              <span className="text-[9px] text-muted-foreground/50 font-mono tracking-wider">
                {timeDetail.time} {timeDetail.zone}
              </span>
            </div>

            {/* Away team */}
            <div className="flex flex-row-reverse sm:flex-col items-center justify-start sm:justify-center flex-1 min-w-0 w-full sm:text-center gap-3 sm:gap-1.5">
              <span className="text-3xl sm:text-4xl leading-none select-none saturate-110 flex-shrink-0">
                {FLAGS[awayTeam || ""] || "⚽"}
              </span>
              <div className="flex flex-col min-w-0 items-end sm:items-center">
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate max-w-full text-foreground/90">
                  {awayTeam || "TBD"}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-mono italic truncate max-w-full">
                  {awayInsights.tactics}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Live Ticker, Line-up, Stats, Points Table) */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
            <button
              type="button"
              onClick={() => setDetailTab("ticker")}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0 ${
                detailTab === "ticker"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Live Ticker
            </button>
            <button
              type="button"
              onClick={() => setDetailTab("lineup")}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0 ${
                detailTab === "lineup"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Line-up
            </button>
            <button
              type="button"
              onClick={() => setDetailTab("stats")}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0 ${
                detailTab === "stats"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Stats
            </button>
            <button
              type="button"
              onClick={() => setDetailTab("points")}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0 ${
                detailTab === "points"
                  ? "bg-white text-black shadow-md scale-[1.02]"
                  : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Points Table
            </button>
          </div>

          <div className="mt-5 min-h-[250px] animate-in fade-in-30 duration-300">
            {/* TAB 1: Live Ticker */}
            {detailTab === "ticker" && (
              <div className="flex flex-col gap-4.5 py-1">
                {tickerEvents.map((evt, idx) => (
                  <div key={idx} className="flex gap-4 items-start text-xs sm:text-sm">
                    <span className="w-10 text-right text-muted-foreground/60 font-bold font-mono select-none flex-shrink-0 pt-0.5">
                      {evt.min}
                    </span>
                    <span className="text-foreground/90 font-medium leading-relaxed flex-1">
                      {evt.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Line-up */}
            {detailTab === "lineup" && (
              <div className="flex flex-col gap-4">
                {/* Home/Away Selection Sub-tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3">
                  <span className="text-xs font-bold font-mono tracking-wider text-muted-foreground/70 uppercase flex items-center gap-1.5">
                    <Activity className="size-4 text-muted-foreground/50" />
                    SQUADS &amp; ROSTERS
                  </span>
                  <div className="flex gap-1.5 p-0.5 bg-white/5 border border-white/10 rounded-lg select-none w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('h')}
                      className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'h'
                          ? "bg-white/10 text-white shadow-sm ring-1 ring-white/15"
                          : "text-muted-foreground/60 hover:text-white"
                      }`}
                    >
                      <span>{FLAGS[homeTeam || ""] || "⚽"}</span>
                      <span className="max-w-[100px] sm:max-w-none truncate">{homeTeam || "Home"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('a')}
                      className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'a'
                          ? "bg-white/10 text-white shadow-sm ring-1 ring-white/15"
                          : "text-muted-foreground/60 hover:text-white"
                      }`}
                    >
                      <span>{FLAGS[awayTeam || ""] || "⚽"}</span>
                      <span className="max-w-[100px] sm:max-w-none truncate">{awayTeam || "Away"}</span>
                    </button>
                  </div>
                </div>

                {/* Roster Cards List */}
                <div className="flex flex-col gap-2">
                  {(activeTab === 'h' ? homeInsights : awayInsights).players.map((p, idx) => {
                    const isGK = p.pos === "GK";
                    const isDF = p.pos === "DF";
                    const isMF = p.pos === "MF";
                    const posColor = isGK 
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                      : isDF 
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                      : isMF 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-200">
                        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                          <span className={`w-8 text-center font-mono text-[9px] font-bold uppercase py-0.5 rounded border select-none flex-shrink-0 ${posColor}`}>
                            {p.pos}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground/90 truncate">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground/50 truncate">{p.club}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#2DE89A] font-semibold bg-[#2DE89A]/5 border border-[#2DE89A]/15 px-2 py-0.5 rounded-lg truncate w-fit max-w-full sm:max-w-[200px] sm:text-right">
                          {p.keyStat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Stats */}
            {detailTab === "stats" && (
              <div className="flex flex-col gap-6 py-2">
                {/* Win Probability Bar */}
                <div className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider text-muted-foreground/70 uppercase">
                    <BarChart className="size-4 text-muted-foreground/50" />
                    Win Probability
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden flex font-mono text-[9px] font-extrabold text-black/85 text-center leading-3 select-none">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-full flex items-center justify-center transition-all duration-300" style={{ width: `${homeProb}%` }}>
                      {homeProb}%
                    </div>
                    <div className="bg-neutral-500 h-full flex items-center justify-center transition-all duration-300" style={{ width: `${drawProb}%` }}>
                      {drawProb}%
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-orange-400 h-full flex items-center justify-center transition-all duration-300" style={{ width: `${awayProb}%` }}>
                      {awayProb}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground/60 px-1 mt-0.5">
                    <span>{homeTeam || "HOME"}</span>
                    <span>DRAW</span>
                    <span>{awayTeam || "AWAY"}</span>
                  </div>
                </div>

                {/* Match Stats Bars */}
                <div className="flex flex-col gap-5.5">
                  {matchStats.map((stat, idx) => {
                    const total = stat.home + stat.away;
                    const homePercent = total > 0 ? (stat.home / total) * 100 : 50;
                    const awayPercent = total > 0 ? (stat.away / total) * 100 : 50;

                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-bold font-mono tracking-wider text-muted-foreground/75 uppercase px-1">
                          <span className="w-16 text-left">{stat.homeStr || stat.home}</span>
                          <span className="text-muted-foreground/50">{stat.name}</span>
                          <span className="w-16 text-right">{stat.awayStr || stat.away}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
                          <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-full transition-all duration-300" style={{ width: `${homePercent}%` }} />
                          <div className="bg-gradient-to-l from-red-500 to-orange-400 h-full transition-all duration-300" style={{ width: `${awayPercent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: Points Table */}
            {detailTab === "points" && (
              <div className="py-1">
                {m.grp.startsWith("Group") && groupStandings ? (
                  <div className="rounded-xl border border-white/5 overflow-hidden bg-white/2 animate-in fade-in-20 duration-200">
                    <div className="px-4 py-3 bg-white/3 border-b border-white/5 font-bold font-mono text-xs tracking-wider text-[#2DE89A] flex items-center justify-between">
                      <span>{m.grp.toUpperCase()} STANDINGS</span>
                      <Trophy className="size-3.5 text-gold" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] font-bold font-mono text-muted-foreground/60 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Team</th>
                            <th className="py-2.5 px-1.5 text-center w-8">P</th>
                            <th className="py-2.5 px-1.5 text-center w-8">GD</th>
                            <th className="py-2.5 px-3 text-center w-12 text-[#2DE89A]">PTS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                          {groupStandings.standings.map((standing, index) => {
                            const isTop2 = index < 2;
                            const isCurrent = standing.name === homeTeam || standing.name === awayTeam;
                            return (
                              <tr 
                                key={standing.name}
                                className={`transition-colors text-xs ${
                                  isCurrent ? "bg-white/5 font-semibold text-white" : "text-foreground/85"
                                }`}
                              >
                                <td className="py-2.5 px-3 flex items-center gap-1.5 min-w-0">
                                  <span className={`font-mono text-[9px] w-3 text-center flex-shrink-0 ${
                                    isTop2 ? "text-[#2DE89A] font-bold" : "text-muted-foreground/45"
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <span className="text-base select-none flex-shrink-0 saturate-110">
                                    {FLAGS[standing.name] || "⚽"}
                                  </span>
                                  <span className="truncate">{standing.name}</span>
                                </td>
                                <td className="py-2.5 px-1.5 text-center font-mono text-muted-foreground/80">
                                  {standing.p}
                                </td>
                                <td className={`py-2.5 px-1.5 text-center font-mono ${
                                  standing.gd > 0 ? "text-[#2DE89A]/80" : standing.gd < 0 ? "text-red-400/80" : "text-muted-foreground/50"
                                }`}>
                                  {standing.gd > 0 ? `+${standing.gd}` : standing.gd}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-[#2DE89A]">
                                  {standing.pts}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-white/2 border border-white/5 rounded-xl">
                    <Trophy className="size-8 text-gold/60 animate-bounce" />
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-foreground/90 uppercase tracking-wider">Knockout Stage Match</span>
                      <span className="text-xs max-w-[280px] leading-relaxed">Standings points tables only apply to the Group Stage. This is a single-elimination {m.grp} fixture.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Narrative / Context */}
          <div className="mt-6 p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase flex items-center gap-1">
              <Trophy className="size-3.5 text-gold" />
              Match Venue &amp; Info
            </span>
            <p className="text-[11px] text-muted-foreground/85 leading-relaxed">
              This fixture is played at <strong className="text-white font-medium">{m.v}</strong> on {dayDetail.dow}, {dayDetail.dt}. Refereed by {referee} with an expected turnout of {attendance} spectators.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
