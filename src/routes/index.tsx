import { useMemo, useState } from "react";
import {
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Search, Filter, ShieldCheck, Activity, Sparkle } from "lucide-react";
import {
  fetchAgents,
  fetchAgentCount,
  fetchGlobalStats,
  AgentFilters,
} from "@/lib/subgraph";
import { PageSizeSelect } from "@/components/PageSizeSelect";

const PAGE_SIZES = [12, 24, 48, 99];
const DEFAULT_PAGE_SIZE = 24;

type SearchState = {
  search?: string;
  page?: number;
  perPage?: number;
  hasReviews?: boolean;
  hasEndpoint?: boolean;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchState => ({
    search: typeof search.search === "string" ? search.search : "",
    page: Number(search.page) || 1,
    perPage: Number(search.perPage) || DEFAULT_PAGE_SIZE,
    hasReviews:
      search.hasReviews === true || search.hasReviews === "true"
        ? true
        : false,
    hasEndpoint:
      search.hasEndpoint === true || search.hasEndpoint === "true"
        ? true
        : false,
  }),
  loader: async ({ search: rawSearch }) => {
    const search = rawSearch ?? {};

    const page = Math.max(1, Number(search.page) || 1);
    const requestedPageSize = Number(search.perPage) || DEFAULT_PAGE_SIZE;
    const pageSize = PAGE_SIZES.includes(requestedPageSize)
      ? requestedPageSize
      : DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const filters: AgentFilters = {
      search: search.search || undefined,
      hasReviews: search.hasReviews || undefined,
      hasEndpoint: search.hasEndpoint || undefined,
    };

    const hasActiveFilters = Boolean(
      filters.search || filters.hasEndpoint || filters.hasReviews,
    );

    const [agents, stats, filteredCount] = await Promise.all([
      fetchAgents(pageSize, skip, filters),
      fetchGlobalStats(),
      hasActiveFilters ? fetchAgentCount(filters) : Promise.resolve(null),
    ]);

    const totalAgents = filteredCount ?? parseInt(stats.totalAgents);
    const totalPages = Math.max(1, Math.ceil(totalAgents / pageSize));

    return {
      agents,
      stats,
      totalAgents,
      totalPages,
      page,
      pageSize,
      filters,
      hasActiveFilters,
      searchTerm: search.search || "",
    };
  },
  component: HomeRoute,
});

