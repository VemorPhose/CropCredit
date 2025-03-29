"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Download, CheckCircle2, Info, Calendar, Users, Tag } from "lucide-react";

const SchemeDetails = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll simulate fetching by filtering the schemes array
    const fetchScheme = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // These would normally come from your API
        const schemes = [
          {
            id: 1,
            name: "PM-KISAN",
            description: "Pradhan Mantri Kisan Samman Nidhi provides income support of ₹6,000 per year to all farmer families across the country in three equal installments of ₹2,000 each every four months.",
            eligibility: "All farmer families with cultivable land.",
            benefits: "Direct income support of ₹6,000 per year.",
            category: "Income Support",
            detailedDescription: "The PM-KISAN scheme was launched on February 24, 2019, to provide income support to all land-holding farmers' families in the country. Under this scheme, the Central Government provides financial benefit of Rs. 6,000/- per year to eligible farmer families, payable in three equal installments of Rs. 2,000/- each every four months. The fund is directly transferred to the bank accounts of the beneficiaries.",
            applicationProcess: [
              "Register with the local agriculture office with your land documents",
              "Complete the application form with personal and bank details",
              "Submit the form with required supporting documents",
              "Verification will be conducted by local officials",
              "Once approved, benefits will be directly transferred to your bank account"
            ],
            requiredDocuments: [
              "Aadhaar Card",
              "Land Records (Khatauni/Khata/Khewat/Khasra)",
              "Bank Account Details with IFSC Code",
              "Recent Passport Sized Photograph"
            ],
            contactInfo: {
              helpline: "1800-11-0001",
              email: "pmkisan-ict@gov.in",
              website: "https://pmkisan.gov.in"
            },
            timeline: "Applications are processed on a rolling basis. Once verified, farmers typically receive the next installment in the upcoming payment cycle.",
            additionalResources: "Farmers can check their application status on the PM-KISAN portal or through the mobile app."
          },
          {
            id: 2,
            name: "Kisan Credit Card",
            description: "The Kisan Credit Card scheme provides farmers with affordable credit for their agricultural needs and other requirements.",
            eligibility: "All farmers, tenant farmers, sharecroppers, and self-help groups.",
            benefits: "Short-term loans for cultivation at favorable interest rates.",
            category: "Credit",
            detailedDescription: "The Kisan Credit Card (KCC) scheme was introduced in 1998 to provide adequate and timely credit to farmers for their agricultural operations. The scheme aims to meet the short-term credit requirements for cultivation of crops, post-harvest expenses, produce marketing, maintenance of farm assets, and activities allied to agriculture like dairy, fishery, etc.",
            applicationProcess: [
              "Approach your nearest bank branch or Primary Agricultural Credit Society (PACS)",
              "Fill out the KCC application form",
              "Submit the form with necessary documents",
              "Bank officials will verify your details and land records",
              "Once approved, your KCC will be issued with a specified credit limit"
            ],
            requiredDocuments: [
              "Proof of Identity (Aadhaar/Voter ID/Driving License)",
              "Proof of Land Ownership or Tenancy Agreement",
              "Passport Sized Photographs",
              "Bank Account Details"
            ],
            contactInfo: {
              helpline: "1800-180-1111",
              email: "info.kcc@nabard.org",
              website: "https://www.nabard.org/content.aspx?id=491"
            },
            timeline: "KCC applications are typically processed within 2-4 weeks from submission.",
            additionalResources: "The interest rate for KCC is typically 7% per annum, with interest subvention making the effective rate even lower for timely repayment."
          },
          // Add more schemes as needed - you should have all 6 schemes from your data
          {
            id: 3,
            name: "Soil Health Card",
            description: "The Soil Health Card scheme assesses the current status of soil health and recommends appropriate nutrients and fertilizers.",
            eligibility: "All farmers with agricultural land.",
            benefits: "Soil nutrient status and recommendations for improving soil health.",
            category: "Technical Support",
            detailedDescription: "The Soil Health Card (SHC) scheme was launched in February 2015 to assess the soil fertility status and provide recommendations on nutrients and fertilizers required for individual farms. This helps farmers improve productivity through judicious use of inputs, leading to better yields and reduced costs.",
            applicationProcess: [
              "Contact your local Krishi Vigyan Kendra or agricultural department office",
              "Register your farm details and request soil testing",
              "Officials will collect soil samples from your farm",
              "Samples are analyzed in soil testing laboratories",
              "Receive your Soil Health Card with customized recommendations"
            ],
            requiredDocuments: [
              "Land ownership documents or tenancy agreement",
              "Farmer identity proof",
              "Contact information"
            ],
            contactInfo: {
              helpline: "1800-180-1551",
              email: "soilhealth@gov.in",
              website: "https://soilhealth.dac.gov.in"
            },
            timeline: "Soil testing and card generation typically takes 3-4 weeks after sample collection.",
            additionalResources: "Soil Health Cards are renewed every 3 years. Farmers should follow the recommended doses for optimal results."
          },
          {
            id: 4,
            name: "Pradhan Mantri Fasal Bima Yojana",
            description: "A crop insurance scheme that provides financial support to farmers suffering crop loss or damage due to unforeseen events.",
            eligibility: "Farmers growing notified crops in notified areas.",
            benefits: "Insurance coverage and financial support in case of crop failure.",
            category: "Insurance",
            detailedDescription: "Pradhan Mantri Fasal Bima Yojana (PMFBY) is a crop insurance scheme launched in 2016 to provide comprehensive insurance coverage against crop failure. It aims to stabilize farmers' income and ensure they continue farming even after crop failures due to natural calamities, pests, or diseases.",
            applicationProcess: [
              "Approach your nearest bank, insurance company, or Common Service Center",
              "Fill out the application form for the relevant crop season",
              "Pay the applicable premium",
              "Ensure your crop is sown in the notified area",
              "In case of crop damage, report to the insurance company within 72 hours"
            ],
            requiredDocuments: [
              "Land records or tenancy agreement",
              "Proof of Identity",
              "Bank account details",
              "Recent photograph",
              "Sowing certificate (if applicable)"
            ],
            contactInfo: {
              helpline: "1800-11-0511",
              email: "pmfby@gov.in",
              website: "https://pmfby.gov.in"
            },
            timeline: "Applications must be submitted within the notified time period for each crop season. Claims are typically settled within 60 days of harvest.",
            additionalResources: "Premium rates: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops."
          },
          {
            id: 5,
            name: "National Mission for Sustainable Agriculture",
            description: "Promotes sustainable agriculture through climate change adaptation measures, water use efficiency, and soil health management.",
            eligibility: "Farmers willing to adopt sustainable agricultural practices.",
            benefits: "Technical and financial assistance for sustainable farming practices.",
            category: "Sustainable Farming",
            detailedDescription: "The National Mission for Sustainable Agriculture (NMSA) was launched in 2014-15 as one of the eight Missions under the National Action Plan on Climate Change. It aims to promote sustainable agriculture through integrated farming, appropriate soil health management, and synergizing resource conservation.",
            applicationProcess: [
              "Contact your local agriculture department or Krishi Vigyan Kendra",
              "Submit a proposal for implementing sustainable agriculture techniques",
              "Get your proposed activities approved by the district committee",
              "Implement the approved sustainable farming practices",
              "Submit completion report to receive financial assistance"
            ],
            requiredDocuments: [
              "Land records",
              "Bank account details",
              "Aadhaar card",
              "Proposal for sustainable agriculture implementation",
              "Photographs of the farm"
            ],
            contactInfo: {
              helpline: "1800-180-1551",
              email: "nmsa.india@gov.in",
              website: "https://nmsa.dac.gov.in"
            },
            timeline: "Approvals typically take 1-2 months. Funds are released within 30 days of completion verification.",
            additionalResources: "Various components include Rainfed Area Development, Soil Health Management, Climate Change and Sustainable Agriculture Monitoring."
          },
          {
            id: 6,
            name: "Agriculture Infrastructure Fund",
            description: "Financing facility for investment in post-harvest management infrastructure and community farming assets.",
            eligibility: "Farmers, FPOs, PACS, Marketing Cooperative Societies, and Startups.",
            benefits: "Interest subvention and credit guarantee for post-harvest infrastructure.",
            category: "Infrastructure",
            detailedDescription: "The Agriculture Infrastructure Fund is a financing facility launched in 2020 for the creation of post-harvest management infrastructure and community farming assets. With a corpus of Rs. 1 lakh crore, it aims to catalyze the creation of farm gate infrastructure to reduce wastage and improve market access.",
            applicationProcess: [
              "Register on the Agriculture Infrastructure Fund portal",
              "Submit project proposal with detailed business plan",
              "Get in-principle approval from Primary Lending Institutions (PLIs)",
              "Receive interest subvention and credit guarantee for your loan",
              "Implement the project as per the approved timeline"
            ],
            requiredDocuments: [
              "Business proposal/Detailed Project Report",
              "Land documents or lease agreement for infrastructure development",
              "Registration certificate of the organization (for FPOs, Cooperatives)",
              "Bank account details",
              "KYC documents of all stakeholders"
            ],
            contactInfo: {
              helpline: "1800-114-515",
              email: "aif.support@gov.in",
              website: "https://agriinfra.dac.gov.in"
            },
            timeline: "Project approvals typically take 30-45 days. Loans are disbursed as per the project implementation schedule.",
            additionalResources: "3% interest subvention on loans up to Rs. 2 crore, credit guarantee coverage for loans up to Rs. 2 crore."
          }
        ];
        
        const foundScheme = schemes.find(s => s.id === parseInt(id));
        
        if (foundScheme) {
          setScheme(foundScheme);
        } else {
          setError("Scheme not found");
        }
      } catch (err) {
        setError("Error loading scheme details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-60 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2.5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
        <Link to="/government-schemes" className="text-green-600 dark:text-green-400 hover:underline mt-2 inline-block">
          Return to all schemes
        </Link>
      </div>
    );
  }

  if (!scheme) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link 
        to="/government-schemes" 
        className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
      >
        <ChevronLeft size={18} className="mr-1" /> Back to all schemes
      </Link>

      {/* Scheme Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {scheme.name}
            </h1>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              {scheme.category}
            </span>
          </div>
          <button
            className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
            onClick={() => {
              // In a real app, this would download a PDF with scheme details
              alert('PDF download functionality would be implemented here');
            }}
          >
            <Download size={18} /> Download Details
          </button>
        </div>
      </div>

      {/* Scheme Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About this Scheme
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {scheme.detailedDescription}
            </p>
          </div>

          {/* Application Process */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Application Process
            </h2>
            <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
              {scheme.applicationProcess.map((step, index) => (
                <li key={index} className="pl-2">
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Timeline: {scheme.timeline}</span>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Required Documents
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              {scheme.requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 size={18} className="text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Eligibility & Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Eligibility & Benefits
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Users size={16} className="text-green-600 dark:text-green-400" />
                  Eligibility
                </h3>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{scheme.eligibility}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Tag size={16} className="text-green-600 dark:text-green-400" />
                  Benefits
                </h3>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{scheme.benefits}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Helpline:</span> {scheme.contactInfo.helpline}</p>
              <p><span className="font-medium">Email:</span> {scheme.contactInfo.email}</p>
              <p><span className="font-medium">Website:</span> <a 
                href={scheme.contactInfo.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                {scheme.contactInfo.website.replace('https://', '')}
              </a></p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start">
              <Info size={20} className="text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Additional Resources</h3>
                <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm">{scheme.additionalResources}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;