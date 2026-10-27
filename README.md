# Territory Defense Fitness Game

## Project Overview
The Territory Defense Fitness Game is an engaging and interactive game designed to enhance physical fitness through strategic gameplay. Players engage in fitness challenges to defend their territory while competing against others.

This branch adds a **Solo-Leveling-style System UI** — a game-like overlay that turns the player's real Google Calendar workout plan into daily quests, stats, EXP, rewards and penalty states.

## Features
- Engaging gameplay that combines fitness with strategy
- Multiple player modes (single-player, multiplayer)
- Customizable characters and territories
- Fitness challenges based on real-world exercises
- **SystemScreen** — stat window, daily/weekly quests, EXP bar, rewards inventory,
  penalty-zone toggles and a live system log (all interactive)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/kishoresad25-glitch/map.git
   cd map
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Quick Start
Run the live web preview (Vite + React Native Web):
```bash
npm start
```
Then open the preview URL shown in your environment (default port `5173`).

To produce a production bundle:
```bash
npm run build
```

## Using SystemScreen in React Native
`src/screens/SystemScreen.tsx` is a pure React Native component. Import it into your
Expo / React Native CLI navigator:

```tsx
import SystemScreen from './src/screens/SystemScreen';
// register it as a screen named 'SystemScreen'
```

`HomeScreen.tsx` already includes an **Open System** button that navigates to
`SystemScreen`.

## Project Structure
```
map/
├── index.html                # web preview entry
├── vite.config.ts            # react-native -> react-native-web alias
├── src/
│   ├── App.tsx               # renders SystemScreen
│   ├── main.tsx              # browser entry
│   └── screens/
│       ├── HomeScreen.tsx
│       └── SystemScreen.tsx  # Solo-Leveling System UI
└── README.md
```

> Note: The System is a training aid, not medical advice. Stop any quest on sharp pain,
> numbness/tingling, chest pain or severe dizziness and consult a clinician/physio.

## Web preview notes
The browser preview uses `react-native-web`. Two small shims are required in this Vite setup:
- `index.html` sets `window.global = window` because React Native Web references `global`.
- `vite.config.ts` defines `global: 'globalThis'` and aliases `react-native` → `react-native-web`.
- `server.allowedHosts: true` lets the Arena/e2b preview host reach the dev server.

Screenshots of the rendered System UI are saved as `system-preview.png` (initial state)
and `system-preview-active.png` (quests cleared + penalty active).

## Standalone offline preview (no server / no E2B token)
If the live preview URL is blocked by an E2B traffic-access-token requirement, open
`system-standalone.html` directly in a browser (`file://`). It is a single self-contained
HTML file with the production JS bundle inlined and `window.global` shimmed — no dev server,
no network and no sandbox token needed. It was generated from `npm run build` output.
A rendered screenshot is saved as `system-standalone-preview.png`.
