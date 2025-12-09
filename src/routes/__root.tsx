import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="page-shell space-y-6">
      <header className="nav-bar glass-panel glass-content">
        <Link to="/" className="nav-brand">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,26,26,0.16)] border border-[rgba(255,26,26,0.35)] shadow-[0_8px_24px_rgba(255,26,26,0.28)]">
            <Sparkles size={18} color="var(--primary)" />
          </div>
          <div>
            <div>AgentScope</div>
            <small className="text-[12px] text-[var(--text-secondary)]">
              Risk & Reputation explorer
            </small>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="nav-chip">Track: Tooling & Infrastructure</span>
          <a
            className="btn ghost-btn text-sm"
            href="https://erc-8004.org"
            target="_blank"
            rel="noreferrer"
          >
            ERC-8004 / x402
          </a>
        </div>
      </header>

      <Outlet />

      <footer className="text-center text-sm text-[var(--text-secondary)]">
        AgentScope • Agent risk & reputation explorer. Built for safer agent
        spend approvals.
      </footer>
      <TanStackRouterDevtools
        position="bottom-right"
        buttonPosition="bottom-left"
      />
    </div>
  ),
});

