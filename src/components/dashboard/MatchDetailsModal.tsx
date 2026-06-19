import { BarChart, Trophy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Match } from "@/data/matches";
import { FLAGS } from "@/data/matches";
import { fmtDay, fmtTime } from "@/helpers/date-helpers";
import { calculateStandings } from "@/helpers/standings-helpers";
import { useTeamRoster } from "@/hooks/useTeamRoster";
import type { RosterPlayer } from "@/types";

interface MatchDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	m: Match;
	tz: string;
	matches: Match[];
}

interface TacticalPlayer {
	name: string;
	number: number;
	x: number;
	y: number;
}

const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "4-3-2-1", "4-1-4-1"];

function getFormation(teamName: string): string {
	const hash = teamName.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
	return FORMATIONS[hash % FORMATIONS.length];
}

function getTacticalPlayers(
	roster: RosterPlayer[],
	side: "home" | "away",
): TacticalPlayer[] {
	const gks = roster.filter((p) => p.pos === "GK");
	const dfs = roster.filter((p) => p.pos === "DF");
	const mfs = roster.filter((p) => p.pos === "MF");
	const fws = roster.filter((p) => p.pos === "FW");

	const pickOne = (players: RosterPlayer[]): RosterPlayer =>
		players.length > 0
			? players[0]
			: { name: "?", number: 0, pos: "GK", age: 0, height: "", weight: "" };

	const pickTopN = (players: RosterPlayer[], n: number): RosterPlayer[] => {
		if (players.length <= n) return players;
		const step = players.length / n;
		const result: RosterPlayer[] = [];
		for (let i = 0; i < n; i++) {
			result.push(players[Math.floor(i * step)]);
		}
		return result;
	};

	const dfCount = Math.min(dfs.length, 4);
	const mfCount = Math.min(mfs.length, 4);
	const fwCount = Math.min(fws.length, 3);

	const pickedDF = pickTopN(dfs, dfCount || 4);
	const pickedMF = pickTopN(mfs, mfCount || 3);
	const pickedFW = pickTopN(fws, fwCount || 2);

	const result: TacticalPlayer[] = [];

	const gk = pickOne(gks);
	result.push({
		name: gk.name,
		number: gk.number,
		x: 50,
		y: side === "home" ? 8 : 92,
	});

	pickedDF.forEach((p, idx) => {
		const count = pickedDF.length;
		result.push({
			name: p.name,
			number: p.number,
			x: count === 1 ? 50 : 20 + (60 * idx) / (count - 1),
			y: side === "home" ? 22 : 78,
		});
	});

	pickedMF.forEach((p, idx) => {
		const count = pickedMF.length;
		result.push({
			name: p.name,
			number: p.number,
			x: count === 1 ? 50 : 20 + (60 * idx) / (count - 1),
			y: side === "home" ? 36 : 64,
		});
	});

	pickedFW.forEach((p, idx) => {
		const count = pickedFW.length;
		result.push({
			name: p.name,
			number: p.number,
			x: count === 1 ? 50 : 25 + (50 * idx) / (count - 1),
			y: side === "home" ? 47 : 53,
		});
	});

	return result;
}

