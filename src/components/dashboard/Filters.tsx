import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Redo,
	Search,
	SlidersHorizontal,
	Sparkles,
	Undo,
	X,
} from "lucide-react";
import { useStore } from "zustand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FLAGS } from "@/data/matches";
import { useFilterStore } from "@/store";
import AskAIModal from "./AskAIModal";

interface FiltersProps {
	teamList: string[];
	filteredUnplayedCount: number;
	daysCount: number;
	handleCalendarExport: () => void;
}

export default function Filters({
	teamList,
	filteredUnplayedCount,
	daysCount,
	handleCalendarExport,
}: FiltersProps) {
	// Zustand State Selectors
	const q = useFilterStore((s) => s.q);
	const stage = useFilterStore((s) => s.stage);
	const team = useFilterStore((s) => s.team);
	const tz = useFilterStore((s) => s.tz);
	const today = useFilterStore((s) => s.today);
	const up = useFilterStore((s) => s.up);
	const party = useFilterStore((s) => s.party);
	const filterBodyOpen = useFilterStore((s) => s.filterBodyOpen);

	// Zustand Action Selectors
	const setQ = useFilterStore((s) => s.setQ);
	const setStage = useFilterStore((s) => s.setStage);
	const setTeam = useFilterStore((s) => s.setTeam);
	const setTz = useFilterStore((s) => s.setTz);
	const setToday = useFilterStore((s) => s.setToday);
	const setUp = useFilterStore((s) => s.setUp);
	const setParty = useFilterStore((s) => s.setParty);
	const setFilterBodyOpen = useFilterStore((s) => s.setFilterBodyOpen);
	const setAskAIOpen = useFilterStore((s) => s.setAskAIOpen);
	const resetFilters = useFilterStore((s) => s.resetFilters);

	// Zundo Temporal State
	const { undo, redo, pastStates, futureStates } = useStore(
		useFilterStore.temporal,
	);

	const totalActiveFilters = [q, stage, team, today, up, party].filter(
		Boolean,
	).length;

	return (
		<section className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-white/5 py-4 px-6 mt-6">
			<div className="max-w-[1180px] mx-auto flex flex-col gap-4">
				<div className="flex gap-3 flex-wrap items-center">
					{/* Search Input */}
					<div className="relative flex-1 min-w-[200px] sm:min-w-[280px]">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
						<Input
							type="text"
							placeholder="Search team, venue, or city..."
							value={q}
							onChange={(e) => setQ(e.target.value)}
							className="w-full bg-[#121212]/80 border-white/5 pl-11 pr-10 py-2.5 rounded-xl text-white placeholder-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-fox/30 focus-visible:border-fox/50 transition-all duration-400 ease-out hover:border-white/20 hover:bg-white/5 shadow-sm focus:shadow-[0_0_20px_-4px_rgba(5,255,155,0.2)]"
						/>
						{q && (
							<button
								onClick={() => setQ("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors focus:outline-none"
								aria-label="Clear search"
							>
								<X className="size-4" />
							</button>
						)}
					</div>

					{/* Mobile Filters Toggle */}
					<Button
						variant="outline"
						onClick={() => setFilterBodyOpen(!filterBodyOpen)}
						className={`md:hidden flex items-center gap-2 border-white/5 text-foreground bg-[#121212]/80 rounded-xl px-4 py-2.5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-[1px] active:scale-95 transition-all duration-400 ease-out ${filterBodyOpen ? "border-fox/50 text-fox shadow-[0_0_16px_-4px_rgba(5,255,155,0.2)] ring-1 ring-fox/20" : ""}`}
					>
						<SlidersHorizontal className="size-4" />
						<span>Filters</span>
						{totalActiveFilters > 0 && (
							<Badge
								variant="destructive"
								className="ml-1 px-1.5 py-0.5 text-[10px] bg-gold text-primary-foreground hover:bg-gold"
							>
								{totalActiveFilters}
							</Badge>
						)}
						{filterBodyOpen ? (
							<ChevronUp className="size-3.5 ml-1" />
						) : (
							<ChevronDown className="size-3.5 ml-1" />
						)}
					</Button>

					{/* Desktop and Collapsible filters wrapper */}
					<div
						className={`w-full md:w-auto md:flex flex-wrap gap-3 items-center ${filterBodyOpen ? "flex" : "hidden"}`}
					>
						{/* Rounds Dropdown */}
						<Select
							value={stage || "_all"}
							onValueChange={(v) => setStage(v === "_all" ? "" : v)}
						>
							<SelectTrigger className="w-full md:w-[150px] bg-[#121212]/80 border-white/5 rounded-xl text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-[1px] transition-all duration-400 ease-out focus:ring-fox/30 focus:border-fox/50 shadow-sm data-[state=open]:border-fox/50 data-[state=open]:shadow-[0_0_16px_-4px_rgba(5,255,155,0.2)]">
								<SelectValue placeholder="All rounds" />
							</SelectTrigger>
							<SelectContent className="bg-popover border-white/10 text-white">
								<SelectItem value="_all">All rounds</SelectItem>
								<SelectItem value="group">Group stage</SelectItem>
								<SelectItem value="Round of 32">Round of 32</SelectItem>
								<SelectItem value="Round of 16">Round of 16</SelectItem>
								<SelectItem value="Quarterfinal">Quarterfinals</SelectItem>
								<SelectItem value="Semifinal">Semifinals</SelectItem>
								<SelectItem value="ko-late">3rd place &amp; Final</SelectItem>
							</SelectContent>
						</Select>

						{/* Teams Dropdown */}
						<Select
							value={team || "_all"}
							onValueChange={(v) => setTeam(v === "_all" ? "" : v)}
						>
							<SelectTrigger className="w-full md:w-[155px] bg-[#121212]/80 border-white/5 rounded-xl text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-[1px] transition-all duration-400 ease-out focus:ring-fox/30 focus:border-fox/50 shadow-sm data-[state=open]:border-fox/50 data-[state=open]:shadow-[0_0_16px_-4px_rgba(5,255,155,0.2)]">
								<SelectValue placeholder="All teams" />
							</SelectTrigger>
							<SelectContent className="bg-popover border-white/10 text-white max-h-[300px]">
								<SelectItem value="_all">All teams</SelectItem>
								{teamList.map((t) => (
									<SelectItem key={t} value={t}>
										<span className="mr-2">{FLAGS[t] || "⚽"}</span>
										{t}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Timezone Dropdown */}
						<Select value={tz} onValueChange={setTz}>
							<SelectTrigger className="w-full md:w-[185px] bg-[#121212]/80 border-white/5 rounded-xl text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-[1px] transition-all duration-400 ease-out focus:ring-fox/30 focus:border-fox/50 shadow-sm data-[state=open]:border-fox/50 data-[state=open]:shadow-[0_0_16px_-4px_rgba(5,255,155,0.2)]">
								<SelectValue placeholder="Times: Eastern (ET)" />
							</SelectTrigger>
							<SelectContent className="bg-popover border-white/10 text-white">
								<SelectItem value="Eastern">Times: Eastern (ET)</SelectItem>
								<SelectItem value="Auto">Times: My timezone</SelectItem>
								<SelectItem value="Pacific">Times: Pacific</SelectItem>
								<SelectItem value="Mountain">Times: Mountain</SelectItem>
								<SelectItem value="Central">Times: Central</SelectItem>
								<SelectItem value="UK">Times: UK</SelectItem>
								<SelectItem value="CET">Times: Central Europe</SelectItem>
							</SelectContent>
						</Select>

						{/* Switches */}
						<div className="flex flex-wrap gap-4 items-center bg-white/3 border border-white/5 py-1.5 px-4 rounded-xl text-xs md:text-sm">
							<label className="flex items-center gap-2.5 cursor-pointer select-none">
								<Switch
									checked={today}
									onCheckedChange={setToday}
									className="data-[state=checked]:bg-gold data-[state=unchecked]:bg-popover"
								/>
								<span className={today ? "text-gold" : "text-muted-foreground"}>
									Today
								</span>
							</label>

							<div className="w-[1px] h-4 bg-white/10 hidden sm:block"></div>

							<label className="flex items-center gap-2.5 cursor-pointer select-none">
								<Switch
									checked={up}
									onCheckedChange={setUp}
									className="data-[state=checked]:bg-gold data-[state=unchecked]:bg-popover"
								/>
								<span className={up ? "text-gold" : "text-muted-foreground"}>
									Upcoming
								</span>
							</label>

							<div className="w-[1px] h-4 bg-white/10 hidden sm:block"></div>

							<label className="flex items-center gap-2.5 cursor-pointer select-none">
								<Switch
									checked={party}
									onCheckedChange={setParty}
									className="data-[state=checked]:bg-gold data-[state=unchecked]:bg-popover"
								/>
								<span className={party ? "text-gold" : "text-muted-foreground"}>
									Watch party
								</span>
							</label>
						</div>

						{/* Undo/Redo Buttons */}
						<div className="flex items-center gap-1 bg-white/3 border border-white/5 p-1 rounded-xl w-full md:w-auto justify-center">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => undo()}
								disabled={pastStates.length === 0}
								className="size-8 text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:text-muted-foreground rounded-lg cursor-pointer"
								title="Undo"
							>
								<Undo className="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => redo()}
								disabled={futureStates.length === 0}
								className="size-8 text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:text-muted-foreground rounded-lg cursor-pointer"
								title="Redo"
							>
								<Redo className="size-4" />
							</Button>
						</div>

						{/* Reset button */}
						<Button
							variant="ghost"
							onClick={resetFilters}
							className="w-full md:w-auto text-muted-foreground hover:text-white border border-white/5 md:border-none hover:bg-white/5 py-2.5 rounded-xl cursor-pointer transition-colors duration-300"
						>
							Reset
						</Button>

						{/* Add to Calendar Button */}
						<Button
							onClick={handleCalendarExport}
							className="w-full md:w-auto bg-gold text-primary-foreground hover:bg-gold/90 hover:scale-[1.02] shadow-[0_4px_12px_rgba(255,215,0,0.15)] font-bold py-2.5 rounded-xl cursor-pointer transition-all duration-300"
						>
							<Calendar className="size-4 mr-2" />
							{party
								? `⤓ Add to Calendar (${daysCount} Day${daysCount !== 1 ? "s" : ""})`
								: `⤓ Add to Calendar (${filteredUnplayedCount})`}
						</Button>

						{/* Ask AI Button */}
						<Button
							onClick={() => setAskAIOpen(true)}
							className="w-full md:w-auto bg-fox text-black hover:bg-fox/90 hover:-translate-y-[1px] active:scale-95 shadow-[0_4px_12px_rgba(5,255,155,0.25)] font-bold py-2.5 rounded-xl cursor-pointer transition-all duration-300 border border-fox/20"
						>
							<Sparkles className="size-4 mr-2" />
							Ask AI
						</Button>
					</div>
				</div>
			</div>
			<AskAIModal />
		</section>
	);
}
