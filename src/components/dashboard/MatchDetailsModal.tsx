import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Trophy, Activity, Calendar, BarChart } from "lucide-react";
import type { Match } from "@/data/matches";
import { FLAGS } from "@/data/matches";
import { fmtTime, fmtDay } from "@/lib/date-helpers";

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  m: Match;
  tz: string;
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
    tactics: "5-3-2 Defensive Transition"
  },
  "England": {
    players: [
      { name: "Harry Kane", pos: "FW", club: "Bayern Munich", keyStat: "Golden Boot • 44 Goals in all comps" },
      { name: "Jude Bellingham", pos: "MF", club: "Real Madrid", keyStat: "Playmaker • 22 G/A this season" },
      { name: "Bukayo Saka", pos: "FW", club: "Arsenal", keyStat: "Winger • 16 Goals, 9 Assists" },
      { name: "Declan Rice", pos: "MF", club: "Arsenal", keyStat: "Ball Winner • 2.8 Interceptions/G" },
      { name: "John Stones", pos: "DF", club: "Man City", keyStat: "Ball Playing CB • 94% Pass Accuracy" }
    ],
    tactics: "4-3-3 Possession Control"
  },
  "France": {
    players: [
      { name: "Kylian Mbappé", pos: "FW", club: "Real Madrid", keyStat: "Galáctico • 8 WC Finals Goals" },
      { name: "Antoine Griezmann", pos: "MF", club: "Atlético Madrid", keyStat: "Engine • 89 Key Passes" },
      { name: "Aurélien Tchouaméni", pos: "MF", club: "Real Madrid", keyStat: "Intercepter • 4.2 Duels Won" },
      { name: "William Saliba", pos: "DF", club: "Arsenal", keyStat: "Elite Defender • 91% Clean Sheets" },
      { name: "Mike Maignan", pos: "GK", club: "AC Milan", keyStat: "Reflexes • 8 Pen Saves" }
    ],
    tactics: "4-2-3-1 Counter-Attacking"
  },
  "Argentina": {
    players: [
      { name: "Lionel Messi", pos: "FW", club: "Inter Miami", keyStat: "GOAT • 8 Ballon d'Ors" },
      { name: "Lautaro Martínez", pos: "FW", club: "Inter Milan", keyStat: "Serie A MVP • 24 Goals" },
      { name: "Alexis Mac Allister", pos: "MF", club: "Liverpool", keyStat: "Playmaker • 88% Pass Rate" },
      { name: "Cristian Romero", pos: "DF", club: "Tottenham", keyStat: "Rock • 92% Tackle Success" },
      { name: "Emiliano Martínez", pos: "GK", club: "Aston Villa", keyStat: "Golden Glove • Clutch Saves" }
    ],
    tactics: "4-3-3 Fluid Possession"
  },
  "Brazil": {
    players: [
      { name: "Vinícius Júnior", pos: "FW", club: "Real Madrid", keyStat: "Dribbler • 18 assists" },
      { name: "Rodrygo", pos: "FW", club: "Real Madrid", keyStat: "Versatile • 17 UCL Goals" },
      { name: "Bruno Guimarães", pos: "MF", club: "Newcastle", keyStat: "Anchor • 4.5 Tackles/G" },
      { name: "Marquinhos", pos: "DF", club: "PSG", keyStat: "Captain • 90% Pass Success" },
      { name: "Alisson Becker", pos: "GK", club: "Liverpool", keyStat: "Wall • 14 Clean Sheets" }
    ],
    tactics: "4-2-3-1 Jogo Bonito"
  },
  "Germany": {
    players: [
      { name: "Jamal Musiala", pos: "MF", club: "Bayern Munich", keyStat: "Maestro • 92% Dribble Success" },
      { name: "Florian Wirtz", pos: "MF", club: "Bayer Leverkusen", keyStat: "Creator • 20 Assists in BL" },
      { name: "Kai Havertz", pos: "FW", club: "Arsenal", keyStat: "False 9 • 13 PL Goals" },
      { name: "Antonio Rüdiger", pos: "DF", club: "Real Madrid", keyStat: "Warrior • 4.8 Aerial Duels Won" },
      { name: "Marc-André ter Stegen", pos: "GK", club: "Barcelona", keyStat: "Modern GK • 82% Pass Accuracy" }
    ],
    tactics: "3-4-2-1 Attacking Midfield"
  },
  "Spain": {
    players: [
      { name: "Lamine Yamal", pos: "FW", club: "Barcelona", keyStat: "Prodigy • Youngest Euro Scorer" },
      { name: "Rodri", pos: "MF", club: "Manchester City", keyStat: "Unbeaten Streak • Ballon d'Or" },
      { name: "Pedri", pos: "MF", club: "Barcelona", keyStat: "Visionary • 93% Final Third Passes" },
      { name: "Dani Carvajal", pos: "DF", club: "Real Madrid", keyStat: "Experienced • 6 Champions Leagues" },
      { name: "Unai Simón", pos: "GK", club: "Athletic Bilbao", keyStat: "La Liga Zamora • 15 Clean Sheets" }
    ],
    tactics: "4-3-3 Tiki-Taka"
  },
  "Portugal": {
    players: [
      { name: "Cristiano Ronaldo", pos: "FW", club: "Al Nassr", keyStat: "Record Breaker • 130 Intl Goals" },
      { name: "Bruno Fernandes", pos: "MF", club: "Manchester United", keyStat: "Chance Creator • 112 Key Passes" },
      { name: "Bernardo Silva", pos: "MF", club: "Man City", keyStat: "Controller • 90% Pass Rate" },
      { name: "Rúben Dias", pos: "DF", club: "Man City", keyStat: "Leader • 91% Tackles Won" },
      { name: "Diogo Costa", pos: "GK", club: "Porto", keyStat: "Pen Saver • 3 UCL Pen Saves" }
    ],
    tactics: "4-3-3 Direct Attack"
  }
};

