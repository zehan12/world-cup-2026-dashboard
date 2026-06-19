---
name: dashboard-expert
description: Teaches AI agents how to safely modify and maintain the World Cup 2026 Dashboard without breaking the static schedule or live ESPN hydration.
---

# World Cup 2026 Dashboard Expert Skill

## Context
This is a zero-dependency, static React dashboard listing all 104 matches of the 2026 FIFA World Cup.

## Core Directives for Agents
1. **Do not introduce build steps or backends.** The application compiles to static HTML/JS via Vite.
2. **Understand the Hydration Cycle**:
   - `src/data/matches.ts` loads first with static FOX/TV assignments.
   - `src/hooks/useEspnScores.ts` fires on mount to fetch live ESPN data.
   - The ESPN data patches the `_scoreH`, `_scoreA`, and `_st` (status) fields onto the static matches.
   - **Never** modify the static matching logic unless specifically asked, as team names differ slightly between FIFA and ESPN.

## Making UI Changes
- Components are in `src/components/dashboard/`.
- Utility functions are in `src/helpers/`.
- Keep the aesthetic modern, dark-themed (`#0f0f0f`), and responsive. Use Tailwind utilities.
