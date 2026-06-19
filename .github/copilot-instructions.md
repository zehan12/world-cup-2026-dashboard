# GitHub Copilot Instructions for World Cup 2026 Dashboard

When generating code or answering questions in this repository, follow these rules:

1. **Architecture**: We use React + TypeScript + Vite. State is handled by Zustand. Styling is Tailwind CSS.
2. **Data Layer**: 
   - Static schedule is in `src/data/matches.ts`.
   - Real-time hydration comes from `src/services/espnService.ts` using Axios.
3. **Typing**: Ensure all new data models are added to `src/types/index.ts`. No implicit `any` allowed.
4. **Routing**: This is a single-page dashboard. Do not implement `react-router-dom` or multi-page routing. All content renders on the main feed with modals for details.
