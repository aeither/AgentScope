# AgentScope — Agent Risk & Reputation Explorer

## Short Description
A Vite + React explorer that surfaces ERC-8004 agents, their trust metadata, and community feedback. Search, filter, and drill into on-chain registration files to see endpoints, supported trust models, and reviews before approving agent-driven spend.

## Full Description
AgentScope is a lightweight frontend for inspecting ERC-8004 agent identities on Ethereum Sepolia. It pulls registration files and feedback from the Agent0 subgraph to help integrators understand how an agent presents itself (name, description, supported trust models, MCP/A2A endpoints) and how the community rates it (scores, tags, disputes). The goal is to give downstream UIs (Kite, Youmio, TURF, or other wallets/ops tools) a quick way to gauge risk posture before green-lighting payment intents. Future work includes deeper x402 intent visualizations, aggregated trust scoring, and a thin API surface for third parties to query risk summaries.

## Features
- 🔍 Search & filter agents by name, feedback, and API readiness
- 📊 Global stats: registered agents and feedback counts from the subgraph
- 🗂️ Paginated agent grid with configurable page sizes
- 🧩 Agent detail pages with trust models, MCP/A2A endpoints, and metadata
- ⭐ Feedback feed with scores, tags, and reviewer addresses

## Data Source
- Agent and feedback data: Agent0 subgraph on Ethereum Sepolia  
  🔗 https://thegraph.com/explorer/subgraphs/6wQRC7geo9XYAhckfmfo8kbMRLeWU8KQd3XsJqFKmZLT

## Tech Stack
- Vite + React 19 + TypeScript
- @tanstack/react-router for routing and data loading
- Tailwind-style utility classes (see `globals.css`)
- The Graph for on-chain data (GraphQL queries in `src/lib/subgraph.ts`)
- Lucide icons

## Quick Start
```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

Open http://localhost:5173

## Project Structure
```
src/
├── main.tsx              # Router bootstrap
├── routes/
│   ├── __root.tsx        # Layout and nav
│   ├── index.tsx         # Agent list, filters, stats
│   └── agent/$id.tsx     # Agent detail + feedback
├── components/
│   └── PageSizeSelect.tsx
├── lib/
│   └── subgraph.ts       # GraphQL client for Agent0 subgraph
└── globals.css           # Theme and layout styles
```

## Notes & Roadmap
- Focused on ERC-8004 identities on Sepolia; intent/risk aggregation is UI-facing today and will expand with x402 payment intent data.
- Planned: simplified API surface for third-party UIs to fetch agent risk snapshots, richer trust-score aggregation, and dispute/refund visualizations.

## License
MIT
