import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { useFilterStore } from "@/store";

export const filterParsers = {
	q: parseAsString.withDefault(""),
	stage: parseAsString.withDefault(""),
	team: parseAsString.withDefault(""),
	tv: parseAsString.withDefault(""),
	tz: parseAsString.withDefault("Auto"),
	today: parseAsBoolean.withDefault(false),
	up: parseAsBoolean.withDefault(false),
	party: parseAsBoolean.withDefault(false),
};

export function useSyncNuqs() {
	const [urlFilters, setUrlFilters] = useQueryStates(filterParsers);

	const q = useFilterStore((s) => s.q);
	const stage = useFilterStore((s) => s.stage);
	const team = useFilterStore((s) => s.team);
	const tv = useFilterStore((s) => s.tv);
	const tz = useFilterStore((s) => s.tz);
	const today = useFilterStore((s) => s.today);
	const up = useFilterStore((s) => s.up);
	const party = useFilterStore((s) => s.party);

	const setQ = useFilterStore((s) => s.setQ);
	const setStage = useFilterStore((s) => s.setStage);
	const setTeam = useFilterStore((s) => s.setTeam);
	const setTv = useFilterStore((s) => s.setTv);
	const setTz = useFilterStore((s) => s.setTz);
	const setToday = useFilterStore((s) => s.setToday);
	const setUp = useFilterStore((s) => s.setUp);
	const setParty = useFilterStore((s) => s.setParty);

	const initialized = useRef(false);

	// Sync URL to Store ONCE on mount
	useEffect(() => {
		if (!initialized.current) {
			if (urlFilters.q) setQ(urlFilters.q);
			if (urlFilters.stage) setStage(urlFilters.stage);
			if (urlFilters.team) setTeam(urlFilters.team);
			if (urlFilters.tv) setTv(urlFilters.tv);
			if (urlFilters.tz !== "Auto") setTz(urlFilters.tz);
			if (urlFilters.today) setToday(urlFilters.today);
			if (urlFilters.up) setUp(urlFilters.up);
			if (urlFilters.party) setParty(urlFilters.party);
			initialized.current = true;
		}
	}, [
		urlFilters,
		setQ,
		setStage,
		setTeam,
		setTv,
		setTz,
		setToday,
		setUp,
		setParty,
	]);

	// Sync Store back to URL whenever Store changes
	useEffect(() => {
		if (initialized.current) {
			setUrlFilters({
				q: q || null,
				stage: stage || null,
				team: team || null,
				tv: tv || null,
				tz: tz === "Auto" ? null : tz,
				today: today || null,
				up: up || null,
				party: party || null,
			});
		}
	}, [q, stage, team, tv, tz, today, up, party, setUrlFilters]);
}
