"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Check, AlertCircle, X, Download } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CreditAnalysis = () => {
  const { user } = useAuth();
  const location = useLocation();
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
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPreviousData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/farmer/credit-analysis-data", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          if (data && data.lastAnalysis) {
            setFormData({
              landHolding: data.lastAnalysis.landHolding || "",
              cropType: data.lastAnalysis.cropType || "",
              annualIncome: data.lastAnalysis.annualIncome || "",
              existingLoans: data.lastAnalysis.existingLoans || "",
              repaymentHistory: data.lastAnalysis.repaymentHistory || "",
              cropYield: data.lastAnalysis.cropYield || "",
              irrigationSource: data.lastAnalysis.irrigationSource || "",
              farmingExperience: data.lastAnalysis.farmingExperience || "",
            });

            if (location.state?.showResults && data.lastAnalysisResult) {
              setAnalysisResult(data.lastAnalysisResult);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching previous analysis data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviousData();
  }, [user, location.state]);

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult = {
        creditScore: Math.floor(Math.random() * 300) + 550,
        loanEligibility: {
          maxAmount: `₹${(Math.floor(Math.random() * 10) + 5).toLocaleString()},00,000`,
          interestRate: `${Math.floor(Math.random() * 6) + 7}%`,
          term: "12 months",
          status: "Eligible",
        },
        riskFactors: [
          {
            factor: "Land Holding",
            status:
              parseFloat(formData.landHolding) > 5
                ? "Excellent"
                : parseFloat(formData.landHolding) > 2
                ? "Good"
                : "Medium",
            description:
              parseFloat(formData.landHolding) > 5
                ? "Your substantial land holding provides strong collateral and demonstrates agricultural capacity."
                : parseFloat(formData.landHolding) > 2
                ? "Your land holding is adequate for most agricultural credit programs."
                : "Consider strategies to increase productivity on your current land holding.",
          },
          {
            factor: "Income to Loan Ratio",
            status:
              parseFloat(formData.annualIncome) >
              parseFloat(formData.existingLoans) * 2
                ? "Excellent"
                : parseFloat(formData.annualIncome) >
                  parseFloat(formData.existingLoans)
                ? "Good"
                : "Medium",
            description:
              parseFloat(formData.annualIncome) >
              parseFloat(formData.existingLoans) * 2
                ? "Your income significantly exceeds your loan obligations, indicating strong repayment capacity."
                : parseFloat(formData.annualIncome) >
                  parseFloat(formData.existingLoans)
                ? "Your income adequately covers your existing loans."
                : "Your existing loan burden is high relative to income. Consider debt reduction strategies.",
          },
          {
            factor: "Repayment History",
            status:
              formData.repaymentHistory === "excellent"
                ? "Excellent"
                : formData.repaymentHistory === "good"
                ? "Good"
                : formData.repaymentHistory === "fair"
                ? "Medium"
                : "Poor",
            description:
              formData.repaymentHistory === "excellent" ||
              formData.repaymentHistory === "good"
                ? "Your strong repayment history demonstrates financial responsibility."
                : "Improving your repayment consistency will enhance your credit profile.",
          },
        ],
        eligibleSchemes: [
          {
            id: 1,
            name: "PM-KISAN",
            match: "98%",
          },
          {
            id: 4,
            name: "Pradhan Mantri Fasal Bima Yojana",
            match: "95%",
          },
          {
            id: 2,
            name: "Kisan Credit Card",
            match: "90%",
          },
        ],
      };

      const saveResponse = await fetch("/api/farmer/save-credit-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          analysisData: formData,
          analysisResult: mockResult,
        }),
      });

      if (!saveResponse.ok) {
        console.error("Failed to save analysis data");
      }

      setAnalysisResult(mockResult);
    } catch (error) {
      console.error("Error during credit analysis:", error);
      setError("An error occurred during analysis. Please try again.");
      setShowError(true);
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
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");

      pdf.setFontSize(20);
      pdf.setTextColor(22, 163, 74);
      pdf.text("CropCredit", 20, 20);

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Credit Analysis Report", 20, 30);

      const today = new Date();
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${today.toLocaleDateString()}`, 20, 38);

      if (user) {
        pdf.text(
          `For: ${user.name || "User"} (${user.email || "N/A"})`,
          20,
          45
        );
      }

      pdf.line(20, 48, 190, 48);

      pdf.addImage(imgData, "PNG", 0, 50, imgWidth, imgHeight);

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
      setError("Failed to generate PDF. Please try again later.");
      setShowError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-60 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
        </div>
      </div>
    );
  }

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

      {showError && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowError(false)}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-10 mx-4 max-w-md w-full border border-red-200 dark:border-red-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <AlertCircle size={24} className="text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {error || "Agreement Required"}
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
              {error ||
                "Please agree to the terms and conditions before proceeding with the credit analysis."}
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analysisResult.creditScore}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Your Credit Score
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your credit score is considered{" "}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Good
                  </span>
                  . This makes you eligible for most agricultural loan programs.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${(analysisResult.creditScore / 850) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Loan Eligibility
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Maximum Amount
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analysisResult.loanEligibility.maxAmount}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interest Rate
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analysisResult.loanEligibility.interestRate}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analysisResult.loanEligibility.term}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {analysisResult.loanEligibility.status}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Risk Assessment
            </h2>
            <div className="space-y-4">
              {analysisResult.riskFactors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      factor.status === "Excellent" || factor.status === "Good"
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        : factor.status === "Medium"
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
                        : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <Check size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {factor.factor}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          factor.status === "Excellent" ||
                          factor.status === "Good"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : factor.status === "Medium"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Recommended Government Schemes
            </h2>
            <div className="space-y-4">
              {analysisResult.eligibleSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                      {scheme.match}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {scheme.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Match: {scheme.match}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/government-schemes/${scheme.id}`}
                    className="text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-1"
                  >
                    View Details <ArrowRight size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setAnalysisResult(null)}
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-md font-medium"
            >
              Edit Information
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditAnalysis;
