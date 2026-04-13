export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Dataset {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Chat {
  id: string;
  title: string;
  dataset: Dataset;
  messages: Message[];
  createdAt: Date;
}

export const DATASETS: Dataset[] = [
  { id: 'general', name: 'General', icon: 'MessageSquare', color: '#6366f1' },
  { id: 'code', name: 'Code', icon: 'Code', color: '#22c55e' },
  { id: 'docs', name: 'Documentation', icon: 'FileText', color: '#f59e0b' },
  { id: 'data', name: 'Data Analysis', icon: 'BarChart', color: '#ec4899' },
  { id: 'science', name: 'Science', icon: 'FlaskConical', color: '#8b5cf6' },
];

export const generateId = () => Math.random().toString(36).substring(2, 11);
