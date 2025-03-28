import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import chatBotLightSvg from "../../assets/chatbot-svgrepo-com_noramal_2025200656.svg";
import chatBotDarkSvg from "../../assets/chatbot-svgrepo-com_dark_2025200700.svg";

const ChatbotIcon = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div>
      <img
        src={theme === "dark" ? chatBotDarkSvg : chatBotLightSvg}
        alt="Chat Bot Logo"
        className="h-8 w-8 md:h-10 md:w-10 transition-opacity duration-300"
      />
    </div>
  );
};

export default ChatbotIcon;
