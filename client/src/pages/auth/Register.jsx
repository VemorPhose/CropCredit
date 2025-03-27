"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Add user details to database immediately
      const { error: createError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: formData.email,
          name: formData.name,
          role: formData.role,
        },
      ]);

      if (createError) throw createError;

      // Create role-specific profile
      if (formData.role === "farmer") {
        await supabase
          .from("farmer_profiles")
          .insert([{ user_id: data.user.id }]);
      } else if (formData.role === "lender") {
        await supabase
          .from("lender_profiles")
          .insert([{ user_id: data.user.id }]);
      }

      // Show success message
      alert(
        "Registration successful! Please check your email for confirmation link."
      );
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center py-12">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create an account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join CropCredit to access financial support
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center p-3 border rounded-md cursor-pointer ${
                  formData.role === "farmer"
                    ? "border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="farmer"
                  checked={formData.role === "farmer"}
                  onChange={handleChange}
                  className="sr-only"
                />
                Farmer
              </label>
              <label
                className={`flex items-center justify-center p-3 border rounded-md cursor-pointer ${
                  formData.role === "lender"
                    ? "border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="lender"
                  checked={formData.role === "lender"}
                  onChange={handleChange}
                  className="sr-only"
                />
                Lender
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 dark:text-green-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
