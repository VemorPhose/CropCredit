import React from "react";
import ChatbotIcon from "./ChatbotIcon";
import { ExternalLink } from "lucide-react";

const ChatMessage = ({ chat, onNavigate }) => {
  if (chat.hideInChat) return null;

  if (chat.role === "user") {
    return (
      <div className="message user-message">
        <p className="message-text">{chat.text}</p>
      </div>
    );
  } else {
    return (
      <div className={`message bot-message ${chat.isError ? "error" : ""}`}>
        <ChatbotIcon size="small" />
        <div className="message-content">
          <p className="message-text">{chat.text}</p>
          
          {/* Navigation buttons - only displayed when there are matching intents */}
          {chat.includeNavLink && chat.navLinks && chat.navLinks.length > 0 && (
            <div className="navigation-buttons mt-3 flex flex-wrap gap-2">
              {chat.navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate(link.path)}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-md flex items-center gap-1 transition-colors"
                >
                  {link.text} <ExternalLink size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default ChatMessage;
