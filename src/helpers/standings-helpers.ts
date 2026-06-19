import type { Match } from "@/data/matches";

export interface TeamStanding {
  name: string;
  p: number;   // Played
  w: number;   // Won
  d: number;   // Drawn
  l: number;   // Lost
  gf: number;  // Goals For
  ga: number;  // Goals Against
  gd: number;  // Goal Difference
  pts: number; // Points
}

export interface GroupStanding {
  group: string;
  standings: TeamStanding[];
}

export function calculateStandings(matches: Match[]): GroupStanding[] {
  const groupsData: Record<string, Record<string, TeamStanding>> = {};

  // Initialize all teams in their respective groups
  matches.forEach(m => {
    if (m.grp && m.grp.startsWith("Group ")) {
      const gName = m.grp;
      if (!groupsData[gName]) {
        groupsData[gName] = {};
      }
      if (m.h) {
        groupsData[gName][m.h] = groupsData[gName][m.h] || {
          name: m.h, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
        };
      }
      if (m.a) {
        groupsData[gName][m.a] = groupsData[gName][m.a] || {
          name: m.a, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
        };
      }
    }
  });

  // Calculate results
  matches.forEach(m => {
    if (m.grp && m.grp.startsWith("Group ") && m.h && m.a) {
      const gName = m.grp;
      const homeTeam = m.h;
      const awayTeam = m.a;

      let played = false;
      let homeScore = 0;
      let awayScore = 0;

      // Extract score
      if (m._scoreH !== undefined && m._scoreA !== undefined) {
        const sh = typeof m._scoreH === 'string' ? parseInt(m._scoreH, 10) : m._scoreH;
        const sa = typeof m._scoreA === 'string' ? parseInt(m._scoreA, 10) : m._scoreA;
        if (!isNaN(sh) && !isNaN(sa)) {
          homeScore = sh;
          awayScore = sa;
          // Only count if final or live (for live standings)
          if (m._st === "ft" || m._st === "live") {
            played = true;
          }
        }
      } else if (m.res) {
        const parts = m.res.split("-");
        if (parts.length === 2) {
          const sh = parseInt(parts[0], 10);
          const sa = parseInt(parts[1], 10);
          if (!isNaN(sh) && !isNaN(sa)) {
            homeScore = sh;
            awayScore = sa;
            played = true;
          }
        }
      }

      if (played && groupsData[gName][homeTeam] && groupsData[gName][awayTeam]) {
        const hStats = groupsData[gName][homeTeam];
        const aStats = groupsData[gName][awayTeam];

        hStats.p += 1;
        aStats.p += 1;

        hStats.gf += homeScore;
        hStats.ga += awayScore;
        aStats.gf += awayScore;
        aStats.ga += homeScore;

        hStats.gd = hStats.gf - hStats.ga;
        aStats.gd = aStats.gf - aStats.ga;

        if (homeScore > awayScore) {
          hStats.w += 1;
          hStats.pts += 3;
          aStats.l += 1;
        } else if (awayScore > homeScore) {
          aStats.w += 1;
          aStats.pts += 3;
          hStats.l += 1;
        } else {
          hStats.d += 1;
          hStats.pts += 1;
          aStats.d += 1;
          aStats.pts += 1;
        }
      }
    }
  });

  // Convert to array and sort groups/teams
  const result: GroupStanding[] = Object.keys(groupsData).sort().map(gName => {
    const standings = Object.values(groupsData[gName]).sort((x, y) => {
      if (x.pts !== y.pts) return y.pts - x.pts;
      if (x.gd !== y.gd) return y.gd - x.gd;
      if (x.gf !== y.gf) return y.gf - x.gf;
      return x.name.localeCompare(y.name);
    });

    return {
      group: gName,
      standings
    };
  });

  return result;
}
