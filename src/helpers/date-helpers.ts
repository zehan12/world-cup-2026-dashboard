import type { Match } from "@/data/matches";

export const TZ_ZONES: Record<string, string> = {
	Pacific: "America/Los_Angeles",
	Mountain: "America/Denver",
	Central: "America/Chicago",
	UK: "Europe/London",
	CET: "Europe/Paris",
};

export function etTodayStr(): string {
	const f = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return f.format(new Date());
}

export function startUTC(m: Match): Date {
	const [Y, Mo, D] = m.d.split("-").map(Number);
	let h = 15;
	let min = 0;
	let off = 0;
	const tm = m.t.match(/(\d+):(\d+)\s*(AM|PM)/i);
	if (tm) {
		h = +tm[1] % 12;
		if (/PM/i.test(tm[3])) h += 12;
		min = +tm[2];
	}
	if (m.sk >= 24) {
		off = 1;
		h = 0;
		min = 0;
	} // post-midnight kickoff = next calendar day
	return new Date(Date.UTC(Y, Mo - 1, D + off, h + 4, min, 0)); // Eastern (EDT) = UTC-4 in summer
}

export function matchStatus(m: Match): "live" | "ft" | "up" {
	if (m.t === "TBD") return "up";
	let dd = m.d;
	let hour = Math.floor(m.sk % 24);

	if (m.sk >= 24) {
		const dt = new Date(`${dd}T00:00:00`);
		dt.setDate(dt.getDate() + 1);
		dd = dt.toISOString().slice(0, 10);
		hour = 0;
	}

	let start = new Date(`${dd}T${String(hour).padStart(2, "0")}:00:00-04:00`);
	if (m.t.includes(":30")) {
		start = new Date(`${dd}T${String(hour).padStart(2, "0")}:30:00-04:00`);
	}

	const now = new Date();
	const end = new Date(start.getTime() + 2.25 * 3600 * 1000);

	if (m.res) return "ft";
	if (now > end) return "ft";
	if (now >= start && now <= end) return "live";
	return "up";
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

export function fmtDay(d: string): { dow: string; dt: string } {
	const x = new Date(`${d}T12:00:00`);
	return {
		dow: DOW[x.getDay()],
		dt: `${MON[x.getMonth()]} ${x.getDate()}`,
	};
}

export function fmtTime(
	m: Match,
	selectedTz: string,
): { time: string; zone: string } {
	if (m.t === "FT" || m.t === "TBD") return { time: m.t, zone: "" };
	if (!selectedTz || selectedTz === "Eastern") return { time: m.t, zone: "ET" };

	try {
		const dt = startUTC(m); // absolute instant (UTC)
		const tz = selectedTz === "Auto" ? undefined : TZ_ZONES[selectedTz];
		const time = new Intl.DateTimeFormat(undefined, {
			timeZone: tz,
			hour: "numeric",
			minute: "2-digit",
		}).format(dt);

		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: tz,
			hour: "numeric",
			timeZoneName: "short",
		}).formatToParts(dt);

		const zone = parts.find((p) => p.type === "timeZoneName")?.value || "";
		return { time, zone };
	} catch {
		return { time: m.t, zone: "ET" };
	}
}
