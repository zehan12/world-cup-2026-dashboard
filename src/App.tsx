import type { Match } from "@/data/matches";
import { useState } from "react";
import { 
  INITIAL_MATCHES, 
  UNIVERSO 
} from "@/data/matches";
import { 
  etTodayStr, 
  matchStatus, 
} from "@/helpers/date-helpers";
import { downloadICS } from "@/helpers/calendar-helpers";

// Custom Hooks
import { useEspnScores } from "@/hooks/useEspnScores";
import { useShare } from "@/hooks/useShare";

// Zustand Store
import { useFilterStore } from "@/store";

// Dashboard sub-components
import Header from "@/components/dashboard/Header";
import BroadcastKey from "@/components/dashboard/BroadcastKey";
import Filters from "@/components/dashboard/Filters";
import QuickChips from "@/components/dashboard/QuickChips";
import MatchList from "@/components/dashboard/MatchList";
import Standings from "@/components/dashboard/Standings";
import Footer from "@/components/dashboard/Footer";

const initialMatchesWithStatus = INITIAL_MATCHES.map(m => {
  const st = matchStatus(m);
  const es = (m.h && UNIVERSO.has(`${m.h}|${m.a}`)) ? "Universo" as const : "Telemundo" as const;
  return { ...m, _st: st, es };
});

export default function App() {
  // Zustand State selectors
  const q = useFilterStore((s) => s.q);
  const stage = useFilterStore((s) => s.stage);
  const team = useFilterStore((s) => s.team);
  const tv = useFilterStore((s) => s.tv);
  const today = useFilterStore((s) => s.today);
  const up = useFilterStore((s) => s.up);
  const party = useFilterStore((s) => s.party);

  // Local View state
  const [activeView, setActiveView] = useState<"matches" | "standings">("matches");

  // Hooks
  const { matches, isFresh } = useEspnScores(initialMatchesWithStatus);
  const { copied, handleCopyLink, getShareText, getShareUrl } = useShare(team);

  const todayStr = etTodayStr();

  // Stats calculation
  const totalMatches = matches.length;
  const matchesTodayCount = matches.filter(m => m.d === todayStr).length;
  const upcomingMatchesCount = matches.filter(m => m._st === "up").length;
  
  const activeUnplayed = matches.filter(m => m._st !== "ft");
  const currentRound = !activeUnplayed.length 
    ? "Complete" 
    : activeUnplayed[0].grp.startsWith("Group") 
      ? "Group Stage" 
      : activeUnplayed[0].grp;

  // Filter passing test
  const passes = (m: Match) => {
    if (stage) {
      if (stage === "group" && !m.grp.startsWith("Group")) return false;
      if (stage === "ko-late" && !(m.grp === "Final" || m.grp === "Third place")) return false;
      if (["Round of 32", "Round of 16", "Quarterfinal", "Semifinal"].includes(stage) && m.grp !== stage) return false;
    }
    if (team && ![m.h, m.a, m._th, m._ta].includes(team)) return false;
    if (tv && m.tv !== tv) return false;
    if (today && m.d !== todayStr) return false;
    if (up && m._st !== "up") return false;
    if (q) {
      const s = q.toLowerCase();
      const hay = `${m.h || ""} ${m.a || ""} ${m._th || ""} ${m._ta || ""} ${m.desc || ""} ${m.v} ${m.grp}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  };

  const filteredMatches = matches.filter(passes);

  // Sorting and Grouping
  const groupedMatches: Record<string, Match[]> = {};
  filteredMatches.forEach(m => {
    (groupedMatches[m.d] = groupedMatches[m.d] || []).push(m);
  });
  const days = Object.keys(groupedMatches).sort();

  // Unique sorted list of teams for the filter dropdown
  const teamList = Array.from(
    new Set(INITIAL_MATCHES.flatMap(m => [m.h, m.a].filter(Boolean) as string[]))
  ).sort();

  // Calendar export
  const handleCalendarExport = () => {
    const unplayedFiltered = filteredMatches.filter(m => m._st !== "ft");
    if (!unplayedFiltered.length) {
      alert("No upcoming matches in the current filter to export. Try clearing a filter.");
      return;
    }
    downloadICS(unplayedFiltered, party);
  };

  const filteredUnplayedCount = filteredMatches.filter(m => m._st !== "ft").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      <Header
        totalMatches={totalMatches}
        matchesTodayCount={matchesTodayCount}
        upcomingMatchesCount={upcomingMatchesCount}
        currentRound={currentRound}
        isFresh={isFresh}
      />

      <BroadcastKey
        getShareText={getShareText}
        getShareUrl={getShareUrl}
        copied={copied}
        handleCopyLink={handleCopyLink}
      />

      {/* View Selector Tabs */}
      <div className="max-w-[1180px] mx-auto w-full px-6 mt-6 flex justify-center">
        <div className="flex p-1 bg-white/3 border border-white/5 rounded-2xl select-none w-full sm:w-[320px] shadow-lg">
          <button
            type="button"
            onClick={() => setActiveView("matches")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeView === "matches"
                ? "bg-white/10 text-white shadow-md ring-1 ring-white/15 scale-[1.02]"
                : "text-muted-foreground/60 hover:text-white"
            }`}
          >
            ⚽ Matches
          </button>
          <button
            type="button"
            onClick={() => setActiveView("standings")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              activeView === "standings"
                ? "bg-white/10 text-white shadow-md ring-1 ring-white/15 scale-[1.02]"
                : "text-muted-foreground/60 hover:text-white"
            }`}
          >
            📊 Standings
          </button>
        </div>
      </div>

      {activeView === "matches" ? (
        <>
          <Filters
            teamList={teamList}
            filteredUnplayedCount={filteredUnplayedCount}
            daysCount={days.length}
            handleCalendarExport={handleCalendarExport}
          />

          <QuickChips />

          <MatchList
            days={days}
            groupedMatches={groupedMatches}
            todayStr={todayStr}
            filteredMatchesCount={filteredMatches.length}
            matches={matches}
          />
        </>
      ) : (
        <Standings 
          matches={matches} 
          onSelectTeam={(selectedTeam) => {
            // Set the team filter globally
            useFilterStore.getState().setTeam(selectedTeam);
            // Switch back to matches view
            setActiveView("matches");
          }} 
        />
      )}

      <Footer />
    </div>
  );
}
