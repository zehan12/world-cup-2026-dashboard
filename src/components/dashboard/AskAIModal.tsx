import { Mic, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FLAGS } from "@/data/matches";
import { useFilterStore } from "@/store";

function levenshtein(a: string, b: string): number {
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;
	const matrix = Array.from({ length: a.length + 1 }, () =>
		new Array(b.length + 1).fill(0),
	);
	for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
	for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost,
			);
		}
	}
	return matrix[a.length][b.length];
}

export default function AskAIModal() {
	const open = useFilterStore((s) => s.askAIOpen);
	const setOpen = useFilterStore((s) => s.setAskAIOpen);
	const setTeam = useFilterStore((s) => s.setTeam);
	const setQ = useFilterStore((s) => s.setQ);
	const [query, setQuery] = useState("");

	const handleQuery = () => {
		if (!query.trim()) return;

		const lowerQuery = query.toLowerCase();
		const queryWords = lowerQuery
			.replace(/[^a-z0-9 ]/g, "")
			.split(/\s+/)
			.filter(Boolean);
		const teams = Object.keys(FLAGS);

		// Find all teams mentioned in the query using exact substring or fuzzy n-gram matching
		const matchedTeams = teams.filter((team) => {
			const teamLower = team.toLowerCase();
			if (lowerQuery.includes(teamLower)) return true; // Exact substring match

			const teamWords = teamLower.split(/\s+/);
			const n = teamWords.length;
			if (queryWords.length < n) return false;

			// Allow 0 typos for length <=3, else roughly 1 typo per 3 chars
			const maxDist =
				teamLower.length <= 3 ? 0 : Math.floor(teamLower.length / 3) + 1;

			let bestDist = Infinity;
			for (let i = 0; i <= queryWords.length - n; i++) {
				const ngram = queryWords.slice(i, i + n).join(" ");
				const dist = levenshtein(teamLower, ngram);
				if (dist < bestDist) bestDist = dist;
			}

			return bestDist <= maxDist;
		});

		if (matchedTeams.length === 1) {
			setTeam(matchedTeams[0]);
			setQ("");
		} else if (matchedTeams.length > 1) {
			setQ(matchedTeams.join(" vs "));
			setTeam("");
		} else {
			setQ(query.trim());
			setTeam("");
		}

		setOpen(false);
		setQuery("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				className="!fixed !top-0 !left-0 !translate-x-0 !translate-y-0 !w-screen !h-[100dvh] !max-w-none !m-0 !p-0 !border-none !rounded-none shadow-none overflow-hidden flex flex-col items-center justify-center data-[state=closed]:duration-200 data-[state=open]:duration-300"
				style={{
					backgroundImage:
						'url("https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2532&auto=format&fit=crop")',
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

				{/* Top Logo Badge */}
				<div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl rounded-full px-4 py-1.5 shadow-sm">
					<Sparkles className="size-4 text-[#00e5ff]" />
					<span className="text-sm font-medium text-white/90">
						Dashboard.ai
					</span>
				</div>

				{/* Background gradient effects */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-fox/5 blur-[150px] rounded-full pointer-events-none" />

				{/* The actual centered glass box */}
				<div className="relative z-10 w-[90vw] max-w-[700px] flex flex-col items-start text-left bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
					<div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-3">
						<Sparkles className="size-4 text-[#00e5ff]" />
						<span>Hello User!</span>
					</div>

					<h2 className="text-2xl md:text-[32px] font-semibold tracking-tight mb-8 text-white">
						What can I help you today?
					</h2>

					{/* ezBOOKING style Input Container */}
					<div className="w-full bg-white rounded-full p-2 mb-8 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.01] transition-transform duration-300">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleQuery()}
							placeholder="Ask anything about the tournament..."
							className="flex-1 h-12 pl-6 pr-4 bg-transparent border-none text-gray-800 text-[15px] md:text-lg placeholder:text-gray-500 font-medium focus:outline-none focus:ring-0"
						/>

						<div className="flex items-center gap-2 pr-1">
							<button className="flex items-center justify-center w-[46px] h-[46px] rounded-full border-[2px] border-[#c8102e] text-[#c8102e] hover:bg-rose-50 transition-colors active:scale-95">
								<Mic className="size-5" />
							</button>
							<button
								onClick={handleQuery}
								className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-[#c8102e] text-white shadow-md hover:bg-[#a00c24] transition-colors active:scale-95"
							>
								<Send className="size-5 ml-0.5" />
							</button>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-start gap-2 w-full">
						<QuickPill text="Analyze team" />
						<QuickPill text="Simulate match" />
						<QuickPill text="Tournament stats" />
						<QuickPill text="Best defense" />
					</div>
				</div>

				{/* Bottom footer text */}
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[11px] text-white/40 space-y-1.5">
					<div className="flex items-center justify-center gap-3">
						<span className="hover:text-white cursor-pointer transition-colors">
							Privacy Policy
						</span>
						<div className="w-1 h-1 rounded-full bg-white/20" />
						<span className="hover:text-white cursor-pointer transition-colors">
							Terms & Conditions
						</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function QuickPill({ text }: { text: string }) {
	return (
		<button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 active:scale-95">
			{text}
		</button>
	);
}
