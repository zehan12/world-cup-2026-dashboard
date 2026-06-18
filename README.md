# World Cup 2026 — Schedule & Live Scores Dashboard

A modern, high-performance React web application that lists all 104 matches of the **FIFA World Cup 2026** (June 11 – July 19, 2026) across the USA, Canada, and Mexico. Designed with a premium, carbon-black dark theme, the dashboard provides kickoff times (timezone-selectable), TV channel listings, live score updates, interactive filtering, and `.ics` calendar export.

![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20TS-61dafb)
![Styling](https://img.shields.io/badge/styling-Tailwind%20v4%20%7C%20Shadcn-38bdf8)
![State Management](https://img.shields.io/badge/state-Zustand-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Highlights

- **Interactive Match Board**: Grouped by day with sticky date headers and automated auto-scroll to the current day.
- **TV & Streaming Listings**: English (FOX/FS1) and Spanish (Telemundo/Universo) broadcast assignments shown on every match row.
- **Live-Data Hydration**: Fetches real-time scores, match status (Live/FT/Upcoming), and live clocks from a public scoreboard feed, degrading gracefully to static schedule data when offline.
- **Dynamic Knockout Bracket**: Seeding placeholders (e.g., `1C vs 2F`) automatically resolve to team names once fixtures are determined.
- **Advanced Filtering**: Filter by team, round stage, broadcaster, stadium hosts (🇺🇸 USA, 🇲🇽 Mexico, 🇨🇦 Canada), and key contenders.
- **Timezone Selector**: Instantly converts kickoff times to Eastern (default), your system's local timezone, or preset regional zones.
- **Smart `.ics` Calendar Export**: Download matching, filtered fixtures in either **Per-Match** or **Watch Party** (grouped daily blocks) formats.
- **Social Sharing**: Copy custom, pre-filled viral status cards with active filters to X (Twitter), WhatsApp, and LinkedIn.

---

## 🛠️ Technology Stack

- **Core**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Styling & UI Components**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# Clone the repository
cd world-cup-2026-dashboard

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open `http://localhost:5173` in your browser to view the dashboard.

### Commands

*   `npm run dev` — Run development server with Hot Module Replacement (HMR).
*   `npm run build` — Compile TypeScript and build production bundle into `dist/`.
*   `npm run preview` — Locally preview the compiled production build.

---

## 📂 Project Structure

```filepath
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Radix-ui/Shadcn foundation primitives
│   │   └── dashboard/    # Main panels: Header, MatchCard, FilterBar, Footer
│   ├── store/            # Zustand global filter state
│   ├── hooks/            # Live data polling and calendar export logic
│   ├── data/             # Static match schedule matrix and flag lookup mappings
│   ├── lib/              # Helper utilities (cn, formatter class)
│   ├── App.tsx           # Main application shell
│   └── index.css         # Styling system configuration
├── public/               # Static assets (hero image, favicon)
├── package.json          # Dependency definition
└── vite.config.ts        # Vite build tool and import alias configuration
```

---

## 📅 Calendar Export Modes

Click **⤓ Add to calendar** to download an `.ics` file. The export respects active filters and excludes completed games:

1.  **Per-Match Mode**: One distinct calendar event for every match showing kickoff, venue location, and channel info.
2.  **Watch Party Mode**: Groups all matches of a single day into a single calendar event block detailing all fixtures, perfect for viewing parties.

---

## 📊 Live Scoring & Data Provenance

1.  **Broadcaster Schedule (Source of Truth)**: Initial match dates, kickoff times, venues, and English channels (FOX/FS1) are based on the broadcaster's official World Cup schedule.
2.  **Live Polling Feed**: The client polls the unofficial ESPN scoreboard feed dynamically, mapping live status, goals, and team details based on matching UTC start times and country matches.
3.  **CORS & Offline Resiliency**: All network requests are wrapped in safe error handlers. If the scoring feed is blocked or unreachable, the dashboard defaults gracefully to the local static schedule.

---

## 📄 License

[MIT](./LICENSE) © Zehan Khan.
