-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_user_id(user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN CAST(current_setting('app.current_user_id', TRUE) AS UUID);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table for authentication and basic user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'lender')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Farmer profiles with farming-specific details
CREATE TABLE farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    land_holding DECIMAL(10, 2), -- in acres
    primary_crop VARCHAR(100),
    annual_income DECIMAL(15, 2),
    farming_experience INTEGER, -- in years
    location VARCHAR(255),
    irrigation_source VARCHAR(100),
    credit_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lender profiles with institution-specific details
CREATE TABLE lender_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    institution_name VARCHAR(255),
    institution_type VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loan applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    purpose VARCHAR(255),
    term INTEGER, -- in months
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'review', 'rejected')),
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high')),
    interest_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loan approvals linking lenders to approved loans
CREATE TABLE loan_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    lender_id UUID REFERENCES lender_profiles(id) ON DELETE CASCADE,
    approved_amount DECIMAL(15, 2) NOT NULL,
    approved_term INTEGER, -- in months
    approved_interest_rate DECIMAL(5, 2),
    disbursement_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial details for credit analysis
CREATE TABLE financial_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    existing_loans DECIMAL(15, 2),
    repayment_history VARCHAR(50),
    crop_yield DECIMAL(10, 2), -- quintal per acre
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Government schemes
CREATE TABLE government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    eligibility TEXT,
    benefits TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Farmer eligibility for government schemes
CREATE TABLE farmer_scheme_eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES government_schemes(id) ON DELETE CASCADE,
    eligibility_score INTEGER, -- percentage match
    status VARCHAR(50) DEFAULT 'eligible' CHECK (status IN ('eligible', 'applied', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farmer_id, scheme_id)
);

-- Risk factors for credit analysis
CREATE TABLE risk_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    factor VARCHAR(100) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('excellent', 'good', 'medium', 'poor')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loan repayment history
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'late')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credit evaluations table for storing credit analysis results
CREATE TABLE credit_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    credit_score DECIMAL(5, 2),
    algorithm_version VARCHAR(50),
    input_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot interactions table for storing conversation history
CREATE TABLE chatbot_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed data for government schemes
INSERT INTO government_schemes (name, description, eligibility, benefits, category) VALUES
('PM-KISAN', 'Pradhan Mantri Kisan Samman Nidhi provides income support of ₹6,000 per year to all farmer families across the country in three equal installments of ₹2,000 each every four months.', 'All farmer families with cultivable land.', 'Direct income support of ₹6,000 per year.', 'Income Support'),
('Kisan Credit Card', 'The Kisan Credit Card scheme provides farmers with affordable credit for their agricultural needs and other requirements.', 'All farmers, tenant farmers, sharecroppers, and self-help groups.', 'Short-term loans for cultivation at favorable interest rates.', 'Credit'),
('Soil Health Card', 'The Soil Health Card scheme assesses the current status of soil health and recommends appropriate nutrients and fertilizers.', 'All farmers with agricultural land.', 'Soil nutrient status and recommendations for improving soil health.', 'Technical Support'),
('Pradhan Mantri Fasal Bima Yojana', 'A crop insurance scheme that provides financial support to farmers suffering crop loss or damage due to unforeseen events.', 'Farmers growing notified crops in notified areas.', 'Insurance coverage and financial support in case of crop failure.', 'Insurance'),
('National Mission for Sustainable Agriculture', 'Promotes sustainable agriculture through climate change adaptation measures, water use efficiency, and soil health management.', 'Farmers willing to adopt sustainable agricultural practices.', 'Technical and financial assistance for sustainable farming practices.', 'Sustainable Farming'),
('Agriculture Infrastructure Fund', 'Financing facility for investment in post-harvest management infrastructure and community farming assets.', 'Farmers, FPOs, PACS, Marketing Cooperative Societies, and Startups.', 'Interest subvention and credit guarantee for post-harvest infrastructure.', 'Infrastructure');

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_farmer_profiles_modtime BEFORE UPDATE ON farmer_profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_lender_profiles_modtime BEFORE UPDATE ON lender_profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_loan_applications_modtime BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_loan_approvals_modtime BEFORE UPDATE ON loan_approvals FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_financial_details_modtime BEFORE UPDATE ON financial_details FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_government_schemes_modtime BEFORE UPDATE ON government_schemes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_farmer_scheme_eligibility_modtime BEFORE UPDATE ON farmer_scheme_eligibility FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_risk_factors_modtime BEFORE UPDATE ON risk_factors FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_loan_repayments_modtime BEFORE UPDATE ON loan_repayments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_credit_evaluations_modtime BEFORE UPDATE ON credit_evaluations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_chatbot_interactions_modtime BEFORE UPDATE ON chatbot_interactions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lender_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_scheme_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Anyone can insert into users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (id = current_user_id());
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (id = current_user_id());

-- RLS Policies for farmer_profiles table
CREATE POLICY "Farmers can view their own profile" ON farmer_profiles
  FOR SELECT USING (current_user_id() = user_id);
  
CREATE POLICY "Lenders can view farmer profiles" ON farmer_profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'lender'
  ));
  
