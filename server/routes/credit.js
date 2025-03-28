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
      console.error("Python error:", data.toString());
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

        // Store credit evaluation in database
        const { data: evaluation, error: dbError } = await supabase
          .from("credit_evaluations")
          .insert({
            user_id: userId,
            credit_score: analysisResult.score,
            risk_factors: analysisResult.riskFactors,
            loan_eligibility: analysisResult.loanEligibility,
            input_data: formData,
            algorithm_version: "1.0",
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Update farmer profile with new credit score
        const { error: updateError } = await supabase
          .from("farmer_profiles")
          .update({ credit_score: analysisResult.score })
          .eq("user_id", userId);

        if (updateError) throw updateError;

        res.json(analysisResult);
      } catch (e) {
        console.error("Database error:", e);
        res
          .status(500)
          .json({ error: "Failed to store credit analysis results" });
      }
    });
  } catch (error) {
    console.error("Credit analysis error:", error);
    res.status(500).json({ error: "Failed to process credit analysis" });
  }
});

export default router;
