import { useState, useEffect, useRef } from "react";
import type { Match } from "@/data/matches";
import { INITIAL_MATCHES } from "@/data/matches";
import { startUTC, etTodayStr } from "@/helpers/date-helpers";
import type { EspnEvent, ProcessedEvent } from "@/types";
import { ESPN_NAME_MAP } from "@/constants";
import { espnService } from "@/services/espnService";

const normName = (name?: string) => {
  const trimmed = (name || "").trim();
  return ESPN_NAME_MAP[trimmed] || trimmed;
};

const isPlaceholder = (name?: string) => {
  return /place|winner|runner|loser|tbd|group\s/i.test(name || "");
};

export function useEspnScores(initialMatches: Match[]) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isFresh, setIsFresh] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const todayStr = etTodayStr();
  const scrolledRef = useRef(false);

  const fetchEvents = async (dates?: string): Promise<ProcessedEvent[]> => {
    try {
      const d = await espnService.fetchScores(dates);

      return (d.events || []).map((e: EspnEvent) => {
        const c = e.competitions?.[0];
        const cs = c?.competitors || [];
        const home = cs.find(x => x.homeAway === "home") || cs[0];
        const away = cs.find(x => x.homeAway === "away") || cs[1];
        const statusType = e.status?.type;

        return {
          when: new Date(e.date).getTime(),
          state: statusType?.state,
          detail: statusType?.shortDetail || statusType?.detail || "",
          hName: home?.team?.displayName || "",
          hScore: home?.score,
          aName: away?.team?.displayName || "",
          aScore: away?.score,
        };
      });
    } catch (err) {
      console.error("Failed to fetch ESPN events", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    }
  };

  const applyEvents = (eventsList: ProcessedEvent[]) => {
    setMatches(prevMatches => {
      const nextMatches = [...prevMatches];
      eventsList.forEach(ev => {
        const eh = normName(ev.hName);
        const ea = normName(ev.aName);
        let best: Match | null = null;
        let bestDiff = Infinity;

        nextMatches.forEach(m => {
          const diff = Math.abs(startUTC(m).getTime() - ev.when);
          if (diff > 90 * 60 * 1000) return; // ±90 min window
          if (m.h) {
            const pair = [m.h, m.a];
            if (!(pair.includes(eh) && pair.includes(ea))) return;
          }
          if (diff < bestDiff) {
            bestDiff = diff;
            best = m;
          }
        });

        if (!best) return;
        const m = best as Match;

        if (ev.state) {
          m._st = ev.state === "in" ? "live" : ev.state === "post" ? "ft" : "up";
        }
        m._detail = ev.state === "in" ? ev.detail : "";

        const hasScore = ev.hScore != null && ev.aScore != null && ev.state !== "pre";
        if (!m.h) {
          // knockout: resolve teams from feed
          if (eh && ea && !isPlaceholder(ev.hName) && !isPlaceholder(ev.aName)) {
            m._th = eh;
            m._ta = ea;
          }
          if (hasScore) {
            m._scoreH = ev.hScore;
            m._scoreA = ev.aScore;
          }
        } else if (hasScore) {
          // group: align scores to M orientation
          if (eh === m.h) {
            m._scoreH = ev.hScore;
            m._scoreA = ev.aScore;
          } else {
            m._scoreH = ev.aScore;
            m._scoreA = ev.hScore;
          }
        }
      });
      return nextMatches;
    });
  };

  const hydrateScores = async (dates?: string) => {
    try {
      const eventsList = await fetchEvents(dates);
      applyEvents(eventsList);
      setIsFresh(true);
      setError(null);
    } catch (e: unknown) {
      console.log(e)
      setIsFresh(false);
    }
  };

  const liveWindowActive = () => {
    const now = Date.now();
    return matches.some(m => {
      if (m._st === "live") return true;
      const s = startUTC(m).getTime();
      return s - now < 20 * 60 * 1000 && s - now > -150 * 60 * 1000;
    });
  };

  const getPollDates = () => {
    const f = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const t = new Date(todayStr + "T12:00:00");
    const y = new Date(t);
    const z = new Date(t);
    y.setDate(y.getDate() - 1);
    z.setDate(z.getDate() + 1);
    return `${f(y)}-${f(z)}`;
  };

  useEffect(() => {
    const firstDate = INITIAL_MATCHES[0].d.replace(/-/g, "");
    const lastDate = INITIAL_MATCHES[INITIAL_MATCHES.length - 1].d.replace(/-/g, "");

    const init = async () => {
      await hydrateScores(`${firstDate}-${lastDate}`);
      if (!scrolledRef.current) {
        setTimeout(() => {
          const el = document.querySelector(".daygroup-today");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            scrolledRef.current = true;
          }
        }, 600);
      }
    };

    init();

    let pollInterval: ReturnType<typeof setTimeout>;

    const runPoll = async () => {
      if (document.visibilityState === "visible") {
        await hydrateScores(getPollDates());
      }
      scheduleNextPoll();
    };

    const scheduleNextPoll = () => {
      const isLive = liveWindowActive();
      const delay = isLive ? 45000 : 600000; // 45 seconds if live games, else 10 minutes
      pollInterval = setTimeout(runPoll, delay);
    };

    scheduleNextPoll();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        hydrateScores(getPollDates());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { matches, isFresh, error };
}
