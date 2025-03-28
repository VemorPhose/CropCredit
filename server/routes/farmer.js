import express from "express";
import { supabase } from "../db/supabaseClient.js";
import { authenticateToken } from "../middlewares/auth_middleware.js";

const router = express.Router();

// Get farmer dashboard data
router.get("/api/farmer/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get farmer profile and credit score
    const { data: profile, error: profileError } = await supabase
      .from("farmer_profiles")
      .select("*, credit_score")
      .eq("user_id", userId)
      .single();

    if (profileError) throw profileError;

    // Get loan eligibility from loan_applications
    const { data: loanData, error: loanError } = await supabase
      .from("loan_applications")
      .select("amount, status, interest_rate, term")
      .eq("farmer_id", profile.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1);

    // Get eligible government schemes
    const { data: schemes, error: schemesError } = await supabase
      .from("farmer_scheme_eligibility")
      .select(
        `
        eligibility_score,
        status,
        government_schemes (
          id,
          name,
          description,
          benefits
        )
      `
      )
      .eq("farmer_id", profile.id)
      .order("eligibility_score", { ascending: false })
      .limit(3);

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("credit_evaluations")
      .select("credit_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    res.json({
      profile,
      loanEligibility: loanData?.[0] || null,
      eligibleSchemes:
        schemes?.map((s) => ({
          id: s.government_schemes.id,
          name: s.government_schemes.name,
          description: s.government_schemes.description,
          eligibility: s.eligibility_score >= 75 ? "High" : "Medium",
          status: s.status,
        })) || [],
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