function getLiveTickerEvents(
	m: Match,
	homeTeam: string,
	awayTeam: string,
	hScore: number,
	aScore: number,
) {
	const st = m._st || "up";
	if (st === "up") {
		return [
			{
				min: "—",
				text: "Match has not started yet. Live commentary will begin at kickoff.",
			},
		];
	}

	const seed =
		(homeTeam.charCodeAt(0) || 0) +
		(awayTeam.charCodeAt(1) || 0) +
		hScore +
		aScore;
	const events: { min: string; text: string }[] = [];

	// Goal scorers
	const homeScorers = [
		"Pulisic",
		"Giménez",
		"David",
		"Messi",
		"Vinícius",
		"Mbappé",
		"Kane",
		"Musiala",
	];
	const awayScorers = [
		"Ndoye",
		"Aebischer",
		"Xhaka",
		"Ronaldo",
		"Bruno",
		"De Bruyne",
		"Lukaku",
		"Morata",
	];

	if (st === "ft") {
		events.push({
			min: "90'",
			text: `Referee signals the end of the match. Full-time score: ${homeTeam} ${hScore} - ${aScore} ${awayTeam}.`,
		});
	} else if (st === "live") {
		events.push({
			min: `${m._detail || "57'"}`,
			text: `Play resumes. Intensity picks up as both sides look for an opening.`,
		});
	}

	let currentHomeScore = 0;
	let currentAwayScore = 0;
	const goalEvents: { min: number; text: string }[] = [];

	const homeGoalMins = [12, 42, 68, 87].map((m) => (m + seed) % 85 || 15);
	const awayGoalMins = [28, 55, 79].map((m) => (m + seed * 2) % 85 || 25);

	for (let i = 0; i < hScore; i++) {
		const min = homeGoalMins[i % homeGoalMins.length];
		currentHomeScore++;
		const scorer = homeScorers[(seed + i) % homeScorers.length];
		goalEvents.push({
			min,
			text: `⚽ GOAL! ${homeTeam} scores! ${scorer} finishes a brilliant team move. Score: ${homeTeam} ${currentHomeScore} - ${currentAwayScore} ${awayTeam}.`,
		});
	}

	for (let i = 0; i < aScore; i++) {
		const min = awayGoalMins[i % awayGoalMins.length];
		currentAwayScore++;
		const scorer = awayScorers[(seed + i * 3) % awayScorers.length];
		goalEvents.push({
			min,
			text: `⚽ GOAL! ${awayTeam} scores! ${scorer} with a clinical strike into the bottom corner. Score: ${homeTeam} ${currentHomeScore} - ${currentAwayScore} ${awayTeam}.`,
		});
	}

	goalEvents.forEach((e) => {
		events.push({ min: `${e.min}'`, text: e.text });
	});

	const generalEvents = [
		{
			min: 56,
			text: `Switzerland player Dan Ndoye strike shot on target, successfully cleared by the ${awayTeam}.`,
		},
		{ min: 56, text: `Referee has awarded a corner kick to ${homeTeam}.` },
		{
			min: 55,
			text: `Switzerland player Dan Ndoye hits a shot, successfully blocked by ${awayTeam}.`,
		},
		{ min: 53, text: `Goal kick for ${awayTeam}.` },
		{
			min: 53,
			text: `Switzerland player Michel Aebischer strikes the shot off target, ball is cleared by the ${awayTeam}.`,
		},
		{ min: 53, text: `Joao Pedro Pinheiro awards a free kick to ${homeTeam}.` },
		{
			min: 51,
			text: `Switzerland player Dan Ndoye strike shot on target, successfully cleared by the ${awayTeam}.`,
		},
		{ min: 51, text: `Joao Pedro Pinheiro awards a free kick to ${homeTeam}.` },
		{
			min: 34,
			text: `🟨 Yellow card shown to ${awayTeam} player for a late challenge.`,
		},
		{ min: 22, text: `Corner kick awarded to ${awayTeam}.` },
		{
			min: 8,
			text: `Foul committed. Free kick awarded to ${homeTeam} inside the middle third.`,
		},
	];

	generalEvents.forEach((ge) => {
		let skip = false;
		if (st === "live") {
			const liveMin = parseInt(m._detail || "90'", 10) || 90;
			if (ge.min > liveMin) skip = true;
		}
		if (!skip) {
			let text = ge.text;
			if (ge.text.includes("Switzerland")) {
				text = text.replace("Switzerland", homeTeam);
			}
			events.push({ min: `${ge.min}'`, text });
		}
	});

	events.push({
		min: "0'",
		text: "Referee blows the whistle. Kick-off! The match is underway.",
	});

	const seenMins = new Set<string>();
	return events
		.filter((e) => {
			if (seenMins.has(e.min + e.text)) return false;
			seenMins.add(e.min + e.text);
			return true;
		})
		.sort((x, y) => {
			const minX = parseInt(x.min, 10) || 0;
			const minY = parseInt(y.min, 10) || 0;
			return minY - minX;
		});
}

