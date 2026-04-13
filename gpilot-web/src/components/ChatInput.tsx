import { useState } from 'react';
import type { FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask GPilot anything..."
          disabled={disabled}
          rows={1}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim() || disabled}
        >
          {disabled ? <Loader2 size={20} className="spinner" /> : <Send size={20} />}
        </button>
      </div>
      <p className="input-hint">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
}
