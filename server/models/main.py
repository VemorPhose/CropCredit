import os
import sys
from pathlib import Path
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Get the absolute paths to env files
env_path = Path(__file__).parent.parent / '.env'
env_secret_path = Path(__file__).parent.parent / '.env.secret'

# Load both env files
load_dotenv(env_path)
load_dotenv(env_secret_path)

from server.models.memory import save_chat_history, get_chat_history
from server.models.database import search_supabase

# Create a fixed UUID for testing
TEST_USER_UUID = "00000000-0000-0000-0000-000000000000"  # This should match a user in your DB

client = InferenceClient(
    provider="sambanova",
    api_key=os.getenv("HF_API_KEY"),
)

def chatbot(user_id, user_input):
    try:
        # Retrieve past conversation
        chat_history = get_chat_history(user_id)
        
        # Search for relevant database information
        db_results = search_supabase(user_input)
        
        # Format system prompt
        system_prompt = "You are an AI assistant helping farmers by answering questions about agricultural schemes and finance. Keep your answers concise. Use bullet points if possible. Use the following knowledge if relevant:\n"
        system_prompt += db_results if db_results else "No additional context found."

        # Prepare message history for LLM
        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append({"role": "user" if len(messages) % 2 == 1 else "assistant", "content": msg})
        messages.append({"role": "user", "content": user_input})

        # Save user message first
        save_chat_history(user_id, user_input, is_response=False)
        
        # Query LLM
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.1-8B-Instruct",  # Using supported model
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        response = completion.choices[0].message["content"]

        # Save bot response
        save_chat_history(user_id, response, is_response=True)

        return response

    except Exception as e:
        print(f"Error in chatbot: {e}")
        return "I apologize, but I encountered an error. Please try again."

if __name__ == "__main__":
    print(f"Starting chat session with test user ID: {TEST_USER_UUID}")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        print("Bot:", chatbot(TEST_USER_UUID, user_input))