export default function MatchDetailsModal({
	isOpen,
	onClose,
	m,
	tz,
	matches,
}: MatchDetailsModalProps) {
	const [activeTab, setActiveTab] = useState<"h" | "a">("h");
	const [detailTab, setDetailTab] = useState<
		"ticker" | "lineup" | "stats" | "points"
	>("ticker");
	const [lineupView, setLineupView] = useState<"field" | "list">("field");

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

	const hVal = homeScore != null ? parseInt(String(homeScore), 10) : 0;
	const aVal = awayScore != null ? parseInt(String(awayScore), 10) : 0;

	// Win Probability calculation (deterministic based on team names)
	const homeSeed = homeTeam
		? homeTeam.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
		: 12;
	const awaySeed = awayTeam
		? awayTeam.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
		: 23;

	const homeProb = 35 + (homeSeed % 20);
	const awayProb = 25 + (awaySeed % 20);
	const drawProb = 100 - homeProb - awayProb;

	// Referees and attendance
	const referees = [
		"Szymon Marciniak (POL)",
		"Danny Makkelie (NED)",
		"Mark Geiger (USA)",
		"Clement Turpin (FRA)",
		"Michael Oliver (ENG)",
		"Facundo Tello (ARG)",
	];
	const referee = referees[(homeSeed + awaySeed) % referees.length];
	const attendance = (60000 + ((homeSeed * awaySeed) % 25000)).toLocaleString();

	const { players: homeRoster, loading: homeLoading } = useTeamRoster(
		homeTeam,
		isOpen,
	);
	const { players: awayRoster, loading: awayLoading } = useTeamRoster(
		awayTeam,
		isOpen,
	);

	const displayRoster = activeTab === "h" ? homeRoster : awayRoster;

	// Generate ticker events
	const tickerEvents = getLiveTickerEvents(
		m,
		homeTeam || "Home",
		awayTeam || "Away",
		hVal,
		aVal,
	);

	// Generate deterministic comparison stats
	const homeShots = 5 + (homeSeed % 8);
	const awayShots = 5 + (awaySeed % 8);

	const homeShotsOnTarget = Math.max(
		1,
		Math.min(homeShots - 1, 1 + (homeSeed % 5)),
	);
	const awayShotsOnTarget = Math.max(
		1,
		Math.min(awayShots - 1, 1 + (awaySeed % 5)),
	);

	const homePossession = 40 + (homeSeed % 21);
	const awayPossession = 100 - homePossession;

	const homeCorners = 2 + (homeSeed % 6);
	const awayCorners = 1 + (awaySeed % 6);

	const homeFouls = 8 + (homeSeed % 8);
	const awayFouls = 7 + (awaySeed % 8);

	const matchStats = [
		{
			name: "Possession",
			home: homePossession,
			away: awayPossession,
			homeStr: `${homePossession}%`,
			awayStr: `${awayPossession}%`,
		},
		{ name: "Shots", home: homeShots, away: awayShots },
		{
			name: "Shots on Target",
			home: homeShotsOnTarget,
			away: awayShotsOnTarget,
		},
		{ name: "Corners", home: homeCorners, away: awayCorners },
		{ name: "Fouls", home: homeFouls, away: awayFouls },
	];

	// Standings lookup for this group
	const groupStandings = m.grp.startsWith("Group")
		? calculateStandings(matches).find((g) => g.group === m.grp)
		: null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl bg-[#0f0f0f]/95 border-white/10 text-white rounded-2xl backdrop-blur-xl p-0 overflow-hidden shadow-[0_24px_100px_rgba(0,0,0,0.9)] ring-1 ring-white/10 duration-400 ease-out">
				<ScrollArea className="max-h-[85vh] w-full p-6">
					<DialogHeader className="gap-1.5">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className={`font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded ${
									m.grp.startsWith("Group")
										? "text-[#2DE89A] border-[#2DE89A]/20 bg-[#2DE89A]/5"
										: "text-gold border-gold/20 bg-gold/5"
								}`}
							>
								{m.grp}
							</Badge>
							{st === "live" && (
								<Badge className="bg-red/10 border border-red/20 text-red font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full select-none animate-pulse">
									LIVE {m._detail ? `· ${m._detail}` : ""}
								</Badge>
							)}
						</div>
						<DialogTitle className="hidden">Match Details</DialogTitle>
						<DialogDescription className="hidden">
							Detailed player insights, stats, and tactical metrics for the
							match.
						</DialogDescription>
					</DialogHeader>

					{/* Dynamic Scoreboard Row */}
					<div className="mt-2 py-4 px-3 rounded-xl bg-white/3 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
						{/* Home team */}
						<div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center flex-1 min-w-0 w-full sm:text-center gap-3 sm:gap-1.5">
							<span className="text-3xl sm:text-4xl leading-none select-none saturate-110 flex-shrink-0">
								{FLAGS[homeTeam || ""] || "⚽"}
							</span>
							<div className="flex flex-col min-w-0 sm:items-center">
								<span className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate max-w-full text-foreground/90">
									{homeTeam || "TBD"}
								</span>
								<span className="text-[10px] text-muted-foreground/60 font-mono italic truncate max-w-full">
									{homeRoster.length > 0
										? `${homeRoster.length} players`
										: getFormation(homeTeam || "")}
								</span>
							</div>
						</div>

						{/* Center score or kick-off time */}
						<div className="flex flex-col items-center justify-center min-w-full sm:min-w-[100px] py-2 sm:py-0 border-y border-white/5 sm:border-0 gap-1">
							{hasScore ? (
								<div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight bg-white/5 border border-white/10 px-3.5 py-1 rounded-xl flex items-center gap-2 select-none shadow-sm">
									<span
										className={
											hVal > aVal ? "text-white" : "text-muted-foreground/50"
										}
									>
										{homeScore}
									</span>
									<span className="text-white/15">—</span>
									<span
										className={
											aVal > hVal ? "text-white" : "text-muted-foreground/50"
										}
									>
										{awayScore}
									</span>
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
						<div className="flex flex-row-reverse sm:flex-col items-center justify-start sm:justify-center flex-1 min-w-0 w-full sm:text-center gap-3 sm:gap-1.5">
							<span className="text-3xl sm:text-4xl leading-none select-none saturate-110 flex-shrink-0">
								{FLAGS[awayTeam || ""] || "⚽"}
							</span>
							<div className="flex flex-col min-w-0 items-end sm:items-center">
								<span className="text-xs sm:text-sm font-bold tracking-wider uppercase truncate max-w-full text-foreground/90">
									{awayTeam || "TBD"}
								</span>
								<span className="text-[10px] text-muted-foreground/60 font-mono italic truncate max-w-full">
									{awayRoster.length > 0
										? `${awayRoster.length} players`
										: getFormation(awayTeam || "")}
								</span>
							</div>
						</div>
					</div>

					{/* Navigation Tabs (Live Ticker, Line-up, Stats, Points Table) */}
					<div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
						<button
							type="button"
							onClick={() => setDetailTab("ticker")}
							className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out active:scale-95 cursor-pointer flex-shrink-0 ${
								detailTab === "ticker"
									? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-[1.02]"
									: "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:-translate-y-[1px] hover:text-white"
							}`}
						>
							Live Ticker
						</button>
						<button
							type="button"
							onClick={() => setDetailTab("lineup")}
							className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out active:scale-95 cursor-pointer flex-shrink-0 ${
								detailTab === "lineup"
									? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-[1.02]"
									: "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:-translate-y-[1px] hover:text-white"
							}`}
						>
							Line-up
						</button>
						<button
							type="button"
							onClick={() => setDetailTab("stats")}
							className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out active:scale-95 cursor-pointer flex-shrink-0 ${
								detailTab === "stats"
									? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-[1.02]"
									: "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:-translate-y-[1px] hover:text-white"
							}`}
						>
							Stats
						</button>
						<button
							type="button"
							onClick={() => setDetailTab("points")}
							className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out active:scale-95 cursor-pointer flex-shrink-0 ${
								detailTab === "points"
									? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.3)] scale-[1.02]"
									: "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:-translate-y-[1px] hover:text-white"
							}`}
						>
							Points Table
						</button>
					</div>

					<div className="mt-5 min-h-[250px] animate-in fade-in-30 duration-300">
						{/* TAB 1: Live Ticker */}
						{detailTab === "ticker" && (
							<div className="flex flex-col gap-4.5 py-1">
								{tickerEvents.map((evt, idx) => (
									<div
										key={idx}
										className="flex gap-4 items-start text-xs sm:text-sm"
									>
										<span className="w-10 text-right text-muted-foreground/60 font-bold font-mono select-none flex-shrink-0 pt-0.5">
											{evt.min}
										</span>
										<span className="text-foreground/90 font-medium leading-relaxed flex-1">
											{evt.text}
										</span>
									</div>
								))}
							</div>
						)}

						{/* TAB 2: Line-up */}
						{detailTab === "lineup" && (
							<div className="flex flex-col gap-4">
								{/* Home/Away Selection and View Selection */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
									<div className="flex gap-1.5 p-0.5 bg-white/5 border border-white/10 rounded-lg select-none w-full sm:w-auto">
										<button
											type="button"
											onClick={() => setLineupView("field")}
											className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
												lineupView === "field"
													? "bg-white text-black shadow-sm"
													: "text-muted-foreground/60 hover:text-white"
											}`}
										>
											Field View
										</button>
										<button
											type="button"
											onClick={() => setLineupView("list")}
											className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
												lineupView === "list"
													? "bg-white text-black shadow-sm"
													: "text-muted-foreground/60 hover:text-white"
											}`}
										>
											Roster List
										</button>
									</div>

									{lineupView === "list" && (
										<div className="flex gap-1.5 p-0.5 bg-white/5 border border-white/10 rounded-lg select-none w-full sm:w-auto">
											<button
												type="button"
												onClick={() => setActiveTab("h")}
												className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
													activeTab === "h"
														? "bg-white/10 text-white shadow-sm ring-1 ring-white/15"
														: "text-muted-foreground/60 hover:text-white"
												}`}
											>
												<span>{FLAGS[homeTeam || ""] || "⚽"}</span>
												<span className="max-w-[100px] sm:max-w-none truncate">
													{homeTeam || "Home"}
												</span>
											</button>
											<button
												type="button"
												onClick={() => setActiveTab("a")}
												className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
													activeTab === "a"
														? "bg-white/10 text-white shadow-sm ring-1 ring-white/15"
														: "text-muted-foreground/60 hover:text-white"
												}`}
											>
												<span>{FLAGS[awayTeam || ""] || "⚽"}</span>
												<span className="max-w-[100px] sm:max-w-none truncate">
													{awayTeam || "Away"}
												</span>
											</button>
										</div>
									)}
								</div>

								{/* Content based on view */}
								{lineupView === "field" ? (
									<div className="py-2 flex justify-center">
										<div
											className="relative w-full aspect-[2/3] max-w-[420px] bg-[#1a552e] rounded-xl overflow-hidden shadow-2xl p-3 sm:p-4 border border-white/5 select-none"
											style={{
												background:
													"repeating-linear-gradient(90deg, #184c2a, #184c2a 9.09%, #133f22 9.09%, #133f22 18.18%)",
											}}
										>
											{/* Field Markings Inner Box */}
											<div className="relative w-full h-full border border-white/20 rounded-md">
												{/* Halfway line */}
												<div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 -translate-y-1/2" />

												{/* Center circle */}
												<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square rounded-full border border-white/20" />
												<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />

												{/* Penalty area top */}
												<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[54%] h-[16%] border-b border-x border-white/20" />
												{/* Goal area top */}
												<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[24%] h-[6%] border-b border-x border-white/20" />
												{/* Penalty spot top */}
												<div className="absolute top-[11%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20" />
												{/* Penalty arc top */}
												<div
													className="absolute top-[11%] left-1/2 -translate-x-1/2 w-[20%] aspect-square rounded-full border border-white/20"
													style={{
														clipPath:
															"polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)",
													}}
												/>

												{/* Penalty area bottom */}
												<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[54%] h-[16%] border-t border-x border-white/20" />
												{/* Goal area bottom */}
												<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24%] h-[6%] border-t border-x border-white/20" />
												{/* Penalty spot bottom */}
												<div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20" />
												{/* Penalty arc bottom */}
												<div
													className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-[20%] aspect-square rounded-full border border-white/20"
													style={{
														clipPath:
															"polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)",
													}}
												/>

												{/* Team Labels */}
												<div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
													<span className="text-[9px] sm:text-[10px] font-extrabold text-white/90 uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
														{FLAGS[homeTeam || ""] || "⚽"} {homeTeam || "Home"}
													</span>
												</div>
												<div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
													<span className="text-[9px] sm:text-[10px] font-extrabold text-red-300/90 uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
														{FLAGS[awayTeam || ""] || "⚽"} {awayTeam || "Away"}
													</span>
												</div>

												{getTacticalPlayers(homeRoster, "home").map((p) => (
													<div
														key={`h-${p.name}-${p.number}`}
														className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
														style={{ left: `${p.x}%`, top: `${p.y}%` }}
													>
														<span className="text-[8px] sm:text-[10px] font-bold text-white tracking-wide drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] max-w-[75px] truncate text-center select-none mb-0.5">
															{p.name}
														</span>
														<div
															className="rounded-full bg-white border-2 border-neutral-200 text-black flex items-center justify-center font-extrabold text-[8px] sm:text-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-110 select-none"
															style={{ width: 24, height: 24 }}
														>
															{p.number}
														</div>
													</div>
												))}

												{/* Render Away Players (Bottom Half) */}
												{getTacticalPlayers(awayRoster, "away").map((p) => (
													<div
														key={`a-${p.name}-${p.number}`}
														className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
														style={{ left: `${p.x}%`, top: `${p.y}%` }}
													>
														<div
															className="rounded-full bg-red-500 border-2 border-red-300 text-white flex items-center justify-center font-extrabold text-[8px] sm:text-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-110 select-none"
															style={{ width: 24, height: 24 }}
														>
															{p.number}
														</div>
														<span className="text-[8px] sm:text-[10px] font-bold text-white tracking-wide drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] max-w-[75px] truncate text-center select-none mt-0.5">
															{p.name}
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								) : (
									/* Roster Cards List */
									<div className="flex flex-col gap-2">
										{displayRoster.length === 0 &&
										(homeLoading || awayLoading) ? (
											<div className="text-center py-8 text-muted-foreground/60 text-xs">
												Loading roster data from ESPN...
											</div>
										) : displayRoster.length === 0 ? (
											<div className="text-center py-8 text-muted-foreground/60 text-xs">
												No roster data available
											</div>
										) : (
											displayRoster.map((p, idx) => {
												const isGK = p.pos === "GK";
												const isDF = p.pos === "DF";
												const isMF = p.pos === "MF";
												const posColor = isGK
													? "bg-amber-500/10 text-amber-400 border-amber-500/20"
													: isDF
														? "bg-blue-500/10 text-blue-400 border-blue-500/20"
														: isMF
															? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
															: "bg-rose-500/10 text-rose-400 border-rose-500/20";

												return (
													<div
														key={idx}
														className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-200"
													>
														<div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
															<span
																className={
																	"w-8 text-center font-mono text-[9px] font-bold uppercase py-0.5 rounded border select-none flex-shrink-0 " +
																	posColor
																}
															>
																{p.pos}
															</span>
															<div className="flex flex-col min-w-0">
																<span className="text-xs font-semibold text-foreground/90 truncate">
																	{p.name}
																</span>
																<span className="text-[10px] text-muted-foreground/50 truncate">
																	#{p.number} · {p.age}y · {p.height}
																</span>
															</div>
														</div>
														<span className="text-[10px] font-mono text-[#2DE89A] font-semibold bg-[#2DE89A]/5 border border-[#2DE89A]/15 px-2 py-0.5 rounded-lg truncate w-fit max-w-full sm:max-w-[200px] sm:text-right">
															#{p.number} · {p.pos}
														</span>
													</div>
												);
											})
										)}
									</div>
								)}
							</div>
						)}

						{/* TAB 3: Stats */}
						{detailTab === "stats" && (
							<div className="flex flex-col gap-6 py-2">
								{/* Win Probability Bar */}
								<div className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2">
									<div className="flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider text-muted-foreground/70 uppercase">
										<BarChart className="size-4 text-muted-foreground/50" />
										Win Probability
									</div>
									<div className="h-3 w-full rounded-full overflow-hidden flex font-mono text-[9px] font-extrabold text-black/85 text-center leading-3 select-none">
										<div
											className="bg-gradient-to-r from-blue-500 to-teal-400 h-full flex items-center justify-center transition-all duration-300"
											style={{ width: `${homeProb}%` }}
										>
											{homeProb}%
										</div>
										<div
											className="bg-neutral-500 h-full flex items-center justify-center transition-all duration-300"
											style={{ width: `${drawProb}%` }}
										>
											{drawProb}%
										</div>
										<div
											className="bg-gradient-to-r from-red-500 to-orange-400 h-full flex items-center justify-center transition-all duration-300"
											style={{ width: `${awayProb}%` }}
										>
											{awayProb}%
										</div>
									</div>
									<div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground/60 px-1 mt-0.5">
										<span>{homeTeam || "HOME"}</span>
										<span>DRAW</span>
										<span>{awayTeam || "AWAY"}</span>
									</div>
								</div>

								{/* Match Stats Bars */}
								<div className="flex flex-col gap-5.5">
									{matchStats.map((stat, idx) => {
										const total = stat.home + stat.away;
										const homePercent =
											total > 0 ? (stat.home / total) * 100 : 50;
										const awayPercent =
											total > 0 ? (stat.away / total) * 100 : 50;

										return (
											<div key={idx} className="flex flex-col gap-2">
												<div className="flex justify-between items-center text-xs font-bold font-mono tracking-wider text-muted-foreground/75 uppercase px-1">
													<span className="w-16 text-left">
														{stat.homeStr || stat.home}
													</span>
													<span className="text-muted-foreground/50">
														{stat.name}
													</span>
													<span className="w-16 text-right">
														{stat.awayStr || stat.away}
													</span>
												</div>
												<div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
													<div
														className="bg-gradient-to-r from-blue-500 to-teal-400 h-full transition-all duration-300"
														style={{ width: `${homePercent}%` }}
													/>
													<div
														className="bg-gradient-to-l from-red-500 to-orange-400 h-full transition-all duration-300"
														style={{ width: `${awayPercent}%` }}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* TAB 4: Points Table */}
						{detailTab === "points" && (
							<div className="py-1">
								{m.grp.startsWith("Group") && groupStandings ? (
									<div className="rounded-xl border border-white/5 overflow-hidden bg-white/2 animate-in fade-in-20 duration-200">
										<div className="px-4 py-3 bg-white/3 border-b border-white/5 font-bold font-mono text-xs tracking-wider text-[#2DE89A] flex items-center justify-between">
											<span>{m.grp.toUpperCase()} STANDINGS</span>
											<Trophy className="size-3.5 text-gold" />
										</div>
										<div className="overflow-x-auto">
											<table className="w-full text-left border-collapse text-xs">
												<thead>
													<tr className="border-b border-white/5 text-[9px] font-bold font-mono text-muted-foreground/60 uppercase tracking-wider">
														<th className="py-2.5 px-3">Team</th>
														<th className="py-2.5 px-1.5 text-center w-8">P</th>
														<th className="py-2.5 px-1.5 text-center w-8">
															GD
														</th>
														<th className="py-2.5 px-3 text-center w-12 text-[#2DE89A]">
															PTS
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-white/2">
													{groupStandings.standings.map((standing, index) => {
														const isTop2 = index < 2;
														const isCurrent =
															standing.name === homeTeam ||
															standing.name === awayTeam;
														return (
															<tr
																key={standing.name}
																className={`transition-colors text-xs ${
																	isCurrent
																		? "bg-white/5 font-semibold text-white"
																		: "text-foreground/85"
																}`}
															>
																<td className="py-2.5 px-3 flex items-center gap-1.5 min-w-0">
																	<span
																		className={`font-mono text-[9px] w-3 text-center flex-shrink-0 ${
																			isTop2
																				? "text-[#2DE89A] font-bold"
																				: "text-muted-foreground/45"
																		}`}
																	>
																		{index + 1}
																	</span>
																	<span className="text-base select-none flex-shrink-0 saturate-110">
																		{FLAGS[standing.name] || "⚽"}
																	</span>
																	<span className="truncate">
																		{standing.name}
																	</span>
																</td>
																<td className="py-2.5 px-1.5 text-center font-mono text-muted-foreground/80">
																	{standing.p}
																</td>
																<td
																	className={`py-2.5 px-1.5 text-center font-mono ${
																		standing.gd > 0
																			? "text-[#2DE89A]/80"
																			: standing.gd < 0
																				? "text-red-400/80"
																				: "text-muted-foreground/50"
																	}`}
																>
																	{standing.gd > 0
																		? `+${standing.gd}`
																		: standing.gd}
																</td>
																<td className="py-2.5 px-3 text-center font-mono font-bold text-[#2DE89A]">
																	{standing.pts}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									</div>
								) : (
									<div className="py-10 text-center text-muted-foreground flex flex-col items-center justify-center gap-3 bg-white/2 border border-white/5 rounded-xl">
										<Trophy className="size-8 text-gold/60 animate-bounce" />
										<div className="flex flex-col gap-1">
											<span className="font-bold text-sm text-foreground/90 uppercase tracking-wider">
												Knockout Stage Match
											</span>
											<span className="text-xs max-w-[280px] leading-relaxed">
												Standings points tables only apply to the Group Stage.
												This is a single-elimination {m.grp} fixture.
											</span>
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Narrative / Context */}
					<div className="mt-6 p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-1 min-w-0">
						<span className="text-[10px] font-bold text-muted-foreground/75 tracking-wider uppercase flex items-center gap-1">
							<Trophy className="size-3.5 text-gold" />
							Match Venue &amp; Info
						</span>
						<p className="text-[11px] text-muted-foreground/85 leading-relaxed">
							This fixture is played at{" "}
							<strong className="text-white font-medium">{m.v}</strong> on{" "}
							{dayDetail.dow}, {dayDetail.dt}. Refereed by {referee} with an
							expected turnout of {attendance} spectators.
						</p>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
