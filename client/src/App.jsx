import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import FarmerDashboard from "./pages/farmer/Dashboard";
import LenderDashboard from "./pages/lender/Dashboard";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import CreditAnalysis from "./pages/CreditAnalysis";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PrivateRoute from "./components/auth/PrivateRoute";
import NotFound from "./pages/NotFound";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <ChatBot />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/farmer-dashboard"
                element={
                  <PrivateRoute role="farmer">
                    <FarmerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/lender-dashboard"
                element={
                  <PrivateRoute role="lender">
                    <LenderDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/government-schemes"
                element={<GovernmentSchemes />}
              />
              <Route path="/credit-analysis" element={<CreditAnalysis />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
