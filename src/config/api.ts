export const API_CONFIG = {
  ESPN_SCOREBOARD_URL: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
  getEspnRosterUrl: (teamId: string) => `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${teamId}/roster`,
};
