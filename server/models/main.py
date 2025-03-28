import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from memory import save_chat_history, get_chat_history
from database import search_supabase

# Load variables from .env
load_dotenv('.env')

# Load variables from .env.secret
load_dotenv('.env.secret')

client = InferenceClient(
    provider="sambanova",
    api_key=os.getenv("HF_API_KEY"),
)

def chatbot(user_id, user_input):
    # Retrieve past conversation
    chat_history = get_chat_history(user_id)
    
    # Search for relevant database information
    db_results = search_supabase(user_input)
    
    # Format system prompt
    system_prompt = "You are an AI assistant helping farmers by answering questions about agricultural schemes and finance. Keep your answers concise. Use bullet points if possible. Use the following knowledge if relevant:\n"
    system_prompt += "\n".join(db_results) if db_results else "No additional context found."

    # Prepare message history for LLM
    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": "user", "content": msg} for msg in chat_history]
    messages.append({"role": "user", "content": user_input})

    # Query LLaMA 3
    completion = client.chat.completions.create(
        model="meta-llama/Llama-3.1-8B-Instruct",
        messages=messages,
        max_tokens=500,
    )

    response = completion.choices[0].message["content"]

    # Save chat history
    save_chat_history(user_id, user_input)
    save_chat_history(user_id, response)

    return response

if __name__ == "__main__":
    while True:
        user_id = "test_user"  # Replace with dynamic user ID in production
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        print("Bot:", chatbot(user_id, user_input))
