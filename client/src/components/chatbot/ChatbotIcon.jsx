import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import chatBotLightSvg from "../../assets/chatbot-svgrepo-com_noramal_2025200656.svg";
import chatBotDarkSvg from "../../assets/chatbot-svgrepo-com_dark_2025200700.svg";

const ChatbotIcon = ({ size = "default" }) => {
  const { theme } = useContext(ThemeContext);
  
  // Define size classes based on the size prop
  const sizeClasses = size === "small" 
    ? "h-6 w-6 md:h-7 md:w-7" 
    : "h-8 w-8 md:h-10 md:w-10";
  
  return (
    <div>
      <img
        src={theme === "dark" ? chatBotDarkSvg : chatBotLightSvg}
        alt="Chat Bot Logo"
        className={`${sizeClasses} transition-opacity duration-300`}
      />
    </div>
  );
};

export default ChatbotIcon;
