import type { Chat, Message } from '../types';
import { DATASETS } from '../types';

type SupabaseChatRow = {
  id: string;
  title: string;
  dataset_id: string;
  messages: Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
  created_at: string;
  updated_at?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const TABLE_NAME = 'chat_history';

export const isChatHistoryConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const getDataset = (datasetId: string) => (
  DATASETS.find((dataset) => dataset.id === datasetId) ?? DATASETS[0]
);

const getEndpoint = (path = '') => {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not set.');
  }

  return `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${TABLE_NAME}${path}`;
};

const getHeaders = (prefer?: string) => {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not set.');
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
};

const assertOk = async (response: Response) => {
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(detail || response.statusText);
  }
};

const toRow = (chat: Chat): SupabaseChatRow => ({
  id: chat.id,
  title: chat.title,
  dataset_id: chat.dataset.id,
  messages: chat.messages.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
  })),
  created_at: chat.createdAt.toISOString(),
  updated_at: new Date().toISOString(),
});

const fromRow = (row: SupabaseChatRow): Chat => ({
  id: row.id,
  title: row.title,
  dataset: getDataset(row.dataset_id),
  messages: row.messages.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
  })),
  createdAt: new Date(row.created_at),
});

export const loadChatHistory = async () => {
  if (!isChatHistoryConfigured) return [];

  const response = await fetch(getEndpoint('?select=*&order=updated_at.desc'), {
    headers: getHeaders(),
  });
  await assertOk(response);

  const rows = (await response.json()) as SupabaseChatRow[];
  return rows.map(fromRow);
};

export const saveChat = async (chat: Chat) => {
  if (!isChatHistoryConfigured) return;

  const response = await fetch(getEndpoint('?on_conflict=id'), {
    method: 'POST',
    headers: getHeaders('resolution=merge-duplicates'),
    body: JSON.stringify(toRow(chat)),
  });
  await assertOk(response);
};

export const deleteChat = async (chatId: string) => {
  if (!isChatHistoryConfigured) return;

  const response = await fetch(getEndpoint(`?id=eq.${encodeURIComponent(chatId)}`), {
    method: 'DELETE',
    headers: getHeaders(),
  });
  await assertOk(response);
};
