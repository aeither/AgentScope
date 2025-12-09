import {
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchAgentWithFeedback, Feedback } from "@/lib/subgraph";

export const Route = createFileRoute("/agent/$id")({
  loader: async ({ params }) => {
    const decodedId = decodeURIComponent(params.id);
    const { agent, feedback } = await fetchAgentWithFeedback(decodedId);
    if (!agent) {
      return { notFound: true as const };
    }

    const avgScore =
      feedback.length > 0
        ? Math.round(
            feedback.reduce((acc, f) => acc + parseInt(f.score), 0) /
              feedback.length,
          )
        : null;

    return { agent, feedback, avgScore };
  },
  component: AgentRoute,
});

function AgentRoute() {
  const navigate = useNavigate();
  const data = Route.useLoaderData();

  if (data.notFound) {
    return (
      <div className="glass-panel glass-content p-8 text-center space-y-3">
        <p className="text-lg font-semibold">Agent not found</p>
        <p className="text-[var(--text-secondary)]">
          The requested agent does not exist or has been removed.
        </p>
        <button onClick={() => navigate({ to: "/" })}>Back to explorer</button>
      </div>
    );
  }

  const { agent, feedback, avgScore } = data;
  const name = agent.registrationFile?.name || `Agent #${agent.agentId}`;
  const description = agent.registrationFile?.description;
  const image = agent.registrationFile?.image;
  const trusts = agent.registrationFile?.supportedTrusts || [];
  const mcpEndpoint = agent.registrationFile?.mcpEndpoint;
  const a2aEndpoint = agent.registrationFile?.a2aEndpoint;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 ghost-btn"
        >
          <ArrowLeft size={16} />
          Back to all agents
        </Link>
      </div>

      <div className="glass-panel glass-content p-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden glass-panel">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-[var(--text-secondary)]">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="badge mb-2">
                <Sparkles size={14} /> Agent risk profile
              </div>
              <h1 className="text-2xl font-semibold">{name}</h1>
              <p className="text-sm text-[var(--text-secondary)] font-mono">
                {agent.id}
              </p>
            </div>
          </div>

          <div className="grid-2">
            <InfoCard
              label="Owner"
              value={formatAddress(agent.owner)}
              helper="Wallet controlling the agent NFT"
            />
            <InfoCard
              label="Created"
              value={formatTimestamp(agent.createdAt)}
              helper="On-chain registration time"
            />
          </div>

          <div className="grid-2">
            <InfoCard
              label="Trust models"
              value={
                trusts.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {trusts.map((trust) => (
                      <span key={trust} className="tag">
                        {trust}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )
              }
              helper="Supported policy / trust frameworks"
            />
            <InfoCard
              label="Avg score"
              value={
                avgScore !== null ? (
                  <ScoreBadge score={avgScore} count={feedback.length} />
                ) : (
                  "No reviews yet"
                )
              }
              helper="Aggregated from feedback"
            />
          </div>

          {description && (
            <div className="glass-panel glass-content p-4">
              <h3 className="text-sm text-[var(--text-secondary)] mb-1">
                Description
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="glass-panel glass-content p-4">
            <h3 className="text-sm text-[var(--text-secondary)] mb-2">
              Endpoints
            </h3>
            <div className="space-y-2">
              <EndpointRow label="MCP" url={mcpEndpoint} />
              <EndpointRow label="A2A" url={a2aEndpoint} />
            </div>
          </div>

          <div className="glass-panel glass-content p-4">
            <h3 className="text-sm text-[var(--text-secondary)] mb-2">
              Registration file
            </h3>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <div className="flex justify-between">
                <span>ID</span>
                <span className="font-mono">{agent.agentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Chain</span>
                <span className="font-mono">{agent.chainId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel glass-content p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">Feedback</h2>
            <p className="text-[var(--text-secondary)] text-sm">
              {feedback.length} reviews, disputes, and risk notes
            </p>
          </div>
          <div className="badge">
            <ShieldCheck size={14} /> {feedback.length > 0 ? "Community verified" : "Awaiting signals"}
          </div>
        </div>

        <div className="divider" />

        {feedback.length === 0 ? (
          <div className="text-[var(--text-secondary)]">
            No reviews yet. Be the first to attest this agent.
          </div>
        ) : (
          <div className="grid-2">
            {feedback.map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="glass-panel glass-content p-4 space-y-1">
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {helper && (
        <div className="text-xs text-[var(--text-secondary)]">{helper}</div>
      )}
    </div>
  );
}

function EndpointRow({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between text-[var(--text-secondary)]">
        <span>{label}</span>
        <span className="pill">Not provided</span>
      </div>
    );
  }

  return (
    <a
      className="flex items-center justify-between gap-2 text-sm hover:text-white"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <span className="badge">
        {label} endpoint
      </span>
      <span className="flex items-center gap-1 text-[var(--text-secondary)]">
        <span className="truncate max-w-[220px]">{url}</span>
        <ExternalLink size={14} />
      </span>
    </a>
  );
}

function ScoreBadge({ score, count }: { score: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--success)]"
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="text-sm font-semibold">{score}/100</div>
      <span className="pill">{count} reviews</span>
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const score = parseInt(feedback.score);
  const text = feedback.feedbackFile?.text;
  const capability = feedback.feedbackFile?.capability;
  const skill = feedback.feedbackFile?.skill;

  const tag1 = isReadableText(feedback.tag1) ? feedback.tag1 : null;
  const tag2 = isReadableText(feedback.tag2) ? feedback.tag2 : null;

  return (
    <div className="glass-panel glass-content p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Star size={16} color="var(--primary)" />
          <div className="text-sm font-semibold">{score}/100</div>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {formatTimestamp(feedback.createdAt)}
        </span>
      </div>
      {text && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {text}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {tag1 && <span className="tag">{tag1}</span>}
        {tag2 && <span className="tag">{tag2}</span>}
        {capability && <span className="tag">{capability}</span>}
        {skill && <span className="tag">{skill}</span>}
      </div>
      <div className="text-xs text-[var(--text-secondary)] font-mono">
        by {formatAddress(feedback.clientAddress)}
      </div>
    </div>
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

function isReadableText(str: string | null): boolean {
  if (!str) return false;
  const nonReadable = str
    .split("")
    .filter((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126).length;
  return nonReadable / str.length < 0.3;
}

