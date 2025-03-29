"use client";

import { useState, useRef } from "react";
import { ArrowRight, Check, AlertCircle, X, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "../hooks/useAuth";

const CreditAnalysis = () => {
  const { user } = useAuth();
  const printRef = useRef(null);
  const [formData, setFormData] = useState({
    landHolding: "",
    cropType: "",
    annualIncome: "",
    existingLoans: "",
    repaymentHistory: "",
    cropYield: "",
    irrigationSource: "",
    farmingExperience: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/credit/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze credit");
      }

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      // Transform Python result to match frontend format
      setAnalysisResult({
        creditScore: result.score,
        loanEligibility: {
          maxAmount:
            result.score >= 750
              ? "₹10,00,000"
              : result.score >= 650
              ? "₹7,50,000"
              : result.score >= 550
              ? "₹5,00,000"
              : "₹2,50,000",
          interestRate:
            result.score >= 750
              ? "8%"
              : result.score >= 650
              ? "10%"
              : result.score >= 550
              ? "12%"
              : "14%",
          term: "12 months",
          status: result.score >= 550 ? "Eligible" : "Limited Options",
        },
        riskFactors: [
          {
            factor: "Land Holding",
            status: result.details.landHolding >= 5 ? "Good" : "Medium",
            description: `You have ${result.details.landHolding} acres of land`,
          },
          {
            factor: "Farming Experience",
            status: result.details.farmingExperience >= 5 ? "Good" : "Medium",
            description: `${result.details.farmingExperience} years of farming experience`,
          },
          {
            factor: "Repayment History",
            status:
              result.details.repaymentHistory === "excellent"
                ? "Excellent"
                : result.details.repaymentHistory === "good"
                ? "Good"
                : "Medium",
            description: "Based on past loan repayment records",
          },
          {
            factor: "Income Stability",
            status: result.details.annualIncome >= 500000 ? "Good" : "Medium",
            description: "Based on annual income and crop yield",
          },
        ],
        eligibleSchemes:
          result.eligibleSchemes?.map((scheme) => ({
            id: scheme.scheme_id || scheme.government_schemes?.id,
            name: scheme.name || scheme.government_schemes?.name,
            description:
              scheme.description || scheme.government_schemes?.description,
            match:
              typeof scheme.eligibility_score === "number"
                ? `${Math.round(scheme.eligibility_score)}%`
                : scheme.match || "N/A",
          })) || [],
      });
    } catch (error) {
      console.error("Credit analysis error:", error);
      setError(error.message || "Failed to analyze credit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !analysisResult) return;

    setIsDownloading(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#1F2937"
          : "#FFFFFF",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");

      // Add CropCredit letterhead
      pdf.setFontSize(20);
      pdf.setTextColor(22, 163, 74); // green-600
      pdf.text("CropCredit", 20, 20);

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Credit Analysis Report", 20, 30);

      const today = new Date();
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${today.toLocaleDateString()}`, 20, 38);

      if (user) {
        pdf.text(`For: ${user.name} (${user.email})`, 20, 45);
      }

      pdf.line(20, 48, 190, 48); // Add horizontal line

      // Add the captured image
      pdf.addImage(imgData, "PNG", 0, 50, imgWidth, imgHeight);

      // Add footer
      const pageCount = Math.ceil(imgHeight / pageHeight) + 1;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "This document is computer-generated and does not require a signature.",
        20,
        290
      );
      pdf.text(
        "© CropCredit - Powering agricultural finance with AI",
        105,
        290,
        { align: "center" }
      );

      pdf.save("CropCredit-Analysis-Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Credit Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter your farming and financial details to get a comprehensive credit
          analysis
        </p>
      </div>

      {/* Error message popup - Click anywhere to dismiss */}
      {showError && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowError(false)}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-10 mx-4 max-w-md w-full border border-red-200 dark:border-red-900"
            onClick={(e) => e.stopPropagation()} // Prevent clicks on the modal itself from closing it
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertCircle size={24} className="text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Agreement Required
                </h3>
              </div>
              <button
                onClick={() => setShowError(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Please agree to the terms and conditions before proceeding with
              the credit analysis.
            </p>
            <button
              onClick={() => setShowError(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium mt-2"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {!analysisResult ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="landHolding"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Land Holding (in acres)
                </label>
                <input
                  type="number"
                  id="landHolding"
                  name="landHolding"
                  value={formData.landHolding}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="cropType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Primary Crop Type
                </label>
                <select
                  id="cropType"
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="rice">Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="annualIncome"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Annual Farm Income (in ₹)
                </label>
                <input
                  type="number"
                  id="annualIncome"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="existingLoans"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Existing Loans (in ₹)
                </label>
                <input
                  type="number"
                  id="existingLoans"
                  name="existingLoans"
                  value={formData.existingLoans}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="repaymentHistory"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Loan Repayment History
                </label>
                <select
                  id="repaymentHistory"
                  name="repaymentHistory"
                  value={formData.repaymentHistory}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Select repayment history</option>
                  <option value="excellent">Excellent - Always on time</option>
                  <option value="good">Good - Mostly on time</option>
                  <option value="fair">Fair - Occasional delays</option>
                  <option value="poor">Poor - Frequent delays</option>
                  <option value="none">No previous loans</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cropYield"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Average Crop Yield (quintal per acre)
                </label>
                <input
                  type="number"
                  id="cropYield"
                  name="cropYield"
                  value={formData.cropYield}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="irrigationSource"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Irrigation Source
                </label>
                <select
                  id="irrigationSource"
                  name="irrigationSource"
                  value={formData.irrigationSource}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Select irrigation source</option>
                  <option value="canal">Canal</option>
                  <option value="tubewell">Tube Well</option>
                  <option value="rainwater">Rainwater Dependent</option>
                  <option value="pond">Farm Pond</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="farmingExperience"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Farming Experience (in years)
                </label>
                <input
                  type="number"
                  id="farmingExperience"
                  name="farmingExperience"
                  value={formData.farmingExperience}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Terms and conditions checkbox */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-green-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I agree that all the information provided is accurate to the
                  best of my knowledge, and I consent to the processing of this
                  information for credit analysis purposes. I understand that
                  providing false information may result in rejection of credit
                  applications.
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Analyzing..." : "Analyze Credit"}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8" ref={printRef}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Credit Analysis Results
            </h2>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? "Processing..." : "Download Report"}
              <Download size={18} />
            </button>
          </div>

          {/* Credit Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Credit Score
            </h3>
            <div className="flex items-center">
              <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    analysisResult.creditScore >= 750
                      ? "bg-green-500"
                      : analysisResult.creditScore >= 650
                      ? "bg-green-400"
                      : analysisResult.creditScore >= 550
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                  style={{
                    width: `${(analysisResult.creditScore / 900) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">
                {analysisResult.creditScore}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-red-500">Poor</span>
              <span className="text-yellow-500">Fair</span>
              <span className="text-green-500">Good</span>
              <span className="text-green-700">Excellent</span>
            </div>
          </div>

          {/* Loan Eligibility */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Loan Eligibility
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Maximum Loan Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysisResult.loanEligibility.maxAmount}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Interest Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysisResult.loanEligibility.interestRate}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Term
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysisResult.loanEligibility.term}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Status
                </p>
                <p
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    analysisResult.loanEligibility.status === "Eligible"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {analysisResult.loanEligibility.status}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Risk Factors
            </h3>
            <div className="space-y-4">
              {analysisResult.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full ${
                      factor.status === "Excellent"
                        ? "bg-green-100 dark:bg-green-900"
                        : factor.status === "Good"
                        ? "bg-green-100 dark:bg-green-900"
                        : factor.status === "Medium"
                        ? "bg-yellow-100 dark:bg-yellow-900"
                        : "bg-red-100 dark:bg-red-900"
                    } flex items-center justify-center mr-3`}
                  >
                    {factor.status === "Excellent" || factor.status === "Good" ? (
                      <Check
                        className={
                          factor.status === "Excellent"
                            ? "text-green-600 dark:text-green-300"
                            : "text-green-600 dark:text-green-300"
                        }
                        size={16}
                      />
                    ) : factor.status === "Medium" ? (
                      <AlertCircle
                        className="text-yellow-600 dark:text-yellow-300"
                        size={16}
                      />
                    ) : (
                      <X
                        className="text-red-600 dark:text-red-300"
                        size={16}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {factor.factor}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          factor.status === "Excellent"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : factor.status === "Good"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : factor.status === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {factor.status}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {factor.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eligible Government Schemes */}
          {analysisResult.eligibleSchemes &&
            analysisResult.eligibleSchemes.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Eligible Government Schemes
                </h3>
                <div className="space-y-4">
                  {analysisResult.eligibleSchemes.map((scheme, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {scheme.name}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {scheme.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                          Eligibility:
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {scheme.match}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default CreditAnalysis;
