import httpApiClient from "@/api/httpApiClient";
import { API_CONFIG } from "@/config/api";
import type { EspnEventResponse, EspnRosterResponse } from "@/types";

export const espnService = {
	fetchScores: async (dates?: string): Promise<EspnEventResponse> => {
		const url = dates
			? `${API_CONFIG.ESPN_SCOREBOARD_URL}?dates=${dates}`
			: API_CONFIG.ESPN_SCOREBOARD_URL;

		const response = await httpApiClient.get<EspnEventResponse>(url);
		return response.data;
	},

	fetchRoster: async (teamId: string): Promise<EspnRosterResponse> => {
		const url = API_CONFIG.getEspnRosterUrl(teamId);
		const response = await httpApiClient.get<EspnRosterResponse>(url);
		return response.data;
	},
};
