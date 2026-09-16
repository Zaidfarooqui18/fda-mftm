# Maharashtra Food Trust Mission (MFTM)
### Digital Accountability & Risk-Based Inspection Prioritization System
**Food and Drug Administration (FDA), Government of Maharashtra**

---

## 🏛️ Overview

The **Maharashtra Food Trust Mission (MFTM)** is an integrated digital governance and accountability platform designed for the **Food and Drug Administration (FDA), Government of Maharashtra**. It modernizes food safety enforcement by transitioning from reactive, calendar-based scheduling to an intelligent, data-driven **Risk-Based Inspection Engine**, accompanied by public transparency and citizen grievance redressing.

---

## ✨ Key Features

### 1. 🔍 Risk-Based Inspection Prioritization Engine
- Dynamic scoring algorithm weighting:
  - Previous violation history and penalty severity
  - Mandatory compliance certificate validity (FSSAI licenses, water testing, pest control, medical fitness)
  - Citizen grievance trends and grievance escalation thresholds
  - Elapsed time since the last comprehensive inspection
- Ranks food establishments into **High**, **Medium**, and **Low** risk categories for targeted inspector dispatching.

### 2. 📱 Public QR Verification & Transparency Cards
- Dynamic QR code generation for every registered Food Business Operator (FBO).
- Citizens can scan restaurant QR codes on-site to inspect:
  - Valid FSSAI registration and license status
  - Hygiene and transparency ratings
  - Compliance check cards across 7 critical food safety categories
  - Date and findings of the last official inspection

### 3. 📢 Citizen Grievance & Complaint Redressal
- Seamless reporting mechanism for food safety, hygiene, adulteration, and sanitation violations.
- Supports anonymous filing and automated routing to designated ward inspectors.
- Real-time complaint tracking and resolution logging.

### 4. 👨‍💼 Inspector & Administrative Portals
- **Field Inspector (FSO)**: Mobile-optimized digital checklists, evidence photo attachments, and on-site violation citation logging.
- **Senior FDA Officer**: Ward-level operational dashboards, inspection clearance ratios, grievance heatmaps, and enforcement analytics.

### 5. 🌐 GDS Design System & Bilingual Support
- Built adhering to modern Indian Government Digital Service (GDS) UI guidelines.
- Instant toggling between **English** and **Marathi (मराठी)**.
- High-contrast accessibility support and clean typographic hierarchy.

---

## 📁 Project Structure

```
maharashtra-food-trust-mission/
├── assets/
│   ├── css/
│   │   └── mftm-app.css          # Portal stylesheets & GDS theme
│   └── js/
│       ├── mftm-app.js          # Core frontend controller & API client
│       └── qr-generator.js      # Dynamic QR code generation engine
├── includes/
│   ├── class-mftm-api.php       # WordPress REST API endpoints (/wp-json/mftm/v1)
│   ├── class-mftm-db.php        # Custom database table schemas & migrations
│   ├── class-mftm-demo-data.php # Seed data for wards, establishments, & logs
│   └── class-mftm-risk-engine.php # Algorithmic risk calculation engine
├── templates/
│   └── app.php                  # Single-page application master template
├── tests/
│   └── verify_all_endpoints.py  # Python automated REST API validation suite
├── maharashtra-food-trust-mission.php # Main WordPress plugin bootstrap
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

1. Copy or clone the plugin into your WordPress plugins directory:
   ```bash
   cd wp-content/plugins/
   git clone https://github.com/Zaidfarooqui18/fda-mftm.git maharashtra-food-trust-mission
   ```
2. Activate the plugin via WP-CLI or the WordPress Admin Dashboard:
   ```bash
   wp plugin activate maharashtra-food-trust-mission
   ```
3. Upon activation, the plugin automatically:
   - Provisions database tables for establishments, inspections, compliance items, and complaints.
   - Registers user roles (`mftm_restaurant`, `mftm_inspector`, `mftm_senior_officer`).
   - Seeds baseline demonstration data across Mumbai wards.

---

## 🧪 Testing the API

Run the automated Python test suite to verify all REST endpoints:

```bash
python tests/verify_all_endpoints.py
```

Endpoints covered:
- `GET /wp-json/mftm/v1/public/restaurant/{id}`
- `POST /wp-json/mftm/v1/complaints`
- `GET /wp-json/mftm/v1/inspector/establishments`
- `POST /wp-json/mftm/v1/inspections`
- `GET /wp-json/mftm/v1/officer/analytics`

---

## 📜 License

Proprietary / Government Internal - Food & Drug Administration, Government of Maharashtra.
