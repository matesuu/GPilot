import { MessageSquare, Code, FileText, BarChart, FlaskConical, ChevronDown } from 'lucide-react';
import type { Dataset } from '../types';
import { useState } from 'react';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  MessageSquare,
  Code,
  FileText,
  BarChart,
  FlaskConical,
};

interface DatasetTabProps {
  dataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
  datasets: Dataset[];
}

export function DatasetTab({ dataset, onDatasetChange, datasets }: DatasetTabProps) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = iconMap[dataset.icon] || MessageSquare;

  return (
    <div className="dataset-tab-container">
      <button
        className="dataset-tab"
        style={{ borderColor: dataset.color }}
        onClick={() => setShowMenu(!showMenu)}
      >
        <Icon size={16} />
        <span>{dataset.name}</span>
        <ChevronDown size={14} className={showMenu ? 'rotated' : ''} />
      </button>
      {showMenu && (
        <div className="dataset-tab-menu">
          {datasets.map((d) => (
            <button
              key={d.id}
              className={`dataset-tab-option ${d.id === dataset.id ? 'active' : ''}`}
              onClick={() => {
                onDatasetChange(d);
                setShowMenu(false);
              }}
            >
              <span className="option-dot" style={{ backgroundColor: d.color }} />
              {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
