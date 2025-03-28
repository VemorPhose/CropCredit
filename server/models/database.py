from supabase import create_client, Client
from dotenv import load_dotenv
import os
from pathlib import Path

# Get the absolute path to the .env file
env_path = Path(__file__).parent.parent / '.env'

# Load environment variables from the correct path
load_dotenv(env_path)

# Create the Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_anon_key:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")

# Connect to Supabase
supabase: Client = create_client(supabase_url, supabase_anon_key)

def search_supabase(query):
    """
    Perform a semantic search on Supabase using SQL.
    """
    try:
        # Query the government_schemes table
        response = supabase.rpc('search_schemes', {'query': query}).execute()

        # The response structure is different - we need to access data directly
        results = response.data

        if not results:
            return "No relevant information found."

        # Format the results into readable format
        output = "\n".join(
            [f"🛠️ **{row['name']}**\n{row['description']}\n✨ Benefits: {row['benefits']}\n📌 Category: {row['category']}"
             for row in results]
        )

        return output

    except Exception as e:
        print(f"Error: {e}")
        return "Failed to retrieve data from Supabase."
