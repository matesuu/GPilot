import { Plus, Trash2 } from 'lucide-react';
import type { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  historyStatus: string;
}

export function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  historyStatus,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <pre className="logo-mark" aria-hidden="true">{` __
(_|
 _|`}</pre>
          <span>gpilot</span>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={18} />
          <span>new chat</span>
        </button>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="chat-item-content">
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

      <div className="history-status">{historyStatus}</div>
    </div>
  );
}
