import redis
import json
import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv('.env')

# Load variables from .env.secret
load_dotenv('.env.secret')

redis_client = redis.Redis(host=os.getenv("REDIS_HOST"), port=int(os.getenv("REDIS_PORT")), decode_responses=True)

def save_chat_history(user_id, message):
    """Save user chat history in Redis."""
    key = f"chat:{user_id}"
    history = redis_client.get(key)
    history = json.loads(history) if history else []
    history.append(message)
    redis_client.set(key, json.dumps(history))

def get_chat_history(user_id, limit=5):
    """Retrieve last 'limit' messages from chat history."""
    key = f"chat:{user_id}"
    history = redis_client.get(key)
    return json.loads(history)[-limit:] if history else []
