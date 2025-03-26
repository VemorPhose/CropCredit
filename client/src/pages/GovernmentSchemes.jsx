"use client";

import { useState } from "react";
import { Search, Filter, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const schemes = [
  {
    id: 1,
    name: "PM-KISAN",
    description:
      "Pradhan Mantri Kisan Samman Nidhi provides income support of ₹6,000 per year to all farmer families across the country in three equal installments of ₹2,000 each every four months.",
    eligibility: "All farmer families with cultivable land.",
    benefits: "Direct income support of ₹6,000 per year.",
    category: "Income Support",
  },
  {
    id: 2,
    name: "Kisan Credit Card",
    description:
      "The Kisan Credit Card scheme provides farmers with affordable credit for their agricultural needs and other requirements.",
    eligibility:
      "All farmers, tenant farmers, sharecroppers, and self-help groups.",
    benefits: "Short-term loans for cultivation at favorable interest rates.",
    category: "Credit",
  },
  {
    id: 3,
    name: "Soil Health Card",
    description:
      "The Soil Health Card scheme assesses the current status of soil health and recommends appropriate nutrients and fertilizers.",
    eligibility: "All farmers with agricultural land.",
    benefits:
      "Soil nutrient status and recommendations for improving soil health.",
    category: "Technical Support",
  },
  {
    id: 4,
    name: "Pradhan Mantri Fasal Bima Yojana",
    description:
      "A crop insurance scheme that provides financial support to farmers suffering crop loss or damage due to unforeseen events.",
    eligibility: "Farmers growing notified crops in notified areas.",
    benefits:
      "Insurance coverage and financial support in case of crop failure.",
    category: "Insurance",
  },
  {
    id: 5,
    name: "National Mission for Sustainable Agriculture",
    description:
      "Promotes sustainable agriculture through climate change adaptation measures, water use efficiency, and soil health management.",
    eligibility: "Farmers willing to adopt sustainable agricultural practices.",
    benefits:
      "Technical and financial assistance for sustainable farming practices.",
    category: "Sustainable Farming",
  },
  {
    id: 6,
    name: "Agriculture Infrastructure Fund",
    description:
      "Financing facility for investment in post-harvest management infrastructure and community farming assets.",
    eligibility:
      "Farmers, FPOs, PACS, Marketing Cooperative Societies, and Startups.",
    benefits:
      "Interest subvention and credit guarantee for post-harvest infrastructure.",
    category: "Infrastructure",
  },
];

const GovernmentSchemes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = [
    "All",
    "Income Support",
    "Credit",
    "Technical Support",
    "Insurance",
    "Sustainable Farming",
    "Infrastructure",
  ];

  const filteredSchemes = schemes.filter(
    (scheme) =>
      (scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "" ||
        selectedCategory === "All" ||
        scheme.category === selectedCategory)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Government Schemes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Discover government schemes and subsidies available for farmers
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search schemes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Schemes List */}
      <div className="grid gap-6">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {scheme.name}
                </h2>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  {scheme.category}
                </span>
              </div>
              <Link
                to={`/government-schemes/${scheme.id}`}
                className="mt-4 md:mt-0 text-green-600 dark:text-green-400 hover:underline font-medium flex items-center gap-1"
              >
                View Details <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {scheme.description}
            </p>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Eligibility
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {scheme.eligibility}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Benefits
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {scheme.benefits}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No schemes found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSchemes;
