import { useState } from 'react';
import { Plus, Bot, Trash2 } from 'lucide-react';
import type { Chat, Dataset } from '../types';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: (dataset: Dataset) => void;
  onDeleteChat: (chatId: string) => void;
  datasets: Dataset[];
}

export function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  datasets,
}: SidebarProps) {
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Bot className="logo-icon" />
          <span>GPilot</span>
        </div>
      </div>

      <div className="sidebar-actions">
        <div className="new-chat-wrapper">
          <button
            className="new-chat-btn"
            onClick={() => setShowDatasetMenu(!showDatasetMenu)}
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
          {showDatasetMenu && (
            <div className="dataset-menu">
              {datasets.map((dataset) => (
                <button
                  key={dataset.id}
                  className="dataset-option"
                  onClick={() => {
                    onNewChat(dataset);
                    setShowDatasetMenu(false);
                  }}
                >
                  <span
                    className="dataset-dot"
                    style={{ backgroundColor: dataset.color }}
                  />
                  {dataset.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="chat-item-content">
              <span
                className="chat-dataset-indicator"
                style={{ backgroundColor: chat.dataset.color }}
              />
              <span className="chat-title">{chat.title}</span>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
