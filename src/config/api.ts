export const API_CONFIG = {
  ESPN_SCOREBOARD_URL: "/espn-api/scoreboard",
  getEspnRosterUrl: (teamId: string) => `/espn-api/teams/${teamId}/roster`,
};
