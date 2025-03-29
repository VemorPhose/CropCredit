import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { spawn } from "child_process";
import { authenticateToken } from "../middlewares/auth_middleware.js";
import { supabase } from "../db/supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.post("/api/credit/analyze", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const formData = req.body;

    // First get farmer profile id since we need it for scheme eligibility
    let { data: farmerProfile, error: profileError } = await supabase
      .from("farmer_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      // Create farmer profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("farmer_profiles")
        .insert({
          user_id: userId,
          land_holding: formData.landHolding,
          primary_crop: formData.cropType,
          annual_income: formData.annualIncome,
          farming_experience: formData.farmingExperience,
          irrigation_source: formData.irrigationSource,
        })
        .select()
        .single();

      if (createError) throw createError;
      farmerProfile = newProfile;
    }

    // Launch Python script for credit score calculation
    const scriptPath = path.join(
      __dirname,
      "..",
      "models",
      "credit_score_calc.py"
    );
    const pythonProcess = spawn("python", [
      scriptPath,
      userId,
      JSON.stringify(formData),
    ]);

    let result = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Python script error:", error);
        return res
          .status(500)
          .json({ error: "Failed to calculate credit score" });
      }

      try {
        const analysisResult = JSON.parse(result);

        // Store credit evaluation
        const { data: evaluation, error: evalError } = await supabase
          .from("credit_evaluations")
          .insert({
            user_id: userId,
            credit_score: analysisResult.score,
            risk_factors: analysisResult.riskFactors,
            loan_eligibility: analysisResult.loanEligibility,
            input_data: formData,
          })
          .select()
          .single();

        if (evalError) throw evalError;

        // Update farmer profile with new credit score
        const { error: updateError } = await supabase
          .from("farmer_profiles")
          .update({ credit_score: analysisResult.score })
          .eq("id", farmerProfile.id);

        if (updateError) throw updateError;

        // Get all government schemes
        const { data: schemes, error: schemesError } = await supabase
          .from("government_schemes")
          .select("*");

        if (schemesError) throw schemesError;

        // Calculate eligibility for each scheme
        const schemeEligibility = schemes.map((scheme) => ({
          farmer_id: farmerProfile.id, // Changed from user_id to farmer_id
          scheme_id: scheme.id,
          eligibility_score: calculateSchemeEligibility(analysisResult, scheme),
          status: "eligible",
        }));

        // Update scheme eligibility
        const { error: eligibilityError } = await supabase
          .from("farmer_scheme_eligibility")
          .upsert(schemeEligibility, {
            onConflict: "farmer_id,scheme_id", // Updated conflict columns
            returning: true,
          });

        if (eligibilityError) throw eligibilityError;

        // Return analysis result with schemes
        res.json({
          ...analysisResult,
          eligibleSchemes: schemes.map((scheme) => ({
            ...scheme,
            eligibility_score: schemeEligibility.find(
              (se) => se.scheme_id === scheme.id
            )?.eligibility_score,
          })),
        });
      } catch (e) {
        console.error("Database error:", e);
        res.status(500).json({ error: "Failed to store analysis results" });
      }
    });
  } catch (error) {
    console.error("Credit analysis error:", error);
    res.status(500).json({ error: "Failed to process credit analysis" });
  }
});

// Helper function to calculate scheme eligibility
function calculateSchemeEligibility(analysis, scheme) {
  const score = analysis.score;
  let eligibilityScore = 0;

  // Basic eligibility based on credit score
  if (score >= 750) eligibilityScore += 40;
  else if (score >= 650) eligibilityScore += 30;
  else if (score >= 550) eligibilityScore += 20;
  else eligibilityScore += 10;

  // Additional criteria based on scheme category
  switch (scheme.category) {
    case "Credit":
      eligibilityScore += score >= 650 ? 35 : 20;
      break;
    case "Infrastructure":
      eligibilityScore += analysis.details.landHolding >= 5 ? 35 : 20;
      break;
    case "Technical Support":
      eligibilityScore += analysis.details.farmingExperience >= 5 ? 35 : 20;
      break;
    default:
      eligibilityScore += 25;
  }

  return eligibilityScore;
}

export default router;
