import { useEffect, useRef, useState } from 'react';
import { Bot, User } from 'lucide-react';
import type { Chat } from '../types';
import { ChatInput } from './ChatInput';

interface ChatAreaProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  thinkingStartedAt?: number | null;
}

const formatThinkingTime = (durationMs: number) => {
  const seconds = durationMs / 1000;

  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`;
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export function ChatArea({ chat, onSendMessage, isLoading, thinkingStartedAt }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => Date.now());
  const elapsedThinkingMs = thinkingStartedAt ? Math.max(0, now - thinkingStartedAt) : 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  useEffect(() => {
    if (!thinkingStartedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(interval);
  }, [thinkingStartedAt]);

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
      </div>

      <div className="messages-container">
        {chat.messages.length === 0 ? (
          <div className="welcome-message">
            <Bot size={48} className="welcome-icon" />
            <h3>Hello! How can I help you today?</h3>
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
                {message.role === 'assistant' && message.thinkingDurationMs != null && (
                  <div className="thinking-time">
                    Thought for {formatThinkingTime(message.thinkingDurationMs)}
                  </div>
                )}
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
              {thinkingStartedAt && (
                <div className="thinking-time live">
                  Thinking for {formatThinkingTime(elapsedThinkingMs)}
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
}
