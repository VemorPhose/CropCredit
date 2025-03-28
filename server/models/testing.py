from database import search_supabase

query = "crop insurance"  
result = search_supabase(query)
print(result)
