export interface EspnTeam {
  displayName: string;
}

export interface EspnCompetitor {
  homeAway: "home" | "away";
  team?: EspnTeam;
  score?: string;
}

export interface EspnStatusType {
  state: "pre" | "in" | "post";
  detail?: string;
  shortDetail?: string;
}

export interface EspnStatus {
  type?: EspnStatusType;
}

export interface EspnCompetition {
  competitors?: EspnCompetitor[];
}

export interface EspnEvent {
  date: string;
  status?: EspnStatus;
  competitions?: EspnCompetition[];
}

export interface EspnEventResponse {
  events?: EspnEvent[];
}

export interface ProcessedEvent {
  when: number;
  state?: "pre" | "in" | "post";
  detail: string;
  hName: string;
  hScore?: string;
  aName: string;
  aScore?: string;
}

export interface RosterPlayer {
  name: string;
  number: number;
  pos: "GK" | "DF" | "MF" | "FW";
  age: number;
  height: string;
  weight: string;
  headshot?: string;
}

export interface EspnAthlete {
  fullName: string;
  jersey: string;
  position?: {
    abbreviation: "G" | "D" | "M" | "F";
    displayName: string;
  };
  age?: number;
  displayHeight?: string;
  displayWeight?: string;
  headshot?: { href: string; alt: string };
}

export interface EspnRosterResponse {
  athletes?: EspnAthlete[];
}
