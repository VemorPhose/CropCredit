import { useRef } from "react";
import { ArrowUp } from "lucide-react"; 

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    
    inputRef.current.value = "";
    
    // Update chat history with the user's message
    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
    ]);
    
    // Remove the duplicate "Thinking..." message and just call generateBotResponse directly
    generateBotResponse([
      ...chatHistory,
      {
        role: "user",
        text: `Using the details provided above, please address this query: ${userMessage}`,
      },
    ]);
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="chat-form">
      <input
        ref={inputRef}
        placeholder="Message..."
        className="message-input"
        required
      />
      <button
        type="submit"
        id="send-message"
        aria-label="Send message"
        className="flex items-center justify-center"
      >
        <div className="flex items-center justify-center w-full h-full">
          <ArrowUp size={18} />
        </div>
      </button>
    </form>
  );
};

export default ChatForm;
