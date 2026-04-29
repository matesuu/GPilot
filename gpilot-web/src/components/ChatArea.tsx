import { useEffect, useRef } from 'react';
import { GraphRagLogo } from './GraphRagLogo';
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

export function ChatArea({ chat, onSendMessage, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="chat-area empty">
        <div className="empty-state">
          <GraphRagLogo className="empty-logo" showWordmark={false} />
          <h2>welcome to gpilot</h2>
          <p>select a chat from the sidebar or create a new one to get started.</p>
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
            <GraphRagLogo className="welcome-logo" showWordmark={false} />
            <h3>how can i help?</h3>
          </div>
        ) : (
          chat.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user' : 'assistant'}${message.isError ? ' error' : ''}`}
            >
              <div className="message-content">
                <div className="message-text">{message.content}</div>
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