function getTeamInsights(teamName: string): TeamInsight {
  if (!teamName) {
    return {
      players: [
        { name: "TBD Goalkeeper", pos: "GK", club: "TBD Club", keyStat: "Reflexes" },
        { name: "TBD Defender", pos: "DF", club: "TBD Club", keyStat: "Solid Centerback" },
        { name: "TBD Midfielder", pos: "MF", club: "TBD Club", keyStat: "Tempo Controller" },
        { name: "TBD Midfielder", pos: "MF", club: "TBD Club", keyStat: "Playmaker" },
        { name: "TBD Forward", pos: "FW", club: "TBD Club", keyStat: "Clinical Finisher" }
      ],
      tactics: "4-3-3 Balanced"
    };
  }
  if (INSIGHTS_MAP[teamName]) {
    return INSIGHTS_MAP[teamName];
  }
  // Fallback generator
  const hash = teamName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const playerFirsts = ["Luka", "Marco", "David", "Ivan", "Luis", "Mateo", "Alex", "Kevin", "Tomas", "Stefan", "Lucas", "Gabriel", "Samuel", "Nicolas"];
  const playerLasts = ["Silva", "García", "Kovačić", "Santos", "Jansen", "Smith", "Modrić", "Vidal", "Müller", "Jones", "Fernandez", "Rodriguez", "Lopes"];
  const clubs = ["Man City", "Real Madrid", "PSG", "Barcelona", "Liverpool", "Inter", "Arsenal", "Bayern", "Juventus", "Chelsea"];
  const stats = ["Defensive Core", "Wing threat", "Playmaker", "Speedster", "Tactical leader", "Penalty Specialist", "Shot Stopper", "Clinical Finisher"];

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

export default function MatchDetailsModal({ isOpen, onClose, m, tz }: MatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'h' | 'a'>('h');
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
                <span className={homeScore! > awayScore! ? 'text-white' : 'text-muted-foreground/50'}>{homeScore}</span>
                <span className="text-white/15">—</span>
                <span className={awayScore! > homeScore! ? 'text-white' : 'text-muted-foreground/50'}>{awayScore}</span>
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

        {/* Match Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center gap-2.5">
            <Calendar className="size-4.5 text-muted-foreground/75 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">Date</span>
              <span className="text-xs font-semibold text-foreground/90 truncate">{dayDetail.dow}, {dayDetail.dt}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center gap-2.5">
            <MapPin className="size-4.5 text-muted-foreground/75 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">Stadium</span>
              <span className="text-xs font-semibold text-foreground/90 truncate" title={m.v}>{m.v}</span>
            </div>
          </div>
        </div>

        {/* Win Probability Bar */}
        <div className="mt-4 p-3.5 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2">
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

        {/* Matchup Insights & Players Roster Tabs */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold font-mono tracking-wider text-muted-foreground/70 uppercase flex items-center gap-1.5">
              <Activity className="size-4 text-muted-foreground/50" />
              SQUADS &amp; ROSTERS
            </span>
            <div className="flex gap-1.5 p-0.5 bg-white/5 border border-white/10 rounded-lg select-none w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('h')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${
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
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${
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

          <div className="flex flex-col gap-2 animate-in fade-in-30 duration-200">
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

        {/* Narrative / Context */}
        <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase flex items-center gap-1">
            <Trophy className="size-3.5 text-gold" />
            Match Preview
          </span>
          <p className="text-[11px] text-muted-foreground/85 leading-relaxed">
            This fixture marks a crucial encounter in the 2026 World Cup campaign. Held at the state-of-the-art <strong className="text-white font-medium">{m.v}</strong> with an expected crowd of {attendance} fans, under the officiating of referee {referee}. Expect tactical adaptations as both managers field proactive systems.
          </p>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
