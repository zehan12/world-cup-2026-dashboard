import { useState, useEffect, useRef } from "react";
import { getTeamId } from "@/data/teamIds";

export interface RosterPlayer {
  name: string;
  number: number;
  pos: "GK" | "DF" | "MF" | "FW";
  age: number;
  height: string;
  weight: string;
  headshot?: string;
}

interface EspnAthlete {
  fullName: string;
  jersey: string;
  position: {
    abbreviation: "G" | "D" | "M" | "F";
    displayName: string;
  };
  age: number;
  displayHeight: string;
  displayWeight: string;
  headshot?: { href: string; alt: string };
}

const POS_MAP: Record<string, "GK" | "DF" | "MF" | "FW"> = {
  G: "GK",
  D: "DF",
  M: "MF",
  F: "FW",
};

const cache = new Map<string, RosterPlayer[]>();

export function useTeamRoster(teamName: string | null | undefined) {
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetched = useRef<string>("");

  useEffect(() => {
    if (!teamName) return;

    const cached = cache.get(teamName);
    if (cached) {
      setPlayers(cached);
      return;
    }

    const teamId = getTeamId(teamName);
    if (!teamId) return;

    if (lastFetched.current === teamName) return;
    lastFetched.current = teamName;

    setLoading(true);
    fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${teamId}/roster`,
      { cache: "no-store" }
    )
      .then((r) => r.json())
      .then((data) => {
        const athletes: EspnAthlete[] = data.athletes || [];
        const mapped: RosterPlayer[] = athletes
          .filter((a) => a.position && POS_MAP[a.position.abbreviation])
          .map((a) => ({
            name: a.fullName,
            number: parseInt(a.jersey, 10) || 99,
            pos: POS_MAP[a.position.abbreviation],
            age: a.age || 0,
            height: a.displayHeight || "",
            weight: a.displayWeight || "",
            headshot: a.headshot?.href,
          }));
        cache.set(teamName, mapped);
        setPlayers(mapped);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [teamName]);

  return { players, loading };
}
