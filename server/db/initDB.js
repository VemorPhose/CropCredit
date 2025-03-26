import { supabase } from "./supabaseClient.js";

const initDB = async () => {
  const { data, error } = await supabase.from("users").insert({
    email: "test@test.com",
    password: "test",
  });

  if (error) {
    console.error("Error updating users table:", error);
  } else {
    console.log("Users table updated successfully:", data);
  }
};

export default initDB;
