import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Trophy, Activity, Calendar, BarChart } from "lucide-react";
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
      { name: "Weston McKennie", pos: "MF", club: "Juventus", keyStat: "Box-to-Box • 87% Pass Accuracy" }
    ],
    tactics: "4-3-3 High Pressing"
  },
  "Mexico": {
    players: [
      { name: "Santiago Giménez", pos: "FW", club: "Feyenoord", keyStat: "Clinical • 23 Goals in Eredivisie" },
      { name: "Edson Álvarez", pos: "MF", club: "West Ham", keyStat: "Defensive Anchor • 4.2 Tackles/Game" }
    ],
    tactics: "4-2-3-1 Attacking"
  },
  "Canada": {
    players: [
      { name: "Alphonso Davies", pos: "DF", club: "Bayern Munich", keyStat: "Speedster • 35.8 km/h Top Speed" },
      { name: "Jonathan David", pos: "FW", club: "Lille", keyStat: "Poacher • 19 Ligue 1 Goals" }
    ],
    tactics: "5-3-2 Defensive Transition"
  },
  "England": {
    players: [
      { name: "Jude Bellingham", pos: "MF", club: "Real Madrid", keyStat: "Playmaker • 22 G/A this season" },
      { name: "Harry Kane", pos: "FW", club: "Bayern Munich", keyStat: "Golden Boot • 44 Goals in all comps" }
    ],
    tactics: "4-3-3 Possession Control"
  },
  "France": {
    players: [
      { name: "Kylian Mbappé", pos: "FW", club: "Real Madrid", keyStat: "Galáctico • 8 WC Finals Goals" },
      { name: "Antoine Griezmann", pos: "MF", club: "Atlético Madrid", keyStat: "Engine • 89 Key Passes" }
    ],
    tactics: "4-2-3-1 Counter-Attacking"
  },
  "Argentina": {
    players: [
      { name: "Lionel Messi", pos: "FW", club: "Inter Miami", keyStat: "GOAT • 8 Ballon d'Ors" },
      { name: "Lautaro Martínez", pos: "FW", club: "Inter Milan", keyStat: "Serie A MVP • 24 Goals" }
    ],
    tactics: "4-3-3 Fluid Possession"
  },
  "Brazil": {
    players: [
      { name: "Vinícius Júnior", pos: "FW", club: "Real Madrid", keyStat: "Dribbler • 18 assists" },
      { name: "Rodrygo", pos: "FW", club: "Real Madrid", keyStat: "Versatile • 17 UCL Goals" }
    ],
    tactics: "4-2-3-1 Jogo Bonito"
  },
  "Germany": {
    players: [
      { name: "Jamal Musiala", pos: "MF", club: "Bayern Munich", keyStat: "Maestro • 92% Dribble Success" },
      { name: "Florian Wirtz", pos: "MF", club: "Bayer Leverkusen", keyStat: "Creator • 20 Assists in Bundesliga" }
    ],
    tactics: "3-4-2-1 Attacking Midfield"
  },
  "Spain": {
    players: [
      { name: "Lamine Yamal", pos: "FW", club: "Barcelona", keyStat: "Prodigy • Youngest Euro Scorer" },
      { name: "Rodri", pos: "MF", club: "Manchester City", keyStat: "Unbeaten Streak • Ballon d'Or Nominee" }
    ],
    tactics: "4-3-3 Tiki-Taka"
  },
  "Portugal": {
    players: [
      { name: "Cristiano Ronaldo", pos: "FW", club: "Al Nassr", keyStat: "Record Breaker • 130 International Goals" },
      { name: "Bruno Fernandes", pos: "MF", club: "Manchester United", keyStat: "Chance Creator • 112 Key Passes" }
    ],
    tactics: "4-3-3 Direct Attack"
  }
};

