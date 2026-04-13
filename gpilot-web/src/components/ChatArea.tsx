import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import type { Chat, Dataset } from '../types';
import { DATASETS } from '../types';
import { ChatInput } from './ChatInput';
import { DatasetTab } from './DatasetTab';

interface ChatAreaProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  onDatasetChange: (dataset: Dataset) => void;
  isLoading?: boolean;
}

export function ChatArea({ chat, onSendMessage, onDatasetChange, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="chat-area empty">
        <div className="empty-state">
          <Bot size={64} className="empty-icon" />
          <h2>Welcome to GPilot</h2>
          <p>Select a chat from the sidebar or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2 className="chat-title">{chat.title}</h2>
        <DatasetTab
          dataset={chat.dataset}
          onDatasetChange={onDatasetChange}
          datasets={DATASETS}
        />
      </div>

      <div className="messages-container">
        {chat.messages.length === 0 ? (
          <div className="welcome-message">
            <Bot size={48} className="welcome-icon" />
            <h3>Hello! How can I help you today?</h3>
            <p>
              You are currently querying the <strong>{chat.dataset.name}</strong> dataset.
            </p>
          </div>
        ) : (
          chat.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <User size={20} />
                ) : (
                  <Bot size={20} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="message-text">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
}
