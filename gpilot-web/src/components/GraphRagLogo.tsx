type GraphRagLogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function GraphRagLogo({ className = '', showWordmark = true }: GraphRagLogoProps) {
  return (
    <div className={`graph-rag-logo ${className}`} aria-label="gpilot GraphRAG chat logo">
      <svg
        className="graph-rag-logo-mark"
        viewBox="0 0 64 48"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="graph-rag-logo-bubble"
          d="M10 8h44a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H31l-11 7v-7H10a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
        />
        <path className="graph-rag-logo-edge" d="M19 28 29 18l13 6 6-8" />
        <path className="graph-rag-logo-edge" d="M29 18 32 31l10-7" />
        <circle className="graph-rag-logo-node" cx="19" cy="28" r="3.5" />
        <circle className="graph-rag-logo-node" cx="29" cy="18" r="3.5" />
        <circle className="graph-rag-logo-node" cx="42" cy="24" r="3.5" />
        <circle className="graph-rag-logo-node" cx="48" cy="16" r="3.5" />
        <circle className="graph-rag-logo-node graph-rag-logo-node--muted" cx="32" cy="31" r="2.7" />
      </svg>
      {showWordmark && <span className="graph-rag-logo-wordmark">gpilot</span>}
    </div>
  );
}