function HomeRoute() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const {
    agents,
    stats,
    totalAgents,
    totalPages,
    page,
    pageSize,
    hasActiveFilters,
    searchTerm,
  } = Route.useLoaderData();

  const [query, setQuery] = useState(searchTerm);

  const totalFeedback = useMemo(
    () => (stats?.totalFeedback ? parseInt(stats.totalFeedback) : 0),
    [stats],
  );

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({
      to: "/",
      search: {
        ...search,
        search: query.trim(),
        page: 1,
      },
    });
  };

  const toggleFilter = (key: "hasReviews" | "hasEndpoint") => {
    navigate({
      to: "/",
      search: {
        ...search,
        [key]: !search[key],
        page: 1,
      },
    });
  };

  const clearFilters = () => {
    navigate({
      to: "/",
      search: {
        search: "",
        page: 1,
        perPage: pageSize,
        hasEndpoint: false,
        hasReviews: false,
      },
    });
  };

  const goToPage = (nextPage: number) => {
    navigate({
      to: "/",
      search: {
        ...search,
        page: Math.min(Math.max(1, nextPage), totalPages),
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel glass-content p-6">
        <div className="hero">
          <div>
            <div className="badge mb-3">
              <Sparkle size={14} />
              Agent Risk & Reputation Explorer
            </div>
            <h1 className="hero-title">
              Trust signals for ERC-8004 & x402 agent payments
            </h1>
            <p className="hero-subtitle">
              Visualize payment intents per agent, track disputes and refunds,
              and aggregate trust scores before approving spend. Built for
              Kite/Youmio/TURF and third-party UIs to quickly ask for an
              agent&apos;s risk profile.
            </p>
          </div>
          <div className="glass-panel glass-content p-5 shimmer-border">
            <div className="stats-grid">
              <StatCard
                label="Registered agents"
                value={totalAgents}
                helper="On-chain ERC-8004 records"
              />
              <StatCard
                label="Feedback entries"
                value={totalFeedback}
                helper="Reviews, disputes, refunds"
              />
              <StatCard
                label="Realtime posture"
                value="x402"
                helper="Payment intents & risk tiers"
              />
              <StatCard
                label="API ready"
                value="Agentscope SDK"
                helper="Query risk before approving spend"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel glass-content p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Filter size={16} />
              Filters & search
              {hasActiveFilters && (
                <span className="badge">Active</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PageSizeSelect
                currentSize={pageSize}
                sizes={PAGE_SIZES}
                onChange={(size) =>
                  navigate({
                    to: "/",
                    search: { ...search, perPage: size, page: 1 },
                  })
                }
              />
              {hasActiveFilters && (
                <button className="ghost-btn" onClick={clearFilters}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]"
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents, names, endpoints..."
              />
            </label>
            <button type="submit">Search</button>
            <button
              type="button"
              className={`btn ${search.hasReviews ? "" : "ghost-btn"}`}
              onClick={() => toggleFilter("hasReviews")}
            >
              Reviews only
            </button>
            <button
              type="button"
              className={`btn ${search.hasEndpoint ? "" : "ghost-btn"}`}
              onClick={() => toggleFilter("hasEndpoint")}
            >
              API ready
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Filter size={16} />
            {hasActiveFilters ? (
              <span>
                {totalAgents.toLocaleString()} matching agents for
                {searchTerm ? ` “${searchTerm}”` : ""}{" "}
                {search.hasReviews ? "with reviews" : ""}{" "}
                {search.hasEndpoint ? "with endpoints" : ""}
              </span>
            ) : (
              <span>
                {totalAgents.toLocaleString()} registered agents on Sepolia
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {agents.length === 0 ? (
          <div className="glass-panel glass-content p-10 text-center text-[var(--text-secondary)]">
            No agents found. Adjust filters or reset search.
          </div>
        ) : (
          <>
            <div className="agent-grid">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

            <div className="glass-panel glass-content p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-[var(--text-secondary)]">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <button
                    className="ghost-btn"
                    onClick={() => goToPage(page - 1)}
                  >
                    Previous
                  </button>
                )}
                {page < totalPages && (
                  <button onClick={() => goToPage(page + 1)}>Next</button>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <div className="glass-panel glass-content p-4">
      <div className="stat-number">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="stat-label">{label}</div>
      <div className="mt-1 text-xs text-[var(--text-secondary)]">{helper}</div>
    </div>
  );
}

function AgentCard({
  agent,
}: {
  agent: Awaited<ReturnType<typeof fetchAgents>>[number];
}) {
  const name =
    agent.registrationFile?.name || `Agent #${agent.agentId}`;
  const description = agent.registrationFile?.description;
  const trusts = agent.registrationFile?.supportedTrusts || [];
  const feedbackCount = parseInt(agent.totalFeedback);
  const hasEndpoint =
    agent.registrationFile?.mcpEndpoint ||
    agent.registrationFile?.a2aEndpoint;

  return (
    <Link
      to="/agent/$id"
      params={{ id: agent.id }}
      className="glass-panel glass-content agent-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{name}</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            ID: {agent.agentId}
          </p>
        </div>
        <div className="flex gap-1.5">
          {hasEndpoint && (
            <span className="badge text-xs">API</span>
          )}
          {feedbackCount > 0 && (
            <span className="badge text-xs">
              {feedbackCount} feedback
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
          {description}
        </p>
      )}

      {trusts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {trusts.slice(0, 3).map((trust) => (
            <span key={trust} className="tag">
              {trust}
            </span>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="card-meta">
        <span className="flex items-center gap-1">
          <ShieldCheck size={14} color="var(--primary)" />
          {formatAddress(agent.owner)}
        </span>
        <span className="flex items-center gap-1">
          <Activity size={14} color="var(--primary)" />
          {formatTimestamp(agent.createdAt)}
        </span>
      </div>
    </Link>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

