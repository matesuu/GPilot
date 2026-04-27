import { useState, useCallback, useEffect } from 'react';
import { Sidebar, ChatArea, TopBar } from './components';
import type { Chat } from './types';
import { DATASETS, MAX_QUESTION_LENGTH, generateId } from './types';
import {
  deleteChat,
  isChatHistoryConfigured,
  loadChatHistory,
  saveChat,
} from './lib/supabaseChatHistory';
import './App.css';

const DEFAULT_DATASET = DATASETS[0];

const ERROR_MESSAGES = {
  invalidApiKey: 'Model provider credentials are invalid. Contact the project owner to update the API key.',
  serverNotRunning: 'GPilot server is not reachable. Start the backend and try again.',
  neo4jOffline: 'Knowledge database is offline. Start Neo4j and retry.',
  graphUnavailable: 'Knowledge graph is unavailable for this dataset. Try again later or choose another dataset.',
  emptyQuestion: 'Type a question before sending.',
  questionTooLong: 'Question is too long for this model. Shorten it and try again.',
  datasetUnavailable: 'Selected dataset is not available on the server. Choose another dataset or contact the project owner.',
  fallback: 'Something went wrong while GPilot was generating a response. Please try again.',
} as const;

class QueryRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'QueryRequestError';
    this.status = status;
  }
}

const getErrorDetail = (body: unknown, fallback: string) => {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === 'string') return detail;
    return JSON.stringify(detail);
  }

  return fallback;
};

const getClientErrorMessage = (error: unknown) => {
  const status = error instanceof QueryRequestError ? error.status : undefined;
  const detail = error instanceof Error ? error.message : String(error);
  const normalized = detail.toLowerCase();

  if (normalized.includes('api key') || normalized.includes('unauthorized') || normalized.includes('authentication')) {
    return ERROR_MESSAGES.invalidApiKey;
  }

  if (normalized.includes('neo4j') || normalized.includes('bolt') || normalized.includes('7687')) {
    return ERROR_MESSAGES.neo4jOffline;
  }

  if (normalized.includes('not available on this server') || normalized.includes('unknown dataset')) {
    return ERROR_MESSAGES.datasetUnavailable;
  }

  if (status === 413 || normalized.includes('too long') || normalized.includes('context length') || normalized.includes('maximum context')) {
    return ERROR_MESSAGES.questionTooLong;
  }

  if (normalized.includes('knowledge graph') || normalized.includes('graph') || normalized.includes('context')) {
    return ERROR_MESSAGES.graphUnavailable;
  }

  if (
    status === 503 ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch failed') ||
    normalized.includes('econnrefused') ||
    normalized.includes('backend_origin')
  ) {
    return ERROR_MESSAGES.serverNotRunning;
  }

  return ERROR_MESSAGES.fallback;
};

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStartedAt, setThinkingStartedAt] = useState<number | null>(null);
  const [historyStatus, setHistoryStatus] = useState(
    isChatHistoryConfigured ? 'Loading history...' : 'History not configured'
  );

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;

  useEffect(() => {
    let isCurrent = true;

    loadChatHistory()
      .then((loadedChats) => {
        if (!isCurrent) return;

        setChats(loadedChats);
        setSelectedChatId(loadedChats[0]?.id ?? null);
        setHistoryStatus(
          isChatHistoryConfigured
            ? 'History synced'
            : 'Add Supabase env vars to sync history'
        );
      })
      .catch((error) => {
        if (!isCurrent) return;
        console.error('Failed to load chat history:', error);
        setHistoryStatus('History sync failed');
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const persistChat = useCallback((chat: Chat) => {
    saveChat(chat)
      .then(() => {
        if (isChatHistoryConfigured) setHistoryStatus('History synced');
      })
      .catch((error) => {
        console.error('Failed to save chat:', error);
        setHistoryStatus('History sync failed');
      });
  }, []);

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      dataset: DEFAULT_DATASET,
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    setHistoryStatus(isChatHistoryConfigured ? 'Saving history...' : 'Add Supabase env vars to sync history');
    persistChat(newChat);
  }, [persistChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
    setHistoryStatus(isChatHistoryConfigured ? 'Saving history...' : 'Add Supabase env vars to sync history');
    deleteChat(chatId)
      .then(() => {
        if (isChatHistoryConfigured) setHistoryStatus('History synced');
      })
      .catch((error) => {
        console.error('Failed to delete chat:', error);
        setHistoryStatus('History sync failed');
      });
  }, [selectedChatId]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedChatId || !selectedChat) return;

    if (!content.trim()) return;
    if (content.length > MAX_QUESTION_LENGTH) return;

    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content,
      timestamp: new Date(),
    };

    const chatWithUserMessage = {
      ...selectedChat,
      title: selectedChat.messages.length === 0 ? content.slice(0, 30) + '...' : selectedChat.title,
      messages: [...selectedChat.messages, userMessage],
    };

    setChats((prev) =>
      prev.map((chat) => (chat.id === selectedChatId ? chatWithUserMessage : chat))
    );
    setHistoryStatus(isChatHistoryConfigured ? 'Saving history...' : 'Add Supabase env vars to sync history');
    persistChat(chatWithUserMessage);

    setIsLoading(true);
    const requestStartedAt = Date.now();
    setThinkingStartedAt(requestStartedAt);

    const datasetId = selectedChat?.dataset.id ?? DEFAULT_DATASET.id;
    fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: content, dataset_id: datasetId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new QueryRequestError(getErrorDetail(body, res.statusText), res.status);
        }
        return res.json();
      })
      .then((data) => {
        const assistantMessage = {
          id: generateId(),
          role: 'assistant' as const,
          content: data.answer,
          timestamp: new Date(),
          thinkingDurationMs: Date.now() - requestStartedAt,
        };
        const chatWithAssistantMessage = {
          ...chatWithUserMessage,
          messages: [...chatWithUserMessage.messages, assistantMessage],
        };
        setChats((prev) =>
          prev.map((chat) => (chat.id === selectedChatId ? chatWithAssistantMessage : chat))
        );
        setHistoryStatus(isChatHistoryConfigured ? 'Saving history...' : 'Add Supabase env vars to sync history');
        persistChat(chatWithAssistantMessage);
      })
      .catch((err: Error) => {
        const errorMessage = {
          id: generateId(),
          role: 'assistant' as const,
          content: getClientErrorMessage(err),
          timestamp: new Date(),
          thinkingDurationMs: Date.now() - requestStartedAt,
          isError: true,
        };
        const chatWithErrorMessage = {
          ...chatWithUserMessage,
          messages: [...chatWithUserMessage.messages, errorMessage],
        };
        setChats((prev) =>
          prev.map((chat) => (chat.id === selectedChatId ? chatWithErrorMessage : chat))
        );
        setHistoryStatus(isChatHistoryConfigured ? 'Saving history...' : 'Add Supabase env vars to sync history');
        persistChat(chatWithErrorMessage);
      })
      .finally(() => {
        setIsLoading(false);
        setThinkingStartedAt(null);
      });
  }, [selectedChat, selectedChatId, persistChat]);

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        historyStatus={historyStatus}
      />
      <div className="main-wrapper">
        <TopBar />
        <main className="main-content">
          <ChatArea
            chat={selectedChat}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            thinkingStartedAt={thinkingStartedAt}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
