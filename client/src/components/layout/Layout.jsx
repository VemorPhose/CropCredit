import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ChatBot from "../ChatBot";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Outlet />
      </main>
      
      <footer className="mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} CropCredit. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <ChatBot />
    </div>
  );
};

export default Layout;