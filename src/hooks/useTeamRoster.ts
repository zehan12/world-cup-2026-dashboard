import { useState, useEffect, useRef } from "react";
import { getTeamId } from "@/data/teamIds";
import type { RosterPlayer, EspnRosterResponse, EspnAthlete } from "@/types";

const POS_MAP: Record<string, "GK" | "DF" | "MF" | "FW"> = {
  G: "GK",
  D: "DF",
  M: "MF",
  F: "FW",
};

const cache = new Map<string, RosterPlayer[]>();

export function useTeamRoster(teamName: string | null | undefined, enabled = true) {
  const [fetchedPlayers, setFetchedPlayers] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetched = useRef<string>("");

  // Clear fetched players if the teamName changes to avoid flashing old data
  const [prevTeam, setPrevTeam] = useState(teamName);
  if (teamName !== prevTeam) {
    setPrevTeam(teamName);
    setFetchedPlayers([]);
  }

  // If we have cached data for this team, use it immediately
  const cachedPlayers = teamName ? cache.get(teamName) : undefined;
  const players = cachedPlayers || fetchedPlayers;

  useEffect(() => {
    if (!teamName || !enabled) return;

    if (cache.has(teamName)) {
      return;
    }

    const teamId = getTeamId(teamName);
    if (!teamId) return;

    if (lastFetched.current === teamName) return;
    lastFetched.current = teamName;

    setLoading(true);
    setError(null);
    fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${teamId}/roster`,
      { cache: "no-store" }
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch roster: " + r.status);
        return r.json();
      })
      .then((data: EspnRosterResponse) => {
        const athletes: EspnAthlete[] = data.athletes || [];
        const mapped: RosterPlayer[] = athletes
          .filter((a) => a.position && POS_MAP[a.position.abbreviation])
          .map((a) => ({
            name: a.fullName,
            number: parseInt(a.jersey, 10) || 99,
            pos: POS_MAP[a.position!.abbreviation],
            age: a.age || 0,
            height: a.displayHeight || "",
            weight: a.displayWeight || "",
            headshot: a.headshot?.href,
          }));
        
        cache.set(teamName, mapped);
        setFetchedPlayers(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Roster fetch error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error fetching roster"));
        setLoading(false);
      });
  }, [teamName, enabled]);

  return { players, loading, error };
}
