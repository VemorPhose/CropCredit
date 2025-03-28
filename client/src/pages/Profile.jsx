"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Save, User, MapPin, Mail, AlertCircle, Building2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form data matches database schema exactly
  const [formData, setFormData] = useState({
    // From users table
    name: "",
    email: "",

    // From farmer_profiles table
    land_holding: "",
    primary_crop: "",
    annual_income: "",
    farming_experience: "",
    location: "",
    irrigation_source: "",
    credit_score: "",

    // From lender_profiles table
    institution_name: "",
    institution_type: "",
    // location: "",
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First set basic user data
        setFormData((prev) => ({
          ...prev,
          name: user?.name || "",
          email: user?.email || "",
        }));

        // Fetch role-specific profile
        const { data: profileData, error: profileError } = await fetch(
          `/api/profile/${user.id}`,
          {
            credentials: "include",
          }
        ).then((res) => res.json());

        if (profileError) throw profileError;

        if (profileData) {
          setProfile(profileData);
          setFormData((prev) => ({
            ...prev,
            ...profileData,
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user: {
            name: formData.name,
            email: formData.email,
          },
          profile:
            user.role === "farmer"
              ? {
                  land_holding: formData.land_holding || null,
                  primary_crop: formData.primary_crop || null,
                  annual_income: formData.annual_income || null,
                  farming_experience: formData.farming_experience || null,
                  location: formData.location || null,
                  irrigation_source: formData.irrigation_source || null,
                }
              : {
                  institution_name: formData.institution_name || null,
                  institution_type: formData.institution_type || null,
                  location: formData.location || null,
                },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setProfile(data.data);
      setFormData((prev) => ({
        ...prev,
        ...data.data,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your profile information
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Basic Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                {user?.role === "farmer" ? (
                  <User size={40} />
                ) : (
                  <Building2 size={40} />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {formData.name || "Not Set"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.role === "farmer" ? "Farmer" : "Lender"}
              </p>

              {user?.role === "farmer" && formData.credit_score && (
                <div className="mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Credit Score: {formData.credit_score}
                  </p>
                </div>
              )}

              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail
                    className="text-gray-500 dark:text-gray-400"
                    size={18}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formData.email || "Not Set"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin
                    className="text-gray-500 dark:text-gray-400"
                    size={18}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formData.location || "Not Set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile ? "Profile Information" : "Complete Your Profile"}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
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
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Role Specific Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {user?.role === "farmer"
                    ? "Farm Information"
                    : "Institution Information"}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {user?.role === "farmer" ? (
                    <>
                      <div>
                        <label
                          htmlFor="land_holding"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Land Holding (acres)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          id="land_holding"
                          name="land_holding"
                          value={formData.land_holding}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="primary_crop"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Primary Crop
                        </label>
                        <input
                          type="text"
                          id="primary_crop"
                          name="primary_crop"
                          value={formData.primary_crop}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="annual_income"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Annual Income (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          id="annual_income"
                          name="annual_income"
                          value={formData.annual_income}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="farming_experience"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Farming Experience (years)
                        </label>
                        <input
                          type="number"
                          id="farming_experience"
                          name="farming_experience"
                          value={formData.farming_experience}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="irrigation_source"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Irrigation Source
                        </label>
                        <select
                          id="irrigation_source"
                          name="irrigation_source"
                          value={formData.irrigation_source}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Source</option>
                          <option value="canal">Canal</option>
                          <option value="tubewell">Tube Well</option>
                          <option value="rainwater">Rainwater Dependent</option>
                          <option value="pond">Farm Pond</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="institution_name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Institution Name
                        </label>
                        <input
                          type="text"
                          id="institution_name"
                          name="institution_name"
                          value={formData.institution_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="institution_type"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Institution Type
                        </label>
                        <select
                          id="institution_type"
                          name="institution_type"
                          value={formData.institution_type}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Type</option>
                          <option value="bank">Bank</option>
                          <option value="nbfc">NBFC</option>
                          <option value="microfinance">Microfinance</option>
                          <option value="cooperative">Cooperative</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Location Field (Common) */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Location Information
                </h3>
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
