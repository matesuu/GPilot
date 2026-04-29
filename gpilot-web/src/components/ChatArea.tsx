import { useEffect, useRef } from 'react';
import type { Chat } from '../types';
import { AsciiGlobeLogo } from './AsciiGlobeLogo';
import { ChatInput } from './ChatInput';

interface ChatAreaProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  thinkingStartedAt?: number | null;
}

export function ChatArea({ chat, onSendMessage, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="chat-area empty">
        <div className="empty-state">
          <AsciiGlobeLogo className="empty-icon" />
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
            <AsciiGlobeLogo className="welcome-icon" />
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
