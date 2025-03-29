"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ArrowRight, FileText, PieChart, Tractor } from "lucide-react";
import { Link } from "react-router-dom";

const getCreditScoreRating = (score) => {
  if (score === 0) return { text: "Not Available", color: "gray" };
  if (score >= 750) return { text: "Excellent", color: "green" };
  if (score >= 650) return { text: "Good", color: "blue" };
  if (score >= 550) return { text: "Fair", color: "yellow" };
  return { text: "Poor", color: "red" };
};

const getCreditScoreMessage = (score) => {
  if (score === 0) {
    return "No credit score evaluation found. Complete your credit analysis to get your score.";
  }
  if (score >= 750) {
    return "This makes you eligible for premium agricultural loan programs with best interest rates.";
  }
  if (score >= 650) {
    return "This makes you eligible for most agricultural loan programs with competitive rates.";
  }
  if (score >= 550) {
    return "You are eligible for some agricultural loan programs. Improving your score will unlock better rates.";
  }
  return "You may face limited loan options. Consider improving your credit score through regular repayments.";
};

const calculateLoanEligibility = (creditScore) => {
  return {
    maxAmount:
      creditScore >= 750
        ? "₹10,00,000"
        : creditScore >= 650
        ? "₹7,50,000"
        : creditScore >= 550
        ? "₹5,00,000"
        : "₹2,50,000",
    interestRate:
      creditScore >= 750
        ? "8%"
        : creditScore >= 650
        ? "10%"
        : creditScore >= 550
        ? "12%"
        : "14%",
    term: "12 months",
    status: creditScore >= 550 ? "Eligible" : "Limited Options",
  };
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    creditScore: 0,
    eligibleSchemes: [],
    loanEligibility: {
      maxAmount: "₹0",
      interestRate: "0%",
      term: "0 months",
      status: "Not Available",
    },
    recentActivity: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/farmer/dashboard", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();

        // Calculate loan eligibility based on credit score
        const creditScore = data.profile?.credit_score || 0;
        const loanEligibility = calculateLoanEligibility(creditScore);

        setDashboardData({
          creditScore: creditScore,
          eligibleSchemes: data.eligibleSchemes || [],
          loanEligibility: loanEligibility,
          recentActivity: data.recentActivity || [],
        });
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Farmer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}
          </p>
        </div>
        <Link
          to="/credit-analysis"
          className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
        >
          Update Financial Details <ArrowRight size={16} />
        </Link>
      </div>

      {/* Credit Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center
              ${
                dashboardData.creditScore === 0
                  ? "bg-gray-100 dark:bg-gray-900"
                  : "bg-green-100 dark:bg-green-900"
              }`}
          >
            <span
              className={`text-3xl font-bold
                ${
                  dashboardData.creditScore === 0
                    ? "text-gray-600 dark:text-gray-400"
                    : "text-green-600 dark:text-green-400"
                }`}
            >
              {dashboardData.creditScore}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Your Credit Score
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {dashboardData.creditScore === 0 ? (
                <>
                  Credit score is{" "}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Not Available
                  </span>
                  . Complete your credit analysis to get your score.
                </>
              ) : (
                <>
                  Your credit score is considered{" "}
                  <span
                    className={`font-medium ${
                      getCreditScoreRating(dashboardData.creditScore).color ===
                      "green"
                        ? "text-green-600 dark:text-green-400"
                        : getCreditScoreRating(dashboardData.creditScore)
                            .color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : getCreditScoreRating(dashboardData.creditScore)
                            .color === "yellow"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {getCreditScoreRating(dashboardData.creditScore).text}
                  </span>
                  . {getCreditScoreMessage(dashboardData.creditScore)}
                </>
              )}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  dashboardData.creditScore === 0
                    ? "bg-gray-400"
                    : dashboardData.creditScore >= 750
                    ? "bg-green-600"
                    : dashboardData.creditScore >= 650
                    ? "bg-blue-600"
                    : dashboardData.creditScore >= 550
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
                style={{
                  width:
                    dashboardData.creditScore === 0
                      ? "0%"
                      : `${(dashboardData.creditScore / 850) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Poor
                <br />
                (Below 550)
              </span>
              <span>
                Fair
                <br />
                (550-649)
              </span>
              <span>
                Good
                <br />
                (650-749)
              </span>
              <span>
                Excellent
                <br />
                (750+)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Eligibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="text-green-600 dark:text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loan Eligibility
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Maximum Amount
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {dashboardData.loanEligibility.maxAmount}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interest Rate
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {dashboardData.loanEligibility.interestRate}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {dashboardData.loanEligibility.term}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {dashboardData.loanEligibility.status}
            </p>
          </div>
        </div>
        <div className="mt-4 text-right">
          <Link
            to="/credit-analysis"
            className="text-green-600 dark:text-green-400 hover:underline font-medium"
          >
            View detailed analysis
          </Link>
        </div>
      </div>

      {/* Eligible Government Schemes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Tractor className="text-green-600 dark:text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Eligible Government Schemes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Scheme Name
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Description
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Eligibility
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.eligibleSchemes.map((scheme) => (
                <tr
                  key={scheme.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {scheme.name}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {scheme.description}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        scheme.eligibility === "High"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                      }`}
                    >
                      {scheme.eligibility}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/government-schemes/${scheme.id}`}
                      className="text-green-600 dark:text-green-400 hover:underline font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link
            to="/government-schemes"
            className="text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-1 justify-end"
          >
            View all schemes <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-green-600 dark:text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="space-y-4">
          {dashboardData.recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2"></div>
              <div>
                <p className="text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(activity.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
