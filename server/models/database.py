from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv('.env')

# Create the Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

# ✅ Connect to Supabase
supabase: Client = create_client(supabase_url, supabase_anon_key)

def search_supabase(query):
    """
    Perform a semantic search on Supabase using SQL.
    """
    try:
        # Query the government_schemes table
        response = supabase.rpc('search_schemes', {'query': query}).execute()

        if response.get("error"):
            print(f"Error: {response['error']}")
            return "Failed to retrieve data from Supabase."

        results = response.get("data", [])

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
