import { useState } from 'react';
import type { FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { MAX_QUESTION_LENGTH } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setInputError('Type a question before sending.');
      return;
    }

    if (trimmedInput.length > MAX_QUESTION_LENGTH) {
      setInputError('Question is too long for this model. Shorten it and try again.');
      return;
    }

    if (!disabled) {
      onSendMessage(trimmedInput);
      setInputError('');
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
          onChange={(e) => {
            setInput(e.target.value);
            if (inputError) setInputError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask GPilot anything..."
          disabled={disabled}
          rows={1}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={disabled}
          aria-label="Send message"
        >
          {disabled ? <Loader2 size={20} className="spinner" /> : <Send size={20} />}
        </button>
      </div>
      {inputError && <p className="input-error">{inputError}</p>}
      <p className="input-hint">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
}
