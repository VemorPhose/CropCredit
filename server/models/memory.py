from pathlib import Path
from dotenv import load_dotenv
import json
from datetime import datetime
from .database import supabase

# Get the absolute paths to env files
env_path = Path(__file__).parent.parent / '.env'
env_secret_path = Path(__file__).parent.parent / '.env.secret'

# Load both env files
load_dotenv(env_path)
load_dotenv(env_secret_path)

def save_chat_history(user_id, message, is_response=False):
    """Save chat message to Supabase chatbot_interactions table."""
    try:
        data = {
            "user_id": user_id,
            "message": message if not is_response else "",  # Empty string instead of None
            "response": message if is_response else "",     # Empty string instead of None
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        result = supabase.table('chatbot_interactions').insert(data).execute()
        
        # Check for error in data property
        if hasattr(result.data, 'error'):
            print(f"Error saving to Supabase: {result.data.error}")
            return None
            
        return result.data
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return None

def get_chat_history(user_id, limit=5):
    """Retrieve last 'limit' messages from Supabase."""
    try:
        result = supabase.table('chatbot_interactions')\
            .select('message,response')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        # Direct data access without error check
        messages = result.data if result.data else []
        messages.reverse()
        
        # Combine messages and responses in order
        conversation = []
        for msg in messages:
            if msg.get('message') and msg['message'].strip():
                conversation.append(msg['message'])
            if msg.get('response') and msg['response'].strip():
                conversation.append(msg['response'])
        return conversation
    except Exception as e:
        print(f"Error retrieving from Supabase: {e}")
        return []
