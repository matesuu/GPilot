import { useState } from 'react';
import { Bot, GitBranch, X, Zap } from 'lucide-react';
import './TopBar.css';

const FEATURES = [
  {
    icon: '>_',
    title: 'RAG Retrieval',
    desc: 'PolyG traverses a property graph at query time to surface semantically and structurally relevant chunks — not just nearest neighbours — before every LLM call.',
  },
  {
    icon: '{ }',
    title: 'Long-Context Optimised',
    desc: 'Even million-token windows dilute attention. GPilot injects only the retrieved passages so the model stays focused regardless of corpus size.',
  },
  {
    icon: '~/',
    title: 'Dataset-Aware Chat',
    desc: 'Switch between General, Code, Docs, Data Analysis, and Science scopes mid-session — each backed by its own retrieval index.',
  },
];

export function TopBar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <Bot size={22} className="topbar-brand-icon" />
          <span className="topbar-brand-name">GPilot</span>
        </div>

        <div className="topbar-actions">
          <button
            className="topbar-btn topbar-btn--features"
            onClick={() => setFeaturesOpen(true)}
          >
            <Zap size={15} />
            Features
          </button>

          <a
            className="topbar-btn topbar-btn--github"
            href="https://github.com/Liu-rj/PolyG/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitBranch size={15} />
            PolyG on GitHub
          </a>
        </div>
      </header>

      {/* Features modal */}
      {featuresOpen && (
        <div className="feat-overlay" onClick={() => setFeaturesOpen(false)}>
          <div
            className="feat-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="GPilot Features"
          >
            <div className="feat-modal-header">
              <h2 className="feat-modal-title">GPilot Features</h2>
              <button
                className="feat-close-btn"
                onClick={() => setFeaturesOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="feat-list">
              {FEATURES.map((f) => (
                <div key={f.title} className="feat-item">
                  <div className="feat-item-icon">{f.icon}</div>
                  <div>
                    <h3 className="feat-item-title">{f.title}</h3>
                    <p className="feat-item-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
