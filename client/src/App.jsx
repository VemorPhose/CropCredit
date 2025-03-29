import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login"; // Updated path
import Register from "./pages/auth/Register"; // Updated path
import GovernmentSchemes from "./pages/GovernmentSchemes";
import SchemeDetails from "./pages/SchemeDetails";
import CreditAnalysis from "./pages/CreditAnalysis";
import Profile from "./pages/Profile";
import FarmerDashboard from "./pages/farmer/Dashboard"; // Updated path
import LenderDashboard from "./pages/lender/Dashboard"; // Updated path
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="government-schemes" element={<GovernmentSchemes />} />
              <Route path="government-schemes/:id" element={<SchemeDetails />} />
              <Route path="credit-analysis" element={<CreditAnalysis />} />
              <Route path="profile" element={<Profile />} />
              <Route path="farmer-dashboard" element={<FarmerDashboard />} />
              <Route path="lender-dashboard" element={<LenderDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
