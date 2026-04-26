export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinkingDurationMs?: number;
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
  { id: 'physics', name: 'Physics', icon: 'Atom', color: '#8b5cf6' },
  { id: 'goodreads', name: 'Goodreads', icon: 'BookOpen', color: '#f59e0b' },
];

export const generateId = () => Math.random().toString(36).substring(2, 11);
