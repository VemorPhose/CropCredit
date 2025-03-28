"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ArrowRight, BarChart3, Shield, Users } from "lucide-react";
import farmerImg from "../assets/farmer-bg.jpg";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section with Background Image */}
      <section className="relative py-16 md:py-24">
        {/* Background image with overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <img 
            src={farmerImg} 
            alt="Farmer in field" 
            className="w-full h-full object-cover transition-property-[filter,opacity] transition-duration-600 transition-timing-function-[cubic-bezier(0.4,0,0.2,1)] dark:filter dark:grayscale dark:opacity-90 opacity-95" 
          />
          {/* Different overlay gradient for light/dark modes */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/55 to-gray-900/55 dark:from-gray-900/70 dark:to-gray-900/70 transition-colors duration-600 transition-timing-function-[cubic-bezier(0.4,0,0.2,1)]"></div>
        </div>
        
        {/* Content */}
        <div className="container relative mx-auto z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            AI-Driven Credit Analysis for{" "}
            <span className="text-green-400">Farmers</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
            Discover eligible government schemes and get accurate credit
            assessments to access the best financial support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link
                to={
                  user.role === "farmer"
                    ? "/farmer-dashboard"
                    : "/lender-dashboard"
                }
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-white/90 hover:bg-white text-green-600 border border-green-600 px-6 py-3 rounded-md font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How CropCredit helps
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <BarChart3
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                AI Credit Analysis
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our AI evaluates your financial details to determine
                creditworthiness, loan eligibility, and risk factors.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Shield
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Government Schemes
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Discover eligible government schemes and subsidies tailored to
                your specific farming situation.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Users
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Lender Confidence
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Banks and lenders can make informed decisions, reducing defaults
                and improving trust in agricultural credit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
            Join thousands of farmers who have improved their access to credit
            and government schemes.
          </p>
          <Link
            to="/register"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