function getTeamInsights(teamName: string): TeamInsight {
  if (!teamName) {
    return {
      players: [
        { name: "TBD Key Player", pos: "FW", club: "TBD Club", keyStat: "Stats loading..." }
      ],
      tactics: "T tactics"
    };
  }
  if (INSIGHTS_MAP[teamName]) {
    return INSIGHTS_MAP[teamName];
  }
  // Fallback generator
  const hash = teamName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const playerFirsts = ["Luka", "Marco", "David", "Ivan", "Luis", "Mateo", "Alex", "Kevin", "Tomas", "Stefan"];
  const playerLasts = ["Silva", "García", "Kovačić", "Santos", "Jansen", "Smith", "Modrić", "Vidal", "Müller", "Jones"];
  const clubs = ["Man City", "Real Madrid", "PSG", "Barcelona", "Liverpool", "Inter", "Arsenal", "Bayern"];
  const stats = ["Defensive Core", "Wing threat", "Playmaker", "Speedster", "Tactical leader", "Penalty Specialist"];

  const p1Name = `${playerFirsts[hash % playerFirsts.length]} ${playerLasts[(hash + 3) % playerLasts.length]}`;
  const p2Name = `${playerFirsts[(hash + 5) % playerFirsts.length]} ${playerLasts[(hash + 7) % playerLasts.length]}`;

  return {
    players: [
      { name: p1Name, pos: "FW", club: clubs[hash % clubs.length], keyStat: `${stats[hash % stats.length]} • Key Player` },
      { name: p2Name, pos: "MF", club: clubs[(hash + 4) % clubs.length], keyStat: `${stats[(hash + 2) % stats.length]} • 85% Rating` }
    ],
    tactics: hash % 2 === 0 ? "4-3-3 Balanced" : "4-2-3-1 Controlled"
  };
}

export default function MatchDetailsModal({ isOpen, onClose, m, tz }: MatchDetailsModalProps) {
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
      <DialogContent className="max-w-lg bg-[#0f0f0f]/95 border-white/10 text-white rounded-2xl backdrop-blur-xl p-6 shadow-2xl ring-1 ring-white/10 duration-200">
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
        <div className="mt-2 py-4 px-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-center gap-1.5">
            <span className="text-3xl sm:text-4xl leading-none select-none saturate-110">
              {FLAGS[homeTeam || ""] || "⚽"}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate max-w-full text-foreground/90">
              {homeTeam || "TBD"}
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-mono italic">
              {homeInsights.tactics}
            </span>
          </div>

          {/* Center score or kick-off time */}
          <div className="flex flex-col items-center justify-center min-w-[100px] gap-1">
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
          <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-center gap-1.5">
            <span className="text-3xl sm:text-4xl leading-none select-none saturate-110">
              {FLAGS[awayTeam || ""] || "⚽"}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate max-w-full text-foreground/90">
              {awayTeam || "TBD"}
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-mono italic">
              {awayInsights.tactics}
            </span>
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

        {/* Matchup Insights & Players */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="text-xs font-bold font-mono tracking-wider text-muted-foreground/70 uppercase flex items-center gap-1.5">
            <Activity className="size-4 text-muted-foreground/50" />
            Key Players &amp; Insights
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Home Key Players */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-bold text-foreground/80 tracking-wide uppercase border-b border-white/5 pb-1 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-blue-400"></span>
                {homeTeam || "Home Team"} Key Player
              </span>
              {homeInsights.players.slice(0, 1).map((p, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-foreground/90 truncate flex items-center gap-1">
                    <User className="size-3 text-muted-foreground/50" />
                    {p.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">{p.club} · {p.pos}</span>
                  <span className="text-[9px] text-[#2DE89A] font-semibold font-mono bg-[#2DE89A]/5 px-1.5 py-0.5 rounded-md mt-1 border border-[#2DE89A]/10 w-fit">
                    {p.keyStat}
                  </span>
                </div>
              ))}
            </div>

            {/* Away Key Players */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-bold text-foreground/80 tracking-wide uppercase border-b border-white/5 pb-1 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-red-400"></span>
                {awayTeam || "Away Team"} Key Player
              </span>
              {awayInsights.players.slice(0, 1).map((p, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-foreground/90 truncate flex items-center gap-1">
                    <User className="size-3 text-muted-foreground/50" />
                    {p.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">{p.club} · {p.pos}</span>
                  <span className="text-[9px] text-[#2DE89A] font-semibold font-mono bg-[#2DE89A]/5 px-1.5 py-0.5 rounded-md mt-1 border border-[#2DE89A]/10 w-fit">
                    {p.keyStat}
                  </span>
                </div>
              ))}
            </div>
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
      </DialogContent>
    </Dialog>
  );
}
