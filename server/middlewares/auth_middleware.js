import jwt from "jsonwebtoken";
import { supabase } from "../db/supabaseClient.js";

const authenticateToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access Denied!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", decoded.id)
      .single();

    if (error) {
      console.error("User fetch error:", error);
      return res.status(403).json({ error: "Invalid Token!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(403).json({ error: "Invalid Token!" });
  }
};

export { authenticateToken };
