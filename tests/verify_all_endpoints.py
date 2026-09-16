import urllib.request
import json
import sys

BASE = "http://localhost:8000/wp-json/mftm/v1"

def test(name, url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
        body = json.dumps(data).encode("utf-8")
    else:
        body = None
    try:
        with urllib.request.urlopen(req, data=body, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            res = json.loads(content)
            print(f"[PASS] {name} (HTTP {resp.status})")
            return res
    except Exception as ex:
        print(f"[FAIL] {name}: {ex}")
        return None

print("=== MFTM AUTOMATED ENDPOINT SUITE ===")

# 1. Public Restaurant View
pub = test("1. Public Restaurant Profile (Spice Symphony)", f"{BASE}/public/restaurant/1")
assert pub and pub["name"] == "Spice Symphony & Good Food Restaurant", "Pub name mismatch"
assert len(pub["compliance_cards"]) == 7, "Must have 7 categories"
assert "transparency_rating" in pub, "Must have rating"
assert "last_inspection" in pub, "Must have last inspection"

# 2. Citizen Complaint Submission
complaint_payload = {
    "establishment_id": 1,
    "category": "Cleanliness",
    "description": "Verification test complaint: tables clean, slight water spot near wash station.",
    "is_anonymous": 1
}
comp_res = test("2. Citizen Complaint Submission", f"{BASE}/public/complaint", "POST", complaint_payload)
assert comp_res and comp_res["success"], "Complaint submission failed"
comp_code = comp_res["complaint_code"]

# 3. Track Complaint
track_res = test("3. Citizen Complaint Tracking", f"{BASE}/public/complaint/track/{comp_code}")
assert track_res and track_res["complaint_code"] == comp_code, "Track failed"

# 4. Restaurant Dashboard
rest = test("4. Restaurant Dashboard (Est 1)", f"{BASE}/restaurant/dashboard?establishment_id=1")
assert rest and rest["establishment"]["id"] == "1" or rest["establishment"]["id"] == 1, "Rest dashboard failed"

# 5. Restaurant Live Compliance Submission
comp_submit_payload = {
    "establishment_id": 1,
    "category": "Kitchen Cleanliness",
    "photo_url": "data:image/svg+xml;utf8,<svg><text>LIVE VERIFIED TEST</text></svg>",
    "latitude": 18.52043,
    "longitude": 73.85674,
    "gps_accuracy": 3.5,
    "capture_session_id": "sess_auto_test_99",
    "submission_notes": "Automated verification test of live compliance capture"
}
comp_sub_res = test("5. Restaurant Live Compliance Submission", f"{BASE}/restaurant/compliance", "POST", comp_submit_payload)
assert comp_sub_res and comp_sub_res["success"], "Compliance submission failed"
assert comp_sub_res["location_verification"] == "VERIFIED", "Distance <= 100m should be verified"

# 6. Inspector Search by FSSAI License Number
search_res = test("6. Inspector FSSAI Search (11524026000123)", f"{BASE}/inspector/search?q=11524026000123")
assert search_res and len(search_res) > 0, "FSSAI search failed"

# 7. Inspector Establishment Internal Dossier
dossier = test("7. Inspector Internal Dossier (Confidential Contacts)", f"{BASE}/inspector/establishment/1")
assert dossier and "owner_phone" in dossier["establishment"], "Owner phone missing in dossier"
assert "risk_factors" in dossier, "Risk factors missing"

# 8. Inspector 6-Step Inspection Submission
insp_payload = {
    "establishment_id": 1,
    "inspector_name": "Inspector Vikram Deshmukh",
    "overall_result": "SATISFACTORY",
    "findings_level": "MINOR",
    "corrective_action": "All standards met. Refresher training completed.",
    "notes": "Automated verification test inspection"
}
insp_res = test("8. Inspector Inspection Submission", f"{BASE}/inspector/inspection", "POST", insp_payload)
assert insp_res and insp_res["success"], "Inspection submission failed"

# 9. Senior Command Dashboard
cmd = test("9. Senior Command Dashboard (KPIs, Map, Priority Queue)", f"{BASE}/senior/command-dashboard")
assert cmd and cmd["kpis"]["total_establishments"] == 24536, "Command KPIs failed"
assert len(cmd["district_data"]) == 12, "District heatmap data missing"
assert len(cmd["priority_queue"]) > 0, "Priority queue missing"

# 10. Senior Officer Assign Inspection
assign_payload = {
    "establishment_id": 3,
    "inspector_id": 4,
    "priority": "HIGH",
    "deadline_date": "2026-06-08",
    "notes": "Verify citizen concern and conduct unannounced evening check."
}
assign_res = test("10. Senior Officer Inspection Order Dispatch", f"{BASE}/senior/assign-inspection", "POST", assign_payload)
assert assign_res and assign_res["success"], "Assignment failed"

# 11. Reports & Analytics
rep_comp = test("11. Reports - Compliance Summary", f"{BASE}/reports?type=compliance")
assert rep_comp and len(rep_comp["records"]) > 0, "Compliance report failed"
rep_insp = test("12. Reports - Inspection Audit Report", f"{BASE}/reports?type=inspections")
assert rep_insp and len(rep_insp["records"]) > 0, "Inspections report failed"
rep_cit = test("13. Reports - Citizen Complaints Report", f"{BASE}/reports?type=complaints")
assert rep_cit and len(rep_cit["records"]) > 0, "Complaints report failed"

print("\n=== ALL 13 CORE BACKEND & API TESTS PASSED PERFECTLY ===")
