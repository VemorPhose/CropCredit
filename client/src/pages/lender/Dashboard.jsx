"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { FileText, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

const LenderDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [farmers, setFarmers] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      location: "Punjab",
      creditScore: 720,
      loanAmount: "₹3,50,000",
      riskLevel: "Low",
      status: "Approved",
    },
    {
      id: 2,
      name: "Anita Sharma",
      location: "Haryana",
      creditScore: 680,
      loanAmount: "₹2,00,000",
      riskLevel: "Medium",
      status: "Pending",
    },
    {
      id: 3,
      name: "Suresh Patel",
      location: "Gujarat",
      creditScore: 750,
      loanAmount: "₹5,00,000",
      riskLevel: "Low",
      status: "Approved",
    },
    {
      id: 4,
      name: "Meena Devi",
      location: "Uttar Pradesh",
      creditScore: 620,
      loanAmount: "₹1,50,000",
      riskLevel: "High",
      status: "Review",
    },
    {
      id: 5,
      name: "Prakash Singh",
      location: "Madhya Pradesh",
      creditScore: 700,
      loanAmount: "₹2,75,000",
      riskLevel: "Medium",
      status: "Pending",
    },
  ]);

  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lender Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Farmers
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            125
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ↑ 12% from last month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <FileText
                className="text-green-600 dark:text-green-400"
                size={20}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Loan Applications
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">42</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ↑ 8% from last month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <FileText
                className="text-green-600 dark:text-green-400"
                size={20}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Approved Loans
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">28</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ↑ 15% from last month
          </p>
        </div>
      </div>

      {/* Farmer Applications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-green-600 dark:text-green-400" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Farmer Applications
            </h2>
          </div>
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search farmers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Farmer Name
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Location
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Credit Score
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Loan Amount
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Risk Level
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-gray-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map((farmer) => (
                <tr
                  key={farmer.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {farmer.name}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {farmer.location}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {farmer.creditScore}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {farmer.loanAmount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        farmer.riskLevel === "Low"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : farmer.riskLevel === "Medium"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {farmer.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        farmer.status === "Approved"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : farmer.status === "Pending"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {farmer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/farmer/${farmer.id}`}
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
      </div>
    </div>
  );
};

export default LenderDashboard;
