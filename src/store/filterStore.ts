import { temporal } from "zundo";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface FilterState {
	q: string;
	stage: string;
	team: string;
	tv: string;
	tz: string;
	today: boolean;
	up: boolean;
	party: boolean;
	filterBodyOpen: boolean;
	askAIOpen: boolean;
}

export interface FilterActions {
	setQ: (q: string) => void;
	setStage: (stage: string) => void;
	setTeam: (team: string) => void;
	setTv: (tv: string) => void;
	setTz: (tz: string) => void;
	setToday: (today: boolean) => void;
	setUp: (up: boolean) => void;
	setParty: (party: boolean) => void;
	setFilterBodyOpen: (open: boolean) => void;
	setAskAIOpen: (open: boolean) => void;
	resetFilters: () => void;
}

export type FilterStore = FilterState & FilterActions;

export const useFilterStore = create<FilterStore>()(
	subscribeWithSelector(
		temporal(
			(set) => ({
				q: "",
				stage: "",
				team: "",
				tv: "",
				tz: "Auto",
				today: false,
				up: false,
				party: false,
				filterBodyOpen: false,
				askAIOpen: false,
				setQ: (q) => set({ q }),
				setStage: (stage) => set({ stage }),
				setTeam: (team) => set({ team }),
				setTv: (tv) => set({ tv }),
				setTz: (tz) => set({ tz }),
				setToday: (today) => set({ today }),
				setUp: (up) => set({ up }),
				setParty: (party) => set({ party }),
				setFilterBodyOpen: (filterBodyOpen) => set({ filterBodyOpen }),
				setAskAIOpen: (askAIOpen) => set({ askAIOpen }),
				resetFilters: () =>
					set({
						q: "",
						stage: "",
						team: "",
						tv: "",
						today: false,
						up: false,
						party: false,
					}),
			}),
			{
				partialize: (state) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { filterBodyOpen, askAIOpen, ...rest } = state;
					return rest;
				},
			},
		),
	),
);

export default useFilterStore;
