import pandas as pd
import numpy as np

def get_live_metrics(remediated_ids=""):
    remed_list = [x.strip() for x in remediated_ids.split(",") if x.strip()]
    resources = [
        {'id': 'RDS-PROD-01', 'type': 'database'},
        {'id': 'EC2-WEB-01', 'type': 'compute'},
        {'id': 'EC2-WEB-02', 'type': 'compute'},
        {'id': 'S3-USER-DATA', 'type': 'storage'},
        {'id': 'LAMBDA-AUTH', 'type': 'serverless'}
    ]

    fleet_data = []
    
    # Filter out resources that are remediated so they don't randomly anomaly again
    unfixed_resources = [r for r in resources if r['id'] not in remed_list]
    forced_anomaly_idx = np.random.randint(0, len(unfixed_resources)) if unfixed_resources else -1
    
    for res in resources:
        is_remediated = res['id'] in remed_list
        roll = np.random.random()
        
        # If remediated, force perfect operational health (but cost logic will increase later)
        if is_remediated:
            cpu = np.random.uniform(40.0, 55.0)
            errors = 0
            status = 0
        else:
            is_forced = unfixed_resources and unfixed_resources[forced_anomaly_idx]['id'] == res['id']
            if is_forced or roll > 0.85:
                cpu = np.random.uniform(94.0, 99.9)
                errors = np.random.randint(50, 200)
                status = 1
            elif roll > 0.70:
                cpu = np.random.uniform(60.0, 80.0)
                errors = np.random.randint(5, 20)
                status = 0
            else:
                cpu = np.random.uniform(5.0, 30.0)
                errors = np.random.randint(0, 2)
                status = 0

        fleet_data.append({
            'id': res['id'],
            'cpu': round(cpu, 2),
            'errors': errors,
            'public_access': status
        })
    return pd.DataFrame(fleet_data)

def get_billing_and_carbon_data(total_cpu=150.0, num_remediated=0):
    # Base cost starts high. Each remediation REDUCES cost by eliminating waste
    # (e.g. stopping idle instances, fixing CPU thrashing, revoking leaked endpoints)
    base_cost = 450.0 - (num_remediated * 85.0)
    base_cost = max(base_cost, 120.0)  # floor: can't go below infrastructure minimum
    random_variation = np.random.uniform(-10.0, 15.0)
    current_bill = round(base_cost + random_variation, 2)
    
    # Predicted next month trends even lower as optimizations compound
    optimization_factor = 0.95 - (num_remediated * 0.03)
    optimization_factor = max(optimization_factor, 0.70)  # floor at 30% savings
    predicted_next_month = round(current_bill * optimization_factor + np.random.uniform(-5, 5), 2)
    
    # Carbon footprint calculation:
    # 1. load_factor = ratio of total fleet CPU usage to a 500% baseline (5 instances at 100%)
    # 2. energy_kwh  = load_factor * 0.4kW (avg server draw) * 720hrs/month * 1.1 (PUE overhead)
    # 3. carbon_kg   = energy_kwh * 0.4 kgCO2/kWh (US grid avg emission factor)
    # Remediations reduce carbon by lowering CPU thrashing and decommissioning idle resources
    load_factor = total_cpu / 500.0 
    energy_kwh = load_factor * 0.4 * 720 * 1.1
    efficiency_bonus = 1.0 - (num_remediated * 0.12)
    efficiency_bonus = max(efficiency_bonus, 0.3)  # floor
    carbon_footprint_kg = round(energy_kwh * 0.4 * efficiency_bonus, 2)

    return {
        "current_bill_usd": current_bill,
        "predicted_next_month_usd": predicted_next_month,
        "carbon_footprint_kg": carbon_footprint_kg
    }