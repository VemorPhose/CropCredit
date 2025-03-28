import psycopg2
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv('.env')

# Load variables from .env.secret
load_dotenv('.env.secret')

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=os.getenv("SUPABASE_DB_NAME"),
    user=os.getenv("SUPABASE_DB_USER"),
    password=os.getenv("SUPABASE_DB_PASSWORD"),
    host=os.getenv("SUPABASE_HOST"),       # ✅ Use the correct Supabase host
    port="5432"                             # ✅ Supabase uses 5432
)
cur = conn.cursor()

def search_supabase(query):
    """
    Perform a semantic search using pg_trgm similarity.
    """
    try:
        # Improved SQL query with pg_trgm semantic matching
        sql = """
        SELECT 
            name, description, benefits, category,
            similarity(description, %s) AS score
        FROM government_schemes
        WHERE description % %s
        ORDER BY score DESC
        LIMIT 5;
        """
        
        cur.execute(sql, (query, query))
        results = cur.fetchall()

        if not results:
            return "No relevant information found."

        # Format the results into readable format
        response = "\n".join(
            [f"🛠️ **{row[0]}**\n{row[1]}\n✨ Benefits: {row[2]}\n📌 Category: {row[3]} (Score: {row[4]:.2f})" 
             for row in results]
        )
        
        return response

    except Exception as e:
        print(f"Error: {e}")
        return "Failed to retrieve data from Supabase."

    finally:
        cur.close()
        conn.close()
