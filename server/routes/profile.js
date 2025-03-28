import express from "express";
import { supabase } from "../db/supabaseClient.js";
import { authenticateToken } from "../middlewares/auth_middleware.js";

const router = express.Router();

// Get profile
router.get("/api/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.user;

    // Get role-specific profile
    const { data, error } = await supabase
      .from(role === "farmer" ? "farmer_profiles" : "lender_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // Ignore no rows found error
      console.error("Profile fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    return res.json({ data: data || {} });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile
router.put("/api/profile/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { user: userData, profile: profileData } = req.body;
  const { role } = req.user;

  try {
    // Start a Supabase transaction
    const { error: userError } = await supabase
      .from("users")
      .update({
        name: userData.name,
        email: userData.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userError) {
      console.error("User update error:", userError);
      throw userError;
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from(role === "farmer" ? "farmer_profiles" : "lender_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    let profileError;

    if (!existingProfile) {
      // Create new profile
      const { error } = await supabase
        .from(role === "farmer" ? "farmer_profiles" : "lender_profiles")
        .insert([
          {
            user_id: userId,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      profileError = error;
    } else {
      // Update existing profile
      const { error } = await supabase
        .from(role === "farmer" ? "farmer_profiles" : "lender_profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      profileError = error;
    }

    if (profileError) {
      console.error("Profile update error:", profileError);
      throw profileError;
    }

    // Get updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from(role === "farmer" ? "farmer_profiles" : "lender_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Profile fetch error:", fetchError);
      throw fetchError;
    }

    return res.json({
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      error: error.message || "Failed to update profile",
    });
  }
});

export default router;
