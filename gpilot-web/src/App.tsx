import { useState, useCallback } from 'react';
import { Sidebar, ChatArea, TopBar } from './components';
import type { Chat } from './types';
import { DATASETS, generateId } from './types';
import './App.css';

const DEFAULT_DATASET = DATASETS[0];

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStartedAt, setThinkingStartedAt] = useState<number | null>(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;

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
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  }, [selectedChatId]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedChatId) return;

    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? content.slice(0, 30) + '...' : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
    );

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
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail ?? res.statusText);
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
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat
          )
        );
      })
      .catch((err: Error) => {
        const errorMessage = {
          id: generateId(),
          role: 'assistant' as const,
          content: `⚠️ Error: ${err.message}`,
          timestamp: new Date(),
          thinkingDurationMs: Date.now() - requestStartedAt,
        };
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, messages: [...chat.messages, errorMessage] }
              : chat
          )
        );
      })
      .finally(() => {
        setIsLoading(false);
        setThinkingStartedAt(null);
      });
  }, [selectedChatId, selectedChat?.dataset.id]);

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
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
