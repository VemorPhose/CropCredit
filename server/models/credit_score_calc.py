import sys
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from database import supabase

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

def calculate_credit_score(user_id, input_data):
    try:
        # Normalize input values
        land_holding = float(input_data.get('landHolding', 0))
        annual_income = float(input_data.get('annualIncome', 0))
        farming_experience = float(input_data.get('farmingExperience', 0))
        crop_yield = float(input_data.get('cropYield', 0))
        repayment_history = input_data.get('repaymentHistory', 'none')
        irrigation_source = input_data.get('irrigationSource', 'rainwater')
        crop_type = input_data.get('cropType', '')
        existing_loans = float(input_data.get('existingLoans', 0))
        
        # Calculate base score (out of 850)
        score = 0
        max_score = 850
        
        # Land holding (15% weight) - reduced slightly as size alone isn't determinative
        if land_holding >= 10:
            score += 127
        elif land_holding >= 5:
            score += 102
        elif land_holding >= 2:
            score += 76
        else:
            score += 38
            
        # Irrigation quality (10% weight) - new factor, critical for productivity
        irrigation_scores = {
            'canal': 85,       # Reliable government irrigation
            'tubewell': 72,    # Private investment, good reliability
            'pond': 60,        # Seasonal dependence but stored water
            'rainwater': 34,   # High weather risk
            'other': 51
        }
        score += irrigation_scores.get(irrigation_source, 34)
        
        # Annual income (20% weight) - adjusted brackets for Indian context
        if annual_income >= 500000:  # Higher income tier
            score += 170
        elif annual_income >= 300000:
            score += 136
        elif annual_income >= 150000:
            score += 102
        elif annual_income >= 75000:
            score += 85
        else:
            score += 51
            
        # Debt-to-income ratio (5% weight) - new factor
        if existing_loans > 0:
            debt_ratio = existing_loans / max(annual_income, 1) 
            if debt_ratio < 0.3:
                score += 43
            elif debt_ratio < 0.5:
                score += 32
            elif debt_ratio < 0.8:
                score += 21
            else:
                score += 8
        else:
            score += 26  # No current loans
            
        # Farming experience (15% weight) - still important, slightly reduced
        if farming_experience >= 15:
            score += 127
        elif farming_experience >= 10:
            score += 106
        elif farming_experience >= 5:
            score += 85
        elif farming_experience >= 2:
            score += 64
        else:
            score += 34
            
        # Repayment history (20% weight) - adjusted to better reward good history
        repayment_scores = {
            'excellent': 170,  # Highest reward for excellent history
            'good': 136,
            'fair': 102,
            'poor': 51,
            'none': 85       # Middle value for no history
        }
        score += repayment_scores.get(repayment_history, 85)
            
        # Crop yield (10% weight) - remains important productivity indicator
        if crop_yield >= 35:
            score += 85
        elif crop_yield >= 25:
            score += 68
        elif crop_yield >= 15:
            score += 51
        elif crop_yield >= 8:
            score += 34
        else:
            score += 17
            
        # Crop risk profile (5% weight) - new factor
        high_value_crops = ['cotton', 'sugarcane', 'vegetables', 'fruits']
        if crop_type in high_value_crops:
            score += 43  # Higher return but also higher risk/investment
        elif crop_type in ['rice', 'wheat']:
            score += 36  # Staple crops, government support
        else:
            score += 26  # Other crops
        
        # Prepare response with enhanced details
        return {
            "success": True,
            "score": int(score),
            "details": {
                "landHolding": land_holding,
                "annualIncome": annual_income,
                "farmingExperience": farming_experience,
                "repaymentHistory": repayment_history,
                "cropYield": crop_yield,
                "irrigationSource": irrigation_source,
                "cropType": crop_type,
                "debtRatio": (existing_loans / max(annual_income, 1)) if annual_income > 0 else 0
            }
        }
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            print(json.dumps({
                "success": False,
                "error": "Invalid arguments"
            }))
            sys.exit(1)

        user_id = sys.argv[1]
        input_data = json.loads(sys.argv[2])
        
        result = calculate_credit_score(user_id, input_data)
        print(json.dumps(result))
        sys.exit(0 if result["success"] else 1)
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)