CREATE POLICY "Farmers can insert their own profile" ON farmer_profiles
  FOR INSERT WITH CHECK (current_user_id() = user_id);
  
CREATE POLICY "Farmers can update their own profile" ON farmer_profiles
  FOR UPDATE USING (current_user_id() = user_id);

-- RLS Policies for lender_profiles table
CREATE POLICY "Lenders can view their own profile" ON lender_profiles
  FOR SELECT USING (current_user_id() = user_id);
  
CREATE POLICY "Farmers can view lender profiles" ON lender_profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'farmer'
  ));
  
CREATE POLICY "Lenders can insert their own profile" ON lender_profiles
  FOR INSERT WITH CHECK (current_user_id() = user_id);
  
CREATE POLICY "Lenders can update their own profile" ON lender_profiles
  FOR UPDATE USING (current_user_id() = user_id);

-- RLS Policies for loan_applications table
CREATE POLICY "Farmers can view their own loan applications" ON loan_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can view all loan applications" ON loan_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'lender'
  ));
  
CREATE POLICY "Farmers can insert their own loan applications" ON loan_applications
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Farmers can update their own loan applications" ON loan_applications
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can update loan applications" ON loan_applications
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'lender'
  ));

-- RLS Policies for loan_approvals table
CREATE POLICY "Lenders can view their own loan approvals" ON loan_approvals
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_id AND lender_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Farmers can view loan approvals for their applications" ON loan_approvals
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM loan_applications
    JOIN farmer_profiles ON loan_applications.farmer_id = farmer_profiles.id
    WHERE loan_applications.id = loan_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can insert loan approvals" ON loan_approvals
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_id AND lender_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can update their own loan approvals" ON loan_approvals
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM lender_profiles WHERE lender_profiles.id = lender_id AND lender_profiles.user_id = current_user_id()
  ));

-- RLS Policies for financial_details table
CREATE POLICY "Farmers can view their own financial details" ON financial_details
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can view financial details" ON financial_details
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'lender'
  ));
  
CREATE POLICY "Farmers can insert their own financial details" ON financial_details
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Farmers can update their own financial details" ON financial_details
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));

-- RLS Policies for government_schemes table
CREATE POLICY "Anyone can view government schemes" ON government_schemes
  FOR SELECT USING (true);
  
CREATE POLICY "Only administrators can modify government schemes" ON government_schemes
  FOR ALL USING (current_user_id() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- RLS Policies for farmer_scheme_eligibility table
CREATE POLICY "Farmers can view their own scheme eligibility" ON farmer_scheme_eligibility
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can view scheme eligibility" ON farmer_scheme_eligibility
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'lender'
  ));
  
CREATE POLICY "System can insert scheme eligibility" ON farmer_scheme_eligibility
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Farmers can update their own scheme application status" ON farmer_scheme_eligibility
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));

-- RLS Policies for risk_factors table
CREATE POLICY "Farmers can view their own risk factors" ON risk_factors
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM farmer_profiles WHERE farmer_profiles.id = farmer_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can view risk factors" ON risk_factors
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = current_user_id() AND users.role = 'lender'
  ));
  
CREATE POLICY "System can insert risk factors" ON risk_factors
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "System can update risk factors" ON risk_factors
  FOR UPDATE USING (true);

-- RLS Policies for loan_repayments table
CREATE POLICY "Farmers can view their own loan repayments" ON loan_repayments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM loan_applications
    JOIN farmer_profiles ON loan_applications.farmer_id = farmer_profiles.id
    WHERE loan_applications.id = loan_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can view loan repayments" ON loan_repayments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM loan_approvals
    JOIN lender_profiles ON loan_approvals.lender_id = lender_profiles.id
    WHERE loan_approvals.loan_id = loan_id AND lender_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Farmers can insert their own loan repayments" ON loan_repayments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM loan_applications
    JOIN farmer_profiles ON loan_applications.farmer_id = farmer_profiles.id
    WHERE loan_applications.id = loan_id AND farmer_profiles.user_id = current_user_id()
  ));
  
CREATE POLICY "Lenders can update loan repayment status" ON loan_repayments
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM loan_approvals
    JOIN lender_profiles ON loan_approvals.lender_id = lender_profiles.id
    WHERE loan_approvals.loan_id = loan_id AND lender_profiles.user_id = current_user_id()
  ));

-- RLS Policies for credit_evaluations table
CREATE POLICY "Users can view their own credit evaluations" ON credit_evaluations
    FOR SELECT USING (current_user_id() = user_id);

CREATE POLICY "Users can insert their own credit evaluations" ON credit_evaluations
    FOR INSERT WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own credit evaluations" ON credit_evaluations
    FOR UPDATE USING (current_user_id() = user_id);

CREATE POLICY "Lenders can view credit evaluations" ON credit_evaluations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = current_user_id() AND users.role = 'lender'
    ));

-- RLS Policies for chatbot_interactions table
CREATE POLICY "Users can view their own chat interactions" ON chatbot_interactions
    FOR SELECT USING (current_user_id() = user_id);

CREATE POLICY "Users can insert their own chat interactions" ON chatbot_interactions
    FOR INSERT WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own chat interactions" ON chatbot_interactions
    FOR UPDATE USING (current_user_id() = user_id);