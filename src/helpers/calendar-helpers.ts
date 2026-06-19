import type { Match } from "@/data/matches";
import { startUTC } from "./date-helpers";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function icsStamp(dt: Date): string {
  return (
    dt.getUTCFullYear() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    "T" +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    "00Z"
  );
}

function esc(s: string): string {
  return String(s)
    .replace(/[\\;,]/g, (c) => "\\" + c)
    .replace(/\n/g, "\\n");
}

function fold(line: string): string {
  let o = "";
  while (line.length > 73) {
    o += line.slice(0, 73) + "\r\n ";
    line = line.slice(73);
  }
  return o + line;
}

export function buildICS(matches: Match[]): string {
  const stamp = icsStamp(new Date());
  const L = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//World Cup 2026 Dashboard//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:World Cup 2026",
  ];

  matches.forEach((m, i) => {
    const s = startUTC(m);
    const e = new Date(s.getTime() + 2 * 3600 * 1000);
    const title = m.h ? `${m.h} vs ${m.a}` : `${m.grp}: ${m.desc}`;
    const desc = `English: ${m.tv} — stream FOX One / Fubo. Spanish: ${m.es} — stream Peacock. ${m.grp}.`;
    
    L.push(
      "BEGIN:VEVENT",
      "UID:wc26-" + m.d + "-" + i + "@worldcup26",
      "DTSTAMP:" + stamp,
      "DTSTART:" + icsStamp(s),
      "DTEND:" + icsStamp(e),
      fold("SUMMARY:" + esc(title) + " ⚽"),
      fold("LOCATION:" + esc(m.v)),
      fold("DESCRIPTION:" + esc(desc)),
      "END:VEVENT"
    );
  });

  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

export function buildPartyICS(matches: Match[]): string {
  const stamp = icsStamp(new Date());
  const byDay: Record<string, Match[]> = {};
  
  matches.forEach((m) => {
    (byDay[m.d] = byDay[m.d] || []).push(m);
  });

  const DOWa = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const L = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//World Cup 2026 Dashboard//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:World Cup 2026 Watch Parties",
  ];

  Object.keys(byDay)
    .sort()
    .forEach((d) => {
      const ms = byDay[d].sort((a, b) => a.sk - b.sk);
      const starts = ms.map(startUTC).map((x) => x.getTime());
      const s = new Date(Math.min(...starts));
      const e = new Date(Math.max(...starts) + 2 * 3600 * 1000);
      
      const lines = ms.map((m) => {
        const who = m.h ? `${m.h} vs ${m.a}` : `${m.grp}: ${m.desc}`;
        return `${m.t} ET · ${who} · ${m.tv}/${m.es} · ${m.v}`;
      });
      
      const dow = DOWa[new Date(d + "T12:00:00").getDay()];
      L.push(
        "BEGIN:VEVENT",
        "UID:wc26party-" + d + "@worldcup26",
        "DTSTAMP:" + stamp,
        "DTSTART:" + icsStamp(s),
        "DTEND:" + icsStamp(e),
        fold("SUMMARY:⚽ World Cup — " + ms.length + " game" + (ms.length !== 1 ? "s" : "") + " (" + dow + ")"),
        fold("DESCRIPTION:" + esc(lines.join("\n"))),
        "END:VEVENT"
      );
    });

  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

export function downloadICS(matches: Match[], isParty: boolean): void {
  if (!matches.length) return;
  const data = isParty ? buildPartyICS(matches) : buildICS(matches);
  const fname = isParty ? "world-cup-2026-watch-parties.ics" : "world-cup-2026.ics";
  
  const blob = new Blob([data], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
