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

// Get current credit analysis data (most recent)
router.get("/api/farmer/credit-analysis-data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the most recent credit analysis
    const { data: latestAnalysis, error: analysisError } = await supabase
      .from("credit_evaluations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (analysisError && analysisError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      throw analysisError;
    }

    if (!latestAnalysis) {
      return res.json({ 
        lastAnalysis: null, 
        lastAnalysisResult: null 
      });
    }

    // Format response
    const responseData = {
      lastAnalysis: latestAnalysis.input_data,
      lastAnalysisResult: {
        creditScore: latestAnalysis.credit_score,
        riskFactors: latestAnalysis.risk_factors,
        loanEligibility: latestAnalysis.loan_eligibility,
      }
    };

    // Fetch eligible schemes if we have a farmer profile
    let { data: farmerProfile, error: profileError } = await supabase
      .from("farmer_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profileError && farmerProfile) {
      // Get scheme eligibility
      const { data: eligibility, error: eligibilityError } = await supabase
        .from("farmer_scheme_eligibility")
        .select("scheme_id, eligibility_score")
        .eq("farmer_id", farmerProfile.id);

      if (!eligibilityError && eligibility.length > 0) {
        // Get the actual schemes
        const { data: schemes, error: schemesError } = await supabase
          .from("government_schemes")
          .select("*")
          .in("id", eligibility.map(e => e.scheme_id));

        if (!schemesError && schemes.length > 0) {
          // Add schemes to the response
          responseData.lastAnalysisResult.eligibleSchemes = schemes.map(scheme => ({
            id: scheme.id,
            name: scheme.name,
            match: `${eligibility.find(e => e.scheme_id === scheme.id)?.eligibility_score || 0}%`
          })).sort((a, b) => parseInt(b.match) - parseInt(a.match)).slice(0, 3);
        }
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching credit analysis data:", error);
    res.status(500).json({ error: "Failed to fetch credit analysis data" });
  }
});

// Save credit analysis results
router.post("/api/farmer/save-credit-analysis", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { analysisData, analysisResult } = req.body;

    // Get or create farmer profile
    let { data: farmerProfile, error: profileError } = await supabase
      .from("farmer_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') { // No rows found
      // Create farmer profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("farmer_profiles")
        .insert({
          user_id: userId,
          land_holding: analysisData.landHolding,
          primary_crop: analysisData.cropType,
          annual_income: analysisData.annualIncome,
          farming_experience: analysisData.farmingExperience,
          irrigation_source: analysisData.irrigationSource,
          credit_score: analysisResult.creditScore
        })
        .select()
        .single();

      if (createError) throw createError;
      farmerProfile = newProfile;
    } else if (profileError) {
      throw profileError;
    } else {
      // Update existing farmer profile
      const { error: updateError } = await supabase
        .from("farmer_profiles")
        .update({ 
          credit_score: analysisResult.creditScore,
          land_holding: analysisData.landHolding,
          primary_crop: analysisData.cropType,
          annual_income: analysisData.annualIncome,
          farming_experience: analysisData.farmingExperience,
          irrigation_source: analysisData.irrigationSource
        })
        .eq("id", farmerProfile.id);

      if (updateError) throw updateError;
    }

    // Store credit evaluation
    const { data: evaluation, error: evalError } = await supabase
      .from("credit_evaluations")
      .insert({
        user_id: userId,
        credit_score: analysisResult.creditScore,
        algorithm_version: "v1.0",
        input_data: analysisData,
        result_data: analysisResult
      })
      .select()
      .single();

    if (evalError) throw evalError;

    // Calculate eligibility for government schemes
    // Get all government schemes
    const { data: schemes, error: schemesError } = await supabase
      .from("government_schemes")
      .select("*");

    if (schemesError) throw schemesError;

    // Calculate eligibility for each scheme using helper function
    const schemeEligibility = schemes.map(scheme => ({
      farmer_id: farmerProfile.id,
      scheme_id: scheme.id,
      eligibility_score: calculateSchemeEligibility({
        score: analysisResult.creditScore,
        details: analysisData
      }, scheme),
      status: "eligible"
    }));

    // Update scheme eligibility
    const { error: eligibilityError } = await supabase
      .from("farmer_scheme_eligibility")
      .upsert(schemeEligibility, {
        onConflict: "farmer_id,scheme_id",
        returning: true
      });

    if (eligibilityError) throw eligibilityError;

    // Get farmer's recent activities for dashboard
    const { error: activityError } = await supabase
      .from("farmer_activities") // Assuming you have this table
      .insert({
        user_id: userId,
        title: "Credit Analysis Completed",
        description: `You received a credit score of ${analysisResult.creditScore}.`,
        activity_type: "credit_analysis"
      });

    // Don't throw on activity error - it's not critical
    if (activityError) {
      console.error("Failed to log activity:", activityError);
    }

    res.json({ success: true, evaluationId: evaluation.id });
  } catch (error) {
    console.error("Error saving credit analysis:", error);
    res.status(500).json({ error: "Failed to save credit analysis" });
  }
});

// Fetch dashboard data for farmers
router.get("/api/farmer/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get farmer profile
    const { data: profile, error: profileError } = await supabase
      .from("farmer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Get latest credit evaluation if any
    const { data: creditEval, error: creditError } = await supabase
      .from("credit_evaluations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (creditError && creditError.code !== 'PGRST116') {
      throw creditError;
    }

    // Get eligible schemes for the farmer
    let eligibleSchemes = [];
    if (profile) {
      const { data: eligibility, error: eligibilityError } = await supabase
        .from("farmer_scheme_eligibility")
        .select("scheme_id, eligibility_score")
        .eq("farmer_id", profile.id)
        .order("eligibility_score", { ascending: false })
        .limit(5);

      if (!eligibilityError && eligibility.length > 0) {
        const { data: schemes, error: schemesError } = await supabase
          .from("government_schemes")
          .select("*")
          .in("id", eligibility.map(e => e.scheme_id));

        if (!schemesError && schemes.length > 0) {
          eligibleSchemes = schemes.map(scheme => ({
            id: scheme.id,
            name: scheme.name,
            description: scheme.description,
            eligibility: eligibility.find(e => e.scheme_id === scheme.id)?.eligibility_score >= 70 
              ? "High" 
              : "Medium"
          }));
        }
      }
    }

    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from("farmer_activities") // Assuming you have this table
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (activitiesError && activitiesError.code !== 'PGRST116') {
      throw activitiesError;
    }

    // Calculate loan eligibility based on credit score
    const creditScore = profile?.credit_score || 0;
    const loanEligibility = {
      maxAmount: creditScore >= 750 
        ? "₹10,00,000" 
        : creditScore >= 650 
        ? "₹7,50,000" 
        : creditScore >= 550 
        ? "₹5,00,000" 
        : "₹2,50,000",
      interestRate: creditScore >= 750 
        ? "8%" 
        : creditScore >= 650 
        ? "10%" 
        : creditScore >= 550 
        ? "12%" 
        : "14%",
      term: "12 months",
      status: creditScore >= 550 ? "Eligible" : "Limited Options"
    };

    // Return dashboard data
    res.json({
      profile,
      creditScore: profile?.credit_score || 0,
      loanEligibility,
      eligibleSchemes,
      recentActivity: activities || [],
      lastCreditEvaluation: creditEval?.result_data || null
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

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
            result_data: analysisResult
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
