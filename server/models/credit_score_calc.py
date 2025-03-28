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

        # Calculate base score (out of 850)
        score = 0
        max_score = 850

        # Land holding (20% weight)
        if land_holding >= 10:
            score += 170
        elif land_holding >= 5:
            score += 130
        elif land_holding >= 2:
            score += 85
        else:
            score += 40

        # Annual income (25% weight)
        if annual_income >= 500000:
            score += 212
        elif annual_income >= 300000:
            score += 170
        elif annual_income >= 100000:
            score += 127
        else:
            score += 85

        # Farming experience (20% weight)
        if farming_experience >= 10:
            score += 170
        elif farming_experience >= 5:
            score += 127
        elif farming_experience >= 2:
            score += 85
        else:
            score += 42

        # Repayment history (25% weight)
        repayment_scores = {
            'excellent': 212,
            'good': 170,
            'fair': 127,
            'poor': 85,
            'none': 106
        }
        score += repayment_scores.get(repayment_history, 85)

        # Crop yield (10% weight)
        if crop_yield >= 30:
            score += 86
        elif crop_yield >= 20:
            score += 64
        elif crop_yield >= 10:
            score += 43
        else:
            score += 21

        # Prepare response
        return {
            "success": True,
            "score": int(score),
            "details": {
                "landHolding": land_holding,
                "annualIncome": annual_income,
                "farmingExperience": farming_experience,
                "repaymentHistory": repayment_history,
                "cropYield": crop_yield
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
