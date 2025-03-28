"use client";

import { useState } from "react";
import { Search, Filter, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Calculate pagination values
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const indexOfLastScheme = currentPage * itemsPerPage;
  const indexOfFirstScheme = indexOfLastScheme - itemsPerPage;
  const currentSchemes = filteredSchemes.slice(indexOfFirstScheme, indexOfLastScheme);

  // Handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the schemes list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to first page when filters change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

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
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            value={selectedCategory}
            onChange={handleCategoryChange}
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
        {currentSchemes.map((scheme) => (
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

      {/* Pagination */}
      {filteredSchemes.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md 
                ${currentPage === 1 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' 
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md
                ${currentPage === totalPages 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' 
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstScheme + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastScheme, filteredSchemes.length)}
                </span>{" "}
                of <span className="font-medium">{filteredSchemes.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium
                    ${currentPage === 1 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium
                      ${currentPage === page
                        ? 'z-10 bg-green-50 dark:bg-green-900 border-green-500 dark:border-green-600 text-green-600 dark:text-green-200'
                        : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium
                    ${currentPage === totalPages 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' 
                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentSchemes;
