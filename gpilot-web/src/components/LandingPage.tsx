import { Bot } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="landing">

      {/* ── Nav ── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <Bot className="lp-nav-bot-icon" />
          <span>GPilot</span>
        </div>
        <div className="lp-nav-links">
          <a
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="#features">Features</a>
          <button className="lp-nav-cta" onClick={onLaunch}>&gt;_ Launch App</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-glow" />

        <Bot className="lp-hero-logo" />

        <h1 className="lp-hero-h1">GPilot</h1>

        <p className="lp-tagline">
          RAG-powered chat for long-context LLMs.
        </p>

        <p className="lp-sub-tagline">
          &gt; built on PolyG · graph-native retrieval
        </p>

        <div className="lp-hero-actions">
          <button className="lp-btn-primary" onClick={onLaunch}>
            &gt;_ Get Started
          </button>
          <a
            className="lp-btn-secondary"
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            View PolyG Source
          </a>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <div className="lp-feature">
          <div className="lp-feature-icon">&gt;_</div>
          <h3>RAG Retrieval</h3>
          <p>
            PolyG traverses a property graph at query time to surface
            semantically and structurally relevant chunks — not just nearest
            neighbours — before every LLM call.
          </p>
        </div>

        <div className="lp-feature">
          <div className="lp-feature-icon">{ }</div>
          <h3>Long-Context Optimised</h3>
          <p>
            Even million-token windows dilute attention. GPilot injects only
            the retrieved passages so the model stays focused regardless of
            corpus size.
          </p>
        </div>

        <div className="lp-feature">
          <div className="lp-feature-icon">~/</div>
          <h3>Dataset-Aware Chat</h3>
          <p>
            Switch between General, Code, Docs, Data Analysis, and Science
            scopes mid-session — each backed by its own retrieval index.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <span className="lp-footer-left">© 2025 GPilot</span>
        <div className="lp-footer-links">
          <a
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            PolyG on GitHub
          </a>
          <a
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            License
          </a>
        </div>
      </footer>

    </div>
  );
}
