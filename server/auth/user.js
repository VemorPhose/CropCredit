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
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Email Already Exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data: newUser, error: createError } = await supabase
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

    if (createError) throw createError;

    return res.status(201).json({
      message: "User Registered Successfully!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: error.message || "Registration failed",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All Fields Required!" });
    }

    console.log("Attempting login for email:", email); // Debug log

    // Get user - Modified query to log the error if any
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError) {
      console.error("Database error:", userError);
      return res.status(400).json({ error: "User Not Found" });
    }

    if (!user) {
      console.log("No user found with email:", email);
      return res.status(400).json({ error: "User Not Found" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password check result:", isValidPassword); // Debug log

    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid Password!" });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set cookie and send response
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({
      message: "Login Successful!",
      user: userWithoutPassword,
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
