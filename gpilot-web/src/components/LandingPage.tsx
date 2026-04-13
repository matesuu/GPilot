import { Bot, GitFork, Zap, Database, Brain, ArrowRight, ChevronRight } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="landing">

      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <Bot className="landing-logo-icon" />
          <span>GPilot</span>
        </div>
        <div className="landing-nav-right">
          <a
            className="landing-nav-link"
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitFork size={16} />
            PolyG
          </a>
          <button className="landing-nav-cta" onClick={onLaunch}>
            Launch App
            <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-badge">
          <GitFork size={13} />
          Powered by&nbsp;
          <a
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            PolyG
          </a>
          &nbsp;· open-source RAG engine
        </div>

        <h1 className="landing-hero-title">
          LLMs that actually&nbsp;
          <span className="landing-accent">remember</span>
          <br />
          everything.
        </h1>

        <p className="landing-hero-sub">
          GPilot uses Retrieval-Augmented Generation to overcome LLM long-context
          limits — surfacing only the most relevant graph-structured knowledge
          before every query so the model always has the right context, not just
          the most recent tokens.
        </p>

        <div className="landing-hero-actions">
          <button className="landing-btn-primary" onClick={onLaunch}>
            Get started
            <ChevronRight size={16} />
          </button>
          <a
            className="landing-btn-secondary"
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitFork size={16} />
            View PolyG on GitHub
          </a>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section">
        <h2 className="landing-section-title">How it works</h2>
        <p className="landing-section-sub">
          Three stages that run silently before every response.
        </p>

        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-num">01</div>
            <Database size={28} className="landing-step-icon" />
            <h3>Index your datasets</h3>
            <p>
              Your documents, code, and data are chunked and stored in a
              graph-aware vector index built on the PolyG retrieval engine.
            </p>
          </div>
          <div className="landing-step-arrow"><ChevronRight size={20} /></div>

          <div className="landing-step">
            <div className="landing-step-num">02</div>
            <Zap size={28} className="landing-step-icon" />
            <h3>RAG retrieval</h3>
            <p>
              At query time, PolyG traverses the graph to retrieve semantically
              and structurally relevant chunks — not just the nearest neighbours.
            </p>
          </div>
          <div className="landing-step-arrow"><ChevronRight size={20} /></div>

          <div className="landing-step">
            <div className="landing-step-num">03</div>
            <Brain size={28} className="landing-step-icon" />
            <h3>Optimised LLM context</h3>
            <p>
              Only the retrieved passages are injected into the model's context
              window, keeping prompts concise and accuracy high — regardless of
              corpus size.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="landing-section landing-section--alt">
        <h2 className="landing-section-title">Why GPilot</h2>
        <div className="landing-features">

          <div className="landing-feature-card">
            <Zap size={22} className="landing-feature-icon" />
            <h4>Beats long-context limits</h4>
            <p>
              Even million-token windows dilute attention. RAG ensures the model
              focuses on the exact paragraphs it needs.
            </p>
          </div>

          <div className="landing-feature-card">
            <Database size={22} className="landing-feature-icon" />
            <h4>Graph-native retrieval</h4>
            <p>
              PolyG models data as a property graph, so multi-hop relationships
              between entities are retrieved in a single pass.
            </p>
          </div>

          <div className="landing-feature-card">
            <Brain size={22} className="landing-feature-icon" />
            <h4>Dataset-aware chat</h4>
            <p>
              Switch datasets mid-session — General, Code, Docs, Data Analysis,
              Science — each with its own retrieval scope.
            </p>
          </div>

          <div className="landing-feature-card">
            <GitFork size={22} className="landing-feature-icon" />
            <h4>Open-source core</h4>
            <p>
              The retrieval engine is fully open on GitHub. Audit it, extend it,
              or self-host the entire stack.
            </p>
          </div>

        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="landing-cta-banner">
        <h2>Ready to query smarter?</h2>
        <p>
          Open the app and start a conversation against any of your datasets —
          PolyG handles the rest.
        </p>
        <button className="landing-btn-primary" onClick={onLaunch}>
          Launch GPilot
          <ChevronRight size={16} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">
          <Bot size={16} className="landing-logo-icon" />
          GPilot
        </div>
        <span className="landing-footer-sep" />
        <a
          href="https://github.com/Liu-rj/PolyG/tree/main"
          target="_blank"
          rel="noopener noreferrer"
          className="landing-footer-link"
        >
          <GitFork size={14} />
          PolyG — github.com/Liu-rj/PolyG
        </a>
      </footer>

    </div>
  );
}
