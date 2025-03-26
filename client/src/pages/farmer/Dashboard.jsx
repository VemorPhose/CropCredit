"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ArrowRight, FileText, PieChart, Tractor } from "lucide-react";
import { Link } from "react-router-dom";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [creditScore, setCreditScore] = useState(720);
  const [eligibleSchemes, setEligibleSchemes] = useState([
    {
      id: 1,
      name: "PM-KISAN",
      description: "Income support of ₹6,000 per year",
      eligibility: "High",
    },
    {
      id: 2,
      name: "Kisan Credit Card",
      description: "Short-term credit for cultivation",
      eligibility: "Medium",
    },
    {
      id: 3,
      name: "Soil Health Card",
      description: "Soil nutrient status and recommendations",
      eligibility: "High",
    },
  ]);
  const [loanEligibility, setLoanEligibility] = useState({
    maxAmount: "₹5,00,000",
    interestRate: "7.5%",
    term: "Up to 5 years",
    status: "Pre-approved",
  });

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
          <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {creditScore}
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
                style={{ width: `${(creditScore / 850) * 100}%` }}
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
              {loanEligibility.maxAmount}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interest Rate
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {loanEligibility.interestRate}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {loanEligibility.term}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {loanEligibility.status}
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
              {eligibleSchemes.map((scheme) => (
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
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2"></div>
            <div>
              <p className="text-gray-900 dark:text-white">
                Credit score updated
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your credit score was updated to 720
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                2 days ago
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2"></div>
            <div>
              <p className="text-gray-900 dark:text-white">
                New scheme recommendation
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You are eligible for PM-KISAN scheme
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                5 days ago
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 mt-2"></div>
            <div>
              <p className="text-gray-900 dark:text-white">
                Financial details updated
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You updated your crop yield information
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                1 week ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
