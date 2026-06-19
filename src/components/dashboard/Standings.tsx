import type { Match } from "@/data/matches";
import { FLAGS } from "@/data/matches";
import { calculateStandings } from "@/helpers/standings-helpers";
import { Trophy, Users } from "lucide-react";

interface StandingsProps {
  matches: Match[];
  onSelectTeam: (team: string) => void;
}

export default function Standings({ matches, onSelectTeam }: StandingsProps) {
  const groups = calculateStandings(matches);

  return (
    <section className="px-6 py-8 max-w-[1180px] mx-auto w-full flex-1 animate-in fade-in-30 duration-300">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Trophy className="size-5 sm:size-6 text-gold animate-pulse" />
          GROUP STAGE STANDINGS
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Live updated standings from Group A to Group L. Top two teams automatically qualify, along with the four best third-placed teams. Click a team to view their matches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((groupData) => (
          <div 
            key={groupData.group}
            className="rounded-2xl bg-white/3 border border-white/5 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/4 shadow-lg flex flex-col"
          >
            {/* Group Header */}
            <div className="px-4.5 py-3.5 bg-white/3 border-b border-white/5 flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold tracking-wider text-[#2DE89A]">
                {groupData.group.toUpperCase()}
              </span>
              <Users className="size-4 text-muted-foreground/40" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold font-mono text-muted-foreground/60 uppercase tracking-wider">
                    <th className="py-2.5 px-4.5">Team</th>
                    <th className="py-2.5 px-2 text-center w-8">P</th>
                    <th className="py-2.5 px-2 text-center w-8">GD</th>
                    <th className="py-2.5 px-4.5 text-center w-12 text-[#2DE89A]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {groupData.standings.map((standing, index) => {
                    const isTop2 = index < 2;
                    const is3rd = index === 2;
                    
                    let positionBadgeColor = "text-muted-foreground/40";
                    if (isTop2) positionBadgeColor = "text-[#2DE89A] font-bold";
                    else if (is3rd) positionBadgeColor = "text-blue-400 font-bold";

                    return (
                      <tr 
                        key={standing.name}
                        onClick={() => onSelectTeam(standing.name)}
                        className="group hover:bg-white/4 cursor-pointer transition-all duration-200 text-xs text-foreground/90"
                      >
                        {/* Team Info */}
                        <td className="py-3 px-4.5 flex items-center gap-2 min-w-0">
                          <span className={`font-mono text-[10px] w-4.5 text-center flex-shrink-0 ${positionBadgeColor}`}>
                            {index + 1}
                          </span>
                          <span className="text-base select-none flex-shrink-0 saturate-110">
                            {FLAGS[standing.name] || "⚽"}
                          </span>
                          <span className="font-semibold truncate group-hover:text-white transition-colors">
                            {standing.name}
                          </span>
                        </td>
                        {/* Played */}
                        <td className="py-3 px-2 text-center font-mono font-medium text-muted-foreground/80">
                          {standing.p}
                        </td>
                        {/* GD */}
                        <td className={`py-3 px-2 text-center font-mono font-semibold ${
                          standing.gd > 0 ? "text-[#2DE89A]/80" : standing.gd < 0 ? "text-red-400/80" : "text-muted-foreground/50"
                        }`}>
                          {standing.gd > 0 ? `+${standing.gd}` : standing.gd}
                        </td>
                        {/* PTS */}
                        <td className="py-3 px-4.5 text-center font-mono font-black text-sm text-[#2DE89A]">
                          {standing.pts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
