import { useEffect, useRef, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { X, MessageCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatbotIcon from "./chatbot/ChatbotIcon";
import ChatForm from "./chatbot/Chatform.jsx";
import ChatMessage from "./chatbot/ChatMessage";
import { companyInfo, siteNavigationMap } from "./chatbot/companyInfo.js";
import farmSvg from "../assets/farm-svgrepo-com.svg";
import "../index.css";

function ChatBot() {
  const { theme } = useContext(ThemeContext);
  const chatBodyRef = useRef();
  const navigate = useNavigate();
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  // Check if query might match any site navigation intent
  const checkForNavigation = (query) => {
    const lowercaseQuery = query.toLowerCase();
    let matches = [];

    // Hindi language keywords mapping to English navigation intents
    const hindiKeywords = {
      "ऋृण": "loan",         // Loan
      "उधार": "loan",         // Loan/Borrowing
      "वित्त": "finance",     // Finance
      "धन उधार": "loan",     // Money borrowing
      "जमा धन": "credit",    // Deposited money/credit
      "सरकारी योजनाएं": "scheme", // Government schemes
      "सरकार": "scheme"       // Government
    };

    // Check if any Hindi keywords are in the query
    for (const [hindi, englishIntent] of Object.entries(hindiKeywords)) {
      if (query.includes(hindi)) {
        // Find the corresponding navigation info for this English intent
        for (const [intent, pageInfo] of Object.entries(siteNavigationMap)) {
          if (intent.includes(englishIntent)) {
            matches.push({
              intent: englishIntent,
              navigationInfo: pageInfo,
            });
            break; // Found a match for this Hindi term
          }
        }
      }
    }

    // Check if any navigation keywords are in the query (existing English check)
    for (const [intent, pageInfo] of Object.entries(siteNavigationMap)) {
      if (lowercaseQuery.includes(intent)) {
        matches.push({
          intent,
          navigationInfo: pageInfo,
        });
      }
    }

    return matches.length > 0
      ? { hasMatch: true, matches }
      : { hasMatch: false };
  };

  // Generate response for non-navigation queries
  const generateGenericResponse = async (query) => {
    // Simplified answering logic based on query category
    const lowercaseQuery = query.toLowerCase();

    // Farm financing related questions
    if (
      lowercaseQuery.includes("loan") ||
      lowercaseQuery.includes("finance") ||
      lowercaseQuery.includes("credit")
    ) {
      return "CropCredit offers customized loan options based on your farm profile and credit score. We analyze factors like land holdings, crop types, and farming experience to provide the best loan terms.";
    }

    // Crop related questions
    else if (
      lowercaseQuery.includes("crop") ||
      lowercaseQuery.includes("farm")
    ) {
      return "Our platform takes into account your specific crop types and farming patterns to provide tailored financial recommendations. Different crops have different risk profiles and seasonal needs that we factor into our analysis.";
    }

    // About company/service questions
    else if (
      lowercaseQuery.includes("about") ||
      lowercaseQuery.includes("service") ||
      lowercaseQuery.includes("what do you")
    ) {
      return "CropCredit is a one-stop financial solution for farmers that bridges the gap between agricultural needs and financial services. We provide credit analysis, government scheme matching, and financial guidance tailored to your farming context.";
    }

    // Fallback for other questions - direct API call, not using useCallback
    else {
      try {
        const aiContext = `You are CropCredit's AI assistant helping farmers with questions about agricultural financing, government schemes, and credit assessment. Keep responses concise, helpful and focused on farming and finance topics.`;

        // Format API request - Updated to match Gemini API requirements
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Updated structure to match Gemini API requirements
            model: "gemini-1.5-flash",
            contents: [
              {
                role: "user",
                parts: [
                  { 
                    text: `${aiContext}\n\nUser question: ${query}` 
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        };
        
        // Use correct endpoint format
        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        const apiKey = import.meta.env.VITE_API_URL; // Make sure this environment variable is set
        
        const response = await fetch(apiKey, requestOptions);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(`Failed to get response from AI service: ${response.status}`);
        }

        const data = await response.json();
        
        // Updated to match Gemini API response structure
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const aiResponseText = data.candidates[0].content.parts[0].text.trim();
          return aiResponseText;
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Return a fallback response if API call fails
        return "I can provide information about agricultural financing, government schemes for farmers, credit analysis, and more. Feel free to ask specific questions about how CropCredit can help with your farming financial needs.";
      }
    }
  };

  const generateBotResponse = async (history) => {
    // Helper function to update chat history
    const updateHistory = (
      text,
      isError = false,
      includeNavLink = false,
      navLinks = []
    ) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError, includeNavLink, navLinks },
      ]);
    };

    try {
      // Get user's last message
      const userMessage = history[history.length - 1].text;

      // Add thinking indicator
      setChatHistory((prev) => [
        ...prev,
        { role: "model", text: "Thinking..." },
      ]);

      // Check for navigation-related query
      const { hasMatch, matches } = checkForNavigation(userMessage);

      // Process the response
      if (hasMatch) {
        // For navigation matches, provide concise answer + links
        const uniqueMatches = Array.from(
          new Map(
            matches.map((item) => [item.navigationInfo.path, item])
          ).values()
        );

        // Generate a relevant text response based on the type of page matched
        let responseText = "";

        if (
          matches.some(
            (m) => m.intent.includes("credit") || m.intent.includes("loan")
          )
        ) {
          responseText =
            "I can help you check your credit score and loan eligibility. Our credit analysis tool evaluates your farming profile to provide personalized recommendations.";
        } else if (matches.some((m) => m.intent.includes("scheme"))) {
          responseText =
            "We can help you discover government schemes you're eligible for. Our platform matches your profile with available programs to maximize your benefits.";
        } else if (
          matches.some(
            (m) => m.intent.includes("login") || m.intent.includes("register")
          )
        ) {
          responseText =
            "You can access your account or create a new one to use all our features.";
        } else {
          responseText =
            "I found relevant pages on our website that might help you:";
        }

        // Update with both text response and navigation links
        updateHistory(
          responseText,
          false,
          true,
          uniqueMatches.map((match) => ({
            text: match.navigationInfo.description,
            path: match.navigationInfo.path,
          }))
        );
      } else {
        // For general queries, provide a response which may come from the API
        try {
          // Remove the setTimeout and directly await the response
          const response = await generateGenericResponse(userMessage);
          updateHistory(response);
        } catch (error) {
          console.error("Failed to get response:", error);
          updateHistory(
            "I couldn't process that request. Can you try asking something else?",
            true
          );
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      updateHistory(
        "Sorry, I encountered an error processing your request. Please try again.",
        true
      );
    }
  };

  // Handle navigation when a link is clicked
  const handleNavigation = (path) => {
    setShowChatbot(false); // Close the chatbot
    navigate(path); // Navigate to the page
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
      >
        <span className="chat-icon">
          <MessageCircle size={25} color="white" strokeWidth={2} />
        </span>
        <span className="close-icon">
          <X size={24} color="white" strokeWidth={2} />
        </span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header - Updated with CropCredit logo */}
        <div className="chat-header">
          <div className="header-info">
            <img
              src={farmSvg}
              alt="CropCredit Logo"
              className="h-8 w-8 bg-white dark:bg-gray-800 rounded-full p-1"
            />
            <h2 className="logo-text">CropCredit Assistant</h2>
          </div>
          <button
            onClick={() => setShowChatbot((prev) => !prev)}
            className="flex items-center justify-center"
          >
            <X size={24} color="white" strokeWidth={2} />
          </button>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon size="small" />
            <p className="message-text">
              Hey there! I'm your CropCredit assistant.
              <br />
              How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage
              key={index}
              chat={chat}
              onNavigate={handleNavigation}
            />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
