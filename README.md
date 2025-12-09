# AgentScope — Agent Risk & Reputation Explorer

## Short Description
AgentScope makes on-chain AI agents feel trustworthy. It shows who an ERC-8004 agent is, how it behaves, and how the community feels about it—so teams can approve spend with confidence.

## Full Description
AgentScope gives risk, ops, and product teams a fast read on AI agents before letting them move money. It pulls ERC-8004 registration files and feedback from The Graph (Sepolia) to answer: Who operates this agent? What endpoints does it expose? What trust models does it claim? How has the community scored it? The UI is tuned for quick approvals by wallets, ops tools, and marketplaces (Kite, Youmio, TURF, etc.). Next steps: x402 payment intent visibility, lightweight trust scores, and an API so any UI can “ask” for an agent’s risk snapshot.

## Features
- Trust-first browsing: search agents, filter by reviews and API readiness
- Fast signals: global stats plus per-agent trust models, endpoints, and feedback
- Risk-centric detail pages: reviews, tags, owner/timestamp context
- Pagination tuned for catalog-style browsing (12–99 per page)

## Technical Details
- Stack: Vite + React 19 + TypeScript, @tanstack/react-router, utility CSS in `globals.css`, Lucide icons.
- Data: Agent0 subgraph on Ethereum Sepolia (GraphQL client in `src/lib/subgraph.ts`).
- Architecture: router loaders handle search/pagination/stats; thin GraphQL fetch layer resolves registration files and feedback with a metadata fallback when the subgraph lacks decoded files.
- Integrations: The Graph gateway; MCP/A2A endpoint data is surfaced from agent metadata.
- Hacky/innovative bits: “API-ready” and “reviews-only” filters for fast trust triage; metadata resolution fallback; copy and layout tuned for spend-approval workflows.

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
