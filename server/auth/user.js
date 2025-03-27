import { supabase } from "../db/supabaseClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if ([name, email, password, role].some((field) => !field?.trim())) {
      return res.status(400).json({ error: "All Fields Required!" });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email}`)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Email Already Exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
        },
      ])
      .select("id, name, email, role")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return res.status(400).json({ error: "Email Already Exists!" });
      }
      throw error;
    }

    // Set current user ID to allow profile creation
    await supabase.rpc("set_user_id", { user_id: newUser.id });

    // Create role-specific profile
    if (role === "farmer") {
      await supabase.from("farmer_profiles").insert([{ user_id: newUser.id }]);
    } else if (role === "lender") {
      await supabase.from("lender_profiles").insert([{ user_id: newUser.id }]);
    }

    return res.status(201).json({ message: "User Registered Successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All Fields Required!" });
    }

    // Get user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "User Not Found" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid Password!" });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from user object
    delete user.password;

    return res
      .status(200)
      .cookie("token", token, options)
      .json({
        message: "Login Successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};

const logoutUser = async (req, res) => {
  return res
    .status(200)
    .clearCookie("token", options)
    .json({ message: "Logged out successfully" });
};

export { registerUser, loginUser, logoutUser };
