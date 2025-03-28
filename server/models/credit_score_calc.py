from pathlib import Path
from dotenv import load_dotenv
import os
from .database import supabase

# Adjustable weights dictionary
WEIGHTS = {
    "landHolding": 3,
    "cropType": 2,
    "annualIncome": 3,
    "existingLoans": 2,
    "repaymentHistory": 4,
    "cropYield": 3,
    "irrigationSource": 2,
    "farmingExperience": 3
}

def get_farmer_data(farmer_id):
    """Fetch farmer data from Supabase tables"""
    try:
        # Get farmer profile
        profile = supabase.table('farmer_profiles')\
            .select('*')\
            .eq('id', farmer_id)\
            .single()\
            .execute()

        # Get financial details
        financial = supabase.table('financial_details')\
            .select('*')\
            .eq('farmer_id', farmer_id)\
            .single()\
            .execute()

        if profile.data and financial.data:
            return {
                "landHolding": float(profile.data.get('land_holding', 0)),
                "cropType": "cash_crop" if profile.data.get('primary_crop') in ['cotton', 'sugarcane', 'wheat'] else "mixed_crop",
                "annualIncome": float(profile.data.get('annual_income', 0)) / 100000,  # Convert to lakhs
                "existingLoans": float(financial.data.get('existing_loans', 0)),
                "repaymentHistory": financial.data.get('repayment_history', 'no_data'),
                "cropYield": float(financial.data.get('crop_yield', 0)),
                "irrigationSource": profile.data.get('irrigation_source', 'rainfed'),
                "farmingExperience": int(profile.data.get('farming_experience', 0))
            }
        return None
    except Exception as e:
        print(f"Error fetching farmer data: {e}")
        return None

def evaluate_farmer(farmer, weights):
    """
    Evaluates the credit score of a farmer using adjustable weights.
    Returns the total score and the rating category.
    """
    score = 0

    # Land Holding
    if farmer['landHolding'] >= 10:
        score += weights['landHolding'] * 3
    elif farmer['landHolding'] >= 5:
        score += weights['landHolding'] * 2
    else:
        score += weights['landHolding'] * 1

    # Crop Type
    if farmer['cropType'] == "cash_crop":
        score += weights['cropType'] * 3
    elif farmer['cropType'] == "mixed_crop":
        score += weights['cropType'] * 2
    else:
        score += weights['cropType'] * 1

    # Annual Income
    if farmer['annualIncome'] >= 10:
        score += weights['annualIncome'] * 3
    elif farmer['annualIncome'] >= 5:
        score += weights['annualIncome'] * 2
    else:
        score += weights['annualIncome'] * 1

    # Existing Loans
    if farmer['existingLoans'] == 0:
        score += weights['existingLoans'] * 3
    elif farmer['existingLoans'] <= 2:
        score += weights['existingLoans'] * 2
    else:
        score += weights['existingLoans'] * 1

    # Repayment History
    if farmer['repaymentHistory'] == "no_default":
        score += weights['repaymentHistory'] * 3
    elif farmer['repaymentHistory'] == "minor_delay":
        score += weights['repaymentHistory'] * 2
    else:
        score += weights['repaymentHistory'] * 1

    # Crop Yield
    if farmer['cropYield'] >= 25:
        score += weights['cropYield'] * 3
    elif farmer['cropYield'] >= 15:
        score += weights['cropYield'] * 2
    else:
        score += weights['cropYield'] * 1

    # Irrigation Source
    if farmer['irrigationSource'] == "full":
        score += weights['irrigationSource'] * 3
    elif farmer['irrigationSource'] == "partial":
        score += weights['irrigationSource'] * 2
    else:
        score += weights['irrigationSource'] * 1

    # Farming Experience
    if farmer['farmingExperience'] >= 10:
        score += weights['farmingExperience'] * 3
    elif farmer['farmingExperience'] >= 5:
        score += weights['farmingExperience'] * 2
    else:
        score += weights['farmingExperience'] * 1

    # Categorizing the score
    if score >= 15 * sum(weights.values()) / 10:
        rating = "High Credit Rating"
    elif score >= 8 * sum(weights.values()) / 10:
        rating = "Average Credit Rating"
    else:
        rating = "Low Credit Rating"

    return score, rating

def store_credit_evaluation(farmer_id, score, rating, input_data):
    """Store credit evaluation results in Supabase"""
    try:
        # Update credit score in farmer profile
        supabase.table('farmer_profiles')\
            .update({'credit_score': score})\
            .eq('id', farmer_id)\
            .execute()

        # Store evaluation details
        supabase.table('credit_evaluations')\
            .insert({
                'user_id': farmer_id,
                'credit_score': score,
                'algorithm_version': '1.0',
                'input_data': input_data,
                'notes': f"Automated evaluation: {rating}"
            })\
            .execute()
    except Exception as e:
        print(f"Error storing credit evaluation: {e}")
        raise e

def calculate_credit_score(farmer_id):
    """Main function to calculate credit score for a given farmer ID"""
    try:
        # Get farmer data
        farmer_data = get_farmer_data(farmer_id)
        if not farmer_data:
            raise ValueError(f"No data found for farmer ID: {farmer_id}")

        # Calculate score
        score, rating = evaluate_farmer(farmer_data, WEIGHTS)

        # Store results
        store_credit_evaluation(farmer_id, score, rating, farmer_data)

        return {
            'status': 'success',
            'score': score,
            'rating': rating,
            'details': farmer_data
        }
    except Exception as e:
        print(f"Error calculating credit score: {e}")
        return {
            'status': 'error',
            'message': str(e)
        }

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        farmer_id = sys.argv[1]
        result = calculate_credit_score(farmer_id)
        print(result)
    else:
        print("Please provide farmer ID as argument")
