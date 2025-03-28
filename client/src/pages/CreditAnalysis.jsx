"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const CreditAnalysis = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setAnalysisResult({
        creditScore: 720,
        loanEligibility: {
          maxAmount: "₹5,00,000",
          interestRate: "7.5%",
          term: "Up to 5 years",
          status: "Pre-approved",
        },
        riskFactors: [
          {
            factor: "Crop Diversification",
            status: "Good",
            description: "Growing multiple crops reduces risk",
          },
          {
            factor: "Irrigation Access",
            status: "Good",
            description: "Reliable irrigation source available",
          },
          {
            factor: "Repayment History",
            status: "Excellent",
            description: "Consistent repayment of previous loans",
          },
          {
            factor: "Income Stability",
            status: "Medium",
            description: "Income fluctuations observed in past seasons",
          },
        ],
        eligibleSchemes: [
          { id: 1, name: "PM-KISAN", match: "95%" },
          { id: 2, name: "Kisan Credit Card", match: "90%" },
          { id: 3, name: "Soil Health Card", match: "85%" },
        ],
      });
      setIsSubmitting(false);
    }, 2000);
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
        <div className="space-y-8">
          {/* Credit Score Card */}
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

          {/* Loan Eligibility */}
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

          {/* Risk Factors */}
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

          {/* Eligible Schemes */}
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
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium">
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditAnalysis;
