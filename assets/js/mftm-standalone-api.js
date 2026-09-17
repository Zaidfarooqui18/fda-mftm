/**
 * Maharashtra Food Trust Mission (MFTM)
 * Client-Side Standalone Mock API & State Engine
 * Enables 100% full interactivity on GitHub Pages, static hosts, and standalone preview.
 */

(function (global) {
  'use strict';

  // SVG Helper for high-fidelity compliance photo evidence
  function createEvidencePhotoSVG(title, subtitle, color) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">' +
      '<defs>' +
        '<linearGradient id="grad_' + color + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#1e293b" />' +
          '<stop offset="100%" stop-color="#0f172a" />' +
        '</linearGradient>' +
        '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
          '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>' +
        '</pattern>' +
      '</defs>' +
      '<rect width="400" height="300" fill="url(#grad_' + color + ')" />' +
      '<rect width="400" height="300" fill="url(#grid)" />' +
      '<!-- Stamp Banner -->' +
      '<rect x="15" y="15" width="370" height="36" rx="4" fill="rgba(11,93,59,0.3)" stroke="#0b5d3b" stroke-width="1.5" />' +
      '<text x="30" y="38" fill="#4ade80" font-family="monospace" font-size="12" font-weight="bold">FDA MAHA VERIFIED PREMISES CAPTURE</text>' +
      '<!-- Icon Box -->' +
      '<circle cx="200" cy="130" r="48" fill="rgba(255,255,255,0.06)" stroke="' + (color === 'orange' ? '#f59e0b' : '#10b981') + '" stroke-width="2" />' +
      '<text x="200" y="138" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">✓</text>' +
      '<!-- Title -->' +
      '<text x="200" y="210" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">' + title + '</text>' +
      '<text x="200" y="235" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">' + subtitle + '</text>' +
      '<!-- Bottom Tech Strip -->' +
      '<rect x="0" y="270" width="400" height="30" fill="rgba(0,0,0,0.6)" />' +
      '<text x="20" y="289" fill="#38bdf8" font-family="monospace" font-size="10">GEO: 18.5204°N, 73.8567°E • TIME: 09:42:15 IST • ACC: 3.2m</text>' +
    '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  var DEFAULT_ESTABLISHMENTS = [
    {
      id: 1,
      establishment_code: 'MFTM-EST-001',
      name: 'Spice Symphony & Good Food Restaurant',
      fssai_license: '11524026000123',
      category: 'Restaurant & Family Dining',
      address: 'Plot 42, FC Road, Deccan Gymkhana, Shivajinagar',
      district: 'Pune',
      ward: 'Ward 14 (Shivajinagar)',
      latitude: 18.5204303,
      longitude: 73.8567437,
      owner_name: 'Sanjay K. Shinde',
      owner_phone: '+91 98220 11452',
      manager_name: 'Amol Bhosale',
      manager_phone: '+91 98221 44589',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      opening_time: '10:30',
      closing_time: '23:00',
      license_status: 'ACTIVE',
      license_validity: '30 Jun 2028',
      assigned_inspector_id: 2,
      current_rating: 4.4,
      risk_score: 18,
      risk_level: 'LOW',
      risk_factors: ['Consistent daily compliance', 'Satisfactory FDA inspection record'],
      public_qr_token: 'MFTM-QR-PUB-001',
      inspector_qr_token: 'MFTM-QR-INSP-001'
    },
    {
      id: 2,
      establishment_code: 'MFTM-EST-002',
      name: 'Spice Corner Coastal Kitchen',
      fssai_license: '11522001000889',
      category: 'Multi-Cuisine Casual Dining',
      address: '12 Marine Plaza, Nariman Point',
      district: 'Mumbai City',
      ward: 'Ward A (Colaba/Fort)',
      latitude: 18.9256,
      longitude: 72.8242,
      owner_name: 'Kiran M. Mehta',
      owner_phone: '+91 98200 45891',
      manager_name: 'Prasad Naik',
      manager_phone: '+91 98201 12345',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      opening_time: '11:00',
      closing_time: '23:30',
      license_status: 'ACTIVE',
      license_validity: '15 Nov 2027',
      assigned_inspector_id: 3,
      current_rating: 3.2,
      risk_score: 62,
      risk_level: 'HIGH',
      risk_factors: ['2 consecutive missed operating-day submissions', '1 unresolved hygiene complaint', 'Routine inspection overdue'],
      public_qr_token: 'MFTM-QR-PUB-002',
      inspector_qr_token: 'MFTM-QR-INSP-002'
    },
    {
      id: 3,
      establishment_code: 'MFTM-EST-003',
      name: 'Foodies Hub Multi-Cuisine',
      fssai_license: '11523012000452',
      category: 'Quick Service & Takeaway',
      address: 'Shop 8, High Street Mall, Majiwada Junction',
      district: 'Thane',
      ward: 'Ward 3 (Majiwada-Manpada)',
      latitude: 19.2183,
      longitude: 72.9781,
      owner_name: 'Devendra G. Chawla',
      owner_phone: '+91 98190 77412',
      manager_name: 'Rohan Joshi',
      manager_phone: '+91 98191 88965',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      opening_time: '10:00',
      closing_time: '23:00',
      license_status: 'ACTIVE',
      license_validity: '31 Dec 2026',
      assigned_inspector_id: 4,
      current_rating: 2.8,
      risk_score: 70,
      risk_level: 'HIGH',
      risk_factors: ['3 active citizen complaints on food quality and pest sightings', 'Delayed compliance uploads'],
      public_qr_token: 'MFTM-QR-PUB-003',
      inspector_qr_token: 'MFTM-QR-INSP-003'
    },
    {
      id: 4,
      establishment_code: 'MFTM-EST-004',
      name: 'Tasty Bites Family Restaurant',
      fssai_license: '11524026000781',
      category: 'Family Restaurant',
      address: 'Row House 4, Datta Mandir Chowk, Viman Nagar',
      district: 'Pune',
      ward: 'Ward 9 (Viman Nagar)',
      latitude: 18.5679,
      longitude: 73.9143,
      owner_name: 'Manoj V. Kadam',
      owner_phone: '+91 98900 33412',
      manager_name: 'Suresh More',
      manager_phone: '+91 98901 22145',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      opening_time: '09:00',
      closing_time: '22:30',
      license_status: 'ACTIVE',
      license_validity: '20 Apr 2027',
      assigned_inspector_id: 2,
      current_rating: 3.6,
      risk_score: 42,
      risk_level: 'MEDIUM',
      risk_factors: ['Previous inspection indicated Needs Improvement in raw meat segregation', '1 complaint resolved last month'],
      public_qr_token: 'MFTM-QR-PUB-004',
      inspector_qr_token: 'MFTM-QR-INSP-004'
    },
    {
      id: 5,
      establishment_code: 'MFTM-EST-005',
      name: 'Hotel Green Leaf Pure Veg',
      fssai_license: '11521045000912',
      category: 'Pure Vegetarian Restaurant',
      address: 'Temple Road, Sitabuldi Square',
      district: 'Nagpur',
      ward: 'Ward 6 (Dharampeth)',
      latitude: 21.1458,
      longitude: 79.0882,
      owner_name: 'Anand R. Agrawal',
      owner_phone: '+91 98600 55123',
      manager_name: 'Vikas Mishra',
      manager_phone: '+91 98601 44789',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      opening_time: '08:00',
      closing_time: '22:00',
      license_status: 'ACTIVE',
      license_validity: '15 Sep 2027',
      assigned_inspector_id: 5,
      current_rating: 3.4,
      risk_score: 58,
      risk_level: 'HIGH',
      risk_factors: ['Repeated missed operating-day compliance', 'Water quality test certification pending'],
      public_qr_token: 'MFTM-QR-PUB-005',
      inspector_qr_token: 'MFTM-QR-INSP-005'
    },
    {
      id: 6,
      establishment_code: 'MFTM-EST-006',
      name: 'Royal Dining & Banquet Hall',
      fssai_license: '11520033000673',
      category: 'Banquet & Fine Dining',
      address: 'Grand Galleria, College Road',
      district: 'Nashik',
      ward: 'Ward 2 (Panchavati)',
      latitude: 19.9975,
      longitude: 73.7898,
      owner_name: 'Harshwardhan R. Patil',
      owner_phone: '+91 98230 88210',
      manager_name: 'Ganesh Thorat',
      manager_phone: '+91 98231 66542',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      opening_time: '11:30',
      closing_time: '00:00',
      license_status: 'RENEWAL_PENDING',
      license_validity: '15 Oct 2026',
      assigned_inspector_id: 6,
      current_rating: 2.1,
      risk_score: 82,
      risk_level: 'CRITICAL',
      risk_factors: ['Critical violation: Unsanitary waste disposal and temperature abuse', '3 unverified location submissions', 'Emergency inspection assigned'],
      public_qr_token: 'MFTM-QR-PUB-006',
      inspector_qr_token: 'MFTM-QR-INSP-006'
    },
    {
      id: 7,
      establishment_code: 'MFTM-EST-007',
      name: 'Konkan Delights Seafood Coastal',
      fssai_license: '11525019000331',
      category: 'Specialty Seafood Restaurant',
      address: 'Sector 17, Palm Beach Road, Vashi',
      district: 'Thane',
      ward: 'Ward 7 (Vashi)',
      latitude: 19.0771,
      longitude: 72.9986,
      owner_name: 'Gautam S. Sawant',
      owner_phone: '+91 98205 99112',
      manager_name: 'Sachin Parab',
      manager_phone: '+91 98206 11223',
      operating_days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      opening_time: '12:00',
      closing_time: '23:30',
      license_status: 'ACTIVE',
      license_validity: '31 Dec 2028',
      assigned_inspector_id: 4,
      current_rating: 4.7,
      risk_score: 12,
      risk_level: 'LOW',
      risk_factors: ['Exemplary cold-chain compliance', 'Zero active citizen complaints', 'Satisfactory FDA inspection'],
      public_qr_token: 'MFTM-QR-PUB-007',
      inspector_qr_token: 'MFTM-QR-INSP-007'
    },
    {
      id: 8,
      establishment_code: 'MFTM-EST-008',
      name: 'Kolhapur Rasoi Traditional',
      fssai_license: '11524050000819',
      category: 'Traditional Maharashtrian Thali',
      address: '8th Lane, Rajarampuri',
      district: 'Kolhapur',
      ward: 'Ward 5 (Rajarampuri)',
      latitude: 16.7050,
      longitude: 74.2433,
      owner_name: 'Bandopant G. Patil',
      owner_phone: '+91 98223 44102',
      manager_name: 'Tanaji Chougule',
      manager_phone: '+91 98224 55691',
      operating_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      opening_time: '11:00',
      closing_time: '22:30',
      license_status: 'ACTIVE',
      license_validity: '10 Aug 2027',
      assigned_inspector_id: 7,
      current_rating: 4.5,
      risk_score: 15,
      risk_level: 'LOW',
      risk_factors: ['Consistent daily evidence submission', 'Clean inspection audit'],
      public_qr_token: 'MFTM-QR-PUB-008',
      inspector_qr_token: 'MFTM-QR-INSP-008'
    }
  ];

  var CATEGORIES = [
    'Kitchen Cleanliness',
    'Food Storage',
    'Handwash Area',
    'Waste Disposal',
    'Water Quality',
    'Pest Control',
    'Staff Hygiene'
  ];

  // Storage key (bumped for clean schema refresh)
  var STORAGE_KEY = 'mftm_demo_storage_v2';

  function loadStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Initial default state
    var initialSubmissions = [
      {
        establishment_id: 1,
        category: 'Kitchen Cleanliness',
        photo_url: createEvidencePhotoSVG('Kitchen Cleanliness', 'Daily deep clean & sanitized workstations', 'green'),
        submission_date: new Date().toISOString().split('T')[0],
        submission_time: '09:30 AM',
        location_verification: 'VERIFIED',
        gps_accuracy: 3.4,
        capture_session_id: 'live_sess_781a9f02'
      },
      {
        establishment_id: 1,
        category: 'Food Storage',
        photo_url: createEvidencePhotoSVG('Food Storage', 'Cold storage 3.5°C & ingredient labeling', 'green'),
        submission_date: new Date().toISOString().split('T')[0],
        submission_time: '09:45 AM',
        location_verification: 'VERIFIED',
        gps_accuracy: 4.1,
        capture_session_id: 'live_sess_781b01c3'
      },
      {
        establishment_id: 1,
        category: 'Handwash Area',
        photo_url: createEvidencePhotoSVG('Handwash Area', 'Sensor taps, liquid soap & paper towels', 'green'),
        submission_date: new Date().toISOString().split('T')[0],
        submission_time: '10:05 AM',
        location_verification: 'VERIFIED',
        gps_accuracy: 3.8,
        capture_session_id: 'live_sess_781c4e90'
      },
      {
        establishment_id: 1,
        category: 'Staff Hygiene',
        photo_url: createEvidencePhotoSVG('Staff Hygiene', 'Chef coats, clean aprons, hairnets & gloves', 'green'),
        submission_date: new Date().toISOString().split('T')[0],
        submission_time: '10:20 AM',
        location_verification: 'VERIFIED',
        gps_accuracy: 2.9,
        capture_session_id: 'live_sess_781d99a1'
      }
    ];

    var initialComplaints = [
      {
        complaint_code: 'MFTM-2026-000142',
        establishment_id: 1,
        establishment_name: 'Spice Symphony & Good Food Restaurant',
        district: 'Pune',
        category: 'Cleanliness',
        description: 'Washroom floor was damp and soap dispenser was empty during lunch hour.',
        customer_name: 'Citizen Rahul S.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        created_at: '12 Sep 2026, 01:15 PM',
        resolution_summary: 'Establishment manager refilled dispensers and implemented hourly sanitation logs.'
      },
      {
        complaint_code: 'MFTM-2026-000178',
        establishment_id: 3,
        establishment_name: 'Foodies Hub Multi-Cuisine',
        district: 'Thane',
        category: 'Pest Concern',
        description: 'Observed cockroaches near drink dispensing counter.',
        customer_name: 'Anonymous Citizen',
        status: 'UNDER_INVESTIGATION',
        priority: 'HIGH',
        created_at: '15 Sep 2026, 07:30 PM',
        resolution_summary: 'Field inspection scheduled; notice served for professional pest eradication.'
      }
    ];

    var initialInspections = [
      {
        inspection_code: 'INSP-MH-2026-0210',
        establishment_id: 1,
        inspector_id: 2,
        inspector_name: 'Inspector Vikram Deshmukh',
        inspection_date: '2026-08-14',
        inspection_time: '14:30:00',
        overall_result: 'SATISFACTORY',
        findings_level: 'MINOR',
        corrective_action: 'Advised secondary temperature log for dairy storage unit.',
        notes: 'Premises found in clean condition. Staff properly wearing PPE.'
      },
      {
        inspection_code: 'INSP-MH-2026-0189',
        establishment_id: 6,
        inspector_id: 6,
        inspector_name: 'Inspector Hemant Shirsath',
        inspection_date: '2026-09-02',
        inspection_time: '11:15:00',
        overall_result: 'ACTION_REQUIRED',
        findings_level: 'CRITICAL',
        corrective_action: 'Immediate overhaul of food waste disposal chute and grease traps.',
        notes: 'Critical cleanliness lapse detected in prep kitchen. Improvement notice served under Section 32.'
      }
    ];

    var initialAssignments = [
      {
        id: 1,
        establishment_id: 6,
        establishment_name: 'Royal Dining & Banquet Hall',
        district: 'Nashik',
        inspector_id: 6,
        priority: 'EMERGENCY',
        deadline_date: '2026-09-18',
        status: 'ASSIGNED',
        notes: 'Emergency follow-up verification regarding waste disposal violation.',
        created_at: '16 Sep 2026, 10:00 AM'
      },
      {
        id: 2,
        establishment_id: 3,
        establishment_name: 'Foodies Hub Multi-Cuisine',
        district: 'Thane',
        inspector_id: 4,
        priority: 'URGENT',
        deadline_date: '2026-09-19',
        status: 'ASSIGNED',
        notes: 'Verify pest infestation complaint and inspect raw material storage.',
        created_at: '16 Sep 2026, 02:30 PM'
      }
    ];

    var store = {
      establishments: DEFAULT_ESTABLISHMENTS,
      submissions: initialSubmissions,
      complaints: initialComplaints,
      inspections: initialInspections,
      assignments: initialAssignments
    };

    saveStorage(store);
    return store;
  }

  function saveStorage(store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  // Standalone API request router
  var StandaloneAPI = {
    handleRequest: function (endpoint, options) {
      options = options || {};
      var method = (options.method || 'GET').toUpperCase();
      var store = loadStorage();

      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            var res = StandaloneAPI.dispatch(method, endpoint, options.body ? JSON.parse(options.body) : null, store);
            resolve(res);
          } catch (err) {
            console.error('[Standalone API Error]', err);
            reject(err);
          }
        }, 150); // slight realistic network latency
      });
    },

    dispatch: function (method, endpoint, body, store) {
      // 1. GET /establishments
      if (endpoint === '/establishments') {
        return store.establishments;
      }

      // 2. GET /public/restaurant/:id
      if (endpoint.startsWith('/public/restaurant/')) {
        var idStr = endpoint.replace('/public/restaurant/', '');
        var est = store.establishments.find(function (e) {
          return e.id == idStr || e.establishment_code === idStr || e.public_qr_token === idStr;
        }) || store.establishments[0];

        var today = new Date().toISOString().split('T')[0];
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var todayName = days[new Date().getDay()];
        var isClosed = !(est.operating_days || []).includes(todayName);

        var cards = CATEGORIES.map(function (cat) {
          var sub = store.submissions.find(function (s) {
            return s.establishment_id == est.id && s.category === cat && s.submission_date === today;
          });

          if (sub) {
            return {
              category: cat,
              has_submission: true,
              photo_url: sub.photo_url || createEvidencePhotoSVG(cat, 'Daily verified compliance evidence', 'green'),
              submission_time: sub.submission_time,
              submission_date: sub.submission_date,
              status_badge: "✓ Today's Evidence Submitted",
              location_verification: sub.location_verification || 'VERIFIED',
              is_closed_day: false
            };
          } else {
            return {
              category: cat,
              has_submission: false,
              photo_url: null,
              submission_time: null,
              submission_date: null,
              status_badge: isClosed ? 'Scheduled Closed Day' : "Today's compliance evidence has not been submitted.",
              last_submitted_text: isClosed ? 'Weekly Scheduled Rest Day' : 'Awaiting daily evidence before 12:00 PM',
              is_closed_day: isClosed
            };
          }
        });

        var lastInsp = store.inspections.find(function (i) {
          return i.establishment_id == est.id;
        });

        return {
          id: est.id,
          establishment_code: est.establishment_code,
          name: est.name,
          fssai_license: est.fssai_license,
          category: est.category,
          address: est.address,
          district: est.district,
          ward: est.ward,
          license_status: est.license_status,
          license_validity: est.license_validity,
          operating_days: est.operating_days,
          opening_time: est.opening_time,
          closing_time: est.closing_time,
          is_scheduled_closed_today: isClosed,
          today_day_name: todayName,
          transparency_rating: est.current_rating,
          rating_breakdown: {
            consistency: { label: 'Daily Submission Consistency (40%)', score: Math.min(2.0, Number(((est.current_rating / 5.0) * 2.0).toFixed(1))), max: 2.0 },
            timeliness:  { label: 'Submission Timeliness (20%)', score: 0.9, max: 1.0 },
            inspection:  { label: 'Inspection Outcome Record (20%)', score: 1.0, max: 1.0 },
            complaints:  { label: 'Complaint & Resolution Record (20%)', score: 0.9, max: 1.0 }
          },
          rating_explanation: 'Calculated from 14-day verifiable live camera evidence, zero pending critical violations, and clean inspection history.',
          compliance_cards: cards,
          last_inspection: lastInsp ? {
            date: lastInsp.inspection_date,
            result: lastInsp.overall_result
          } : {
            date: '14 Aug 2026',
            result: 'SATISFACTORY'
          },
          disclaimer: 'Official Digital Record — Food and Drug Administration, Maharashtra'
        };
      }

      // 3. POST /public/complaint
      if (endpoint === '/public/complaint' && method === 'POST') {
        var newCode = 'MFTM-2026-' + String(store.complaints.length + 185).padStart(6, '0');
        var compEst = store.establishments.find(function (e) {
          return e.id == (body.establishment_id || 1);
        }) || store.establishments[0];

        var newComp = {
          complaint_code: newCode,
          establishment_id: compEst.id,
          establishment_name: compEst.name,
          district: compEst.district,
          category: body.category || 'Cleanliness',
          description: body.description || '',
          customer_name: body.is_anonymous ? 'Anonymous Citizen' : (body.customer_name || 'Citizen'),
          customer_phone: body.customer_phone || '',
          status: 'SUBMITTED',
          priority: (body.category === 'Pest Concern' || body.category === 'Food Quality') ? 'HIGH' : 'MEDIUM',
          created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          resolution_summary: ''
        };

        store.complaints.unshift(newComp);
        saveStorage(store);

        return {
          success: true,
          complaint_code: newCode,
          status: 'SUBMITTED',
          message: 'Your concern has been registered with FDA Maharashtra Food Trust Mission.',
          tracking_url: '/public/complaint/track/' + newCode
        };
      }

      // 4. GET /public/complaint/track/:code
      if (endpoint.startsWith('/public/complaint/track/')) {
        var cCode = decodeURIComponent(endpoint.replace('/public/complaint/track/', ''));
        var complaint = store.complaints.find(function (c) {
          return c.complaint_code === cCode;
        });

        if (!complaint) {
          complaint = {
            complaint_code: cCode,
            category: 'Cleanliness',
            status: 'RECEIVED',
            establishment_name: 'Spice Symphony & Good Food Restaurant',
            district: 'Pune',
            description: 'Citizen report logged through portal tracker.',
            created_at: '16 Sep 2026, 04:15 PM',
            resolution_summary: 'Verified and queued for routine squad inspection.'
          };
        }

        var stages = {
          SUBMITTED: { title: 'Submitted', desc: 'Concern received in FDA portal' },
          RECEIVED: { title: 'Received & Triaged', desc: 'Verified by district cell' },
          ASSIGNED: { title: 'Assigned', desc: 'Allocated to division food safety officer' },
          UNDER_INVESTIGATION: { title: 'Under Investigation', desc: 'Cross-checking evidence & logs' },
          INSPECTION_REQUIRED: { title: 'Inspection Scheduled', desc: 'Physical inspection mandated' },
          ACTION_TAKEN: { title: 'Action Taken', desc: 'Corrective notice / verification done' },
          RESOLVED: { title: 'Resolved', desc: 'Final closure verified' }
        };

        return {
          complaint_code: complaint.complaint_code,
          category: complaint.category,
          status: complaint.status,
          establishment_name: complaint.establishment_name,
          district: complaint.district,
          description: complaint.description,
          created_at: complaint.created_at,
          resolution_summary: complaint.resolution_summary,
          stages: stages
        };
      }

      // 5. GET /restaurant/dashboard
      if (endpoint.startsWith('/restaurant/dashboard')) {
        var rEstId = 1;
        var m = endpoint.match(/establishment_id=(\d+)/);
        if (m) rEstId = parseInt(m[1], 10);

        var restEst = store.establishments.find(function (e) {
          return e.id == rEstId;
        }) || store.establishments[0];

        var rToday = new Date().toISOString().split('T')[0];
        var completedCount = 0;

        var catStatus = CATEGORIES.map(function (cat) {
          var sub = store.submissions.find(function (s) {
            return s.establishment_id == restEst.id && s.category === cat && s.submission_date === rToday;
          });

          if (sub) {
            completedCount++;
            return {
              category: cat,
              is_submitted: true,
              photo_url: sub.photo_url || createEvidencePhotoSVG(cat, 'Daily verified compliance evidence', 'green'),
              time: sub.submission_time,
              location_verification: sub.location_verification || 'VERIFIED',
              gps_accuracy: sub.gps_accuracy || 3.5,
              capture_session_id: sub.capture_session_id || 'live_sess_default'
            };
          } else {
            return {
              category: cat,
              is_submitted: false,
              photo_url: null,
              time: null,
              location_verification: 'PENDING'
            };
          }
        });

        var rComplaints = store.complaints.filter(function (c) {
          return c.establishment_id == restEst.id;
        });

        var rLastInsp = store.inspections.find(function (i) {
          return i.establishment_id == restEst.id;
        }) || {
          inspection_date: '2026-08-14',
          overall_result: 'SATISFACTORY'
        };

        return {
          establishment: restEst,
          operating_days: restEst.operating_days,
          today_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          today_day_name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()],
          today_submission_count: completedCount,
          total_categories: CATEGORIES.length,
          categories_status: catStatus,
          public_qr_token: restEst.public_qr_token,
          inspector_qr_token: restEst.inspector_qr_token,
          complaints: rComplaints,
          last_inspection: rLastInsp,
          rating: restEst.current_rating
        };
      }

      // 6. POST /restaurant/compliance
      if (endpoint === '/restaurant/compliance' && method === 'POST') {
        var cToday = new Date().toISOString().split('T')[0];
        var timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        var photoData = body.photo_url || createEvidencePhotoSVG(body.category || 'Kitchen Cleanliness', 'Live Premises Verification Capture', 'green');

        // Remove existing if any
        store.submissions = store.submissions.filter(function (s) {
          return !(s.establishment_id == body.establishment_id && s.category === body.category && s.submission_date === cToday);
        });

        store.submissions.push({
          establishment_id: body.establishment_id || 1,
          category: body.category,
          photo_url: photoData,
          submission_date: cToday,
          submission_time: timeStr,
          latitude: body.latitude || 18.5204,
          longitude: body.longitude || 73.8567,
          gps_accuracy: body.gps_accuracy || 3.0,
          location_verification: 'VERIFIED',
          capture_session_id: body.capture_session_id || ('live_sess_' + Math.random().toString(36).substring(2, 10))
        });

        saveStorage(store);

        return {
          success: true,
          submission_id: Date.now(),
          category: body.category,
          submission_time: timeStr,
          location_verification: 'VERIFIED',
          distance_meters: 14.2,
          location_message: 'Location Verified (Within 100m of registered premises)',
          new_rating: 4.5
        };
      }

      // 7. GET /inspector/search
      if (endpoint.startsWith('/inspector/search')) {
        var query = '';
        var qm = endpoint.match(/q=([^&]*)/);
        if (qm) query = decodeURIComponent(qm[1]).toLowerCase().trim();

        if (!query) {
          return store.establishments;
        }

        return store.establishments.filter(function (e) {
          return e.name.toLowerCase().includes(query) ||
                 e.fssai_license.includes(query) ||
                 e.establishment_code.toLowerCase().includes(query) ||
                 e.district.toLowerCase().includes(query) ||
                 e.ward.toLowerCase().includes(query);
        });
      }

      // 8. GET /inspector/establishment/:id
      if (endpoint.startsWith('/inspector/establishment/')) {
        var iEstId = parseInt(endpoint.replace('/inspector/establishment/', ''), 10);
        var inspEst = store.establishments.find(function (e) {
          return e.id == iEstId;
        }) || store.establishments[0];

        var inspToday = new Date().toISOString().split('T')[0];
        var inspTodaySubs = store.submissions.filter(function (s) {
          return s.establishment_id == inspEst.id && s.submission_date === inspToday;
        });

        var inspEstComplaints = store.complaints.filter(function (c) {
          return c.establishment_id == inspEst.id;
        });

        var inspEstInspections = store.inspections.filter(function (i) {
          return i.establishment_id == inspEst.id;
        });

        return {
          establishment: inspEst,
          operating_days: inspEst.operating_days,
          risk_factors: inspEst.risk_factors,
          today_submissions: inspTodaySubs,
          compliance_history: [
            { submission_date: '2026-09-17', count: inspTodaySubs.length, worst_loc: 'VERIFIED' },
            { submission_date: '2026-09-16', count: 7, worst_loc: 'VERIFIED' },
            { submission_date: '2026-09-15', count: 6, worst_loc: 'VERIFIED' },
            { submission_date: '2026-09-14', count: 7, worst_loc: 'VERIFIED' },
            { submission_date: '2026-09-13', count: 5, worst_loc: 'VERIFIED' },
            { submission_date: '2026-09-12', count: 7, worst_loc: 'VERIFIED' }
          ],
          inspections: inspEstInspections,
          complaints: inspEstComplaints,
          audit_trail: [
            { id: 1, action: 'Daily Compliance Submission Completed', actor: 'Sanjay K. Shinde (Owner)', created_at: '17 Sep 2026, 10:20 AM' },
            { id: 2, action: 'GPS Perimeter Integrity Check Passed', actor: 'Automated Geo-Fence System', created_at: '17 Sep 2026, 09:30 AM' },
            { id: 3, action: 'Routine Field Inspection Completed', actor: 'Inspector Vikram Deshmukh', created_at: '14 Aug 2026, 02:30 PM' }
          ]
        };
      }

      // 9. POST /inspector/inspection
      if (endpoint === '/inspector/inspection' && method === 'POST') {
        var inspCode = 'INSP-MH-2026-' + String(store.inspections.length + 245).padStart(4, '0');
        var newInsp = {
          inspection_code: inspCode,
          establishment_id: body.establishment_id || 1,
          inspector_id: 2,
          inspector_name: body.inspector_name || 'Inspector Vikram Deshmukh',
          inspection_date: new Date().toISOString().split('T')[0],
          inspection_time: new Date().toLocaleTimeString('en-GB'),
          overall_result: body.overall_result || 'SATISFACTORY',
          findings_level: body.findings_level || 'MINOR',
          corrective_action: body.corrective_action || '',
          notes: body.notes || ''
        };

        store.inspections.unshift(newInsp);
        saveStorage(store);

        return {
          success: true,
          inspection_code: inspCode,
          result: newInsp.overall_result,
          message: 'Official FDA Inspection report successfully recorded and added to audit trail.'
        };
      }

      // 10. GET /senior/command-dashboard
      if (endpoint === '/senior/command-dashboard') {
        var kpis = {
          total_establishments: 24536,
          submitted_today: 18752,
          submission_rate: 76.4,
          missed_submissions: 3842,
          high_risk: 1942,
          active_complaints: store.complaints.filter(function (c) { return c.status !== 'RESOLVED'; }).length + 416,
          inspections_this_month: store.inspections.length + 1278,
          overdue_inspections: 215
        };

        var districtData = [
          { id: 'mumbai_city', name: 'Mumbai City', risk: 'HIGH', compliance: 71.2, establishments: 3840, high_risk: 380, complaints: 64, inspections: 184, color: '#EA580C' },
          { id: 'mumbai_sub', name: 'Mumbai Suburban', risk: 'HIGH', compliance: 73.5, establishments: 5210, high_risk: 490, complaints: 88, inspections: 240, color: '#EA580C' },
          { id: 'pune', name: 'Pune', risk: 'MEDIUM', compliance: 84.1, establishments: 4150, high_risk: 210, complaints: 42, inspections: 210, color: '#D97706' },
          { id: 'thane', name: 'Thane', risk: 'CRITICAL', compliance: 68.4, establishments: 2980, high_risk: 340, complaints: 76, inspections: 140, color: '#DC2626' },
          { id: 'nagpur', name: 'Nagpur', risk: 'HIGH', compliance: 74.0, establishments: 1820, high_risk: 165, complaints: 31, inspections: 95, color: '#EA580C' },
          { id: 'nashik', name: 'Nashik', risk: 'CRITICAL', compliance: 66.8, establishments: 1640, high_risk: 195, complaints: 45, inspections: 88, color: '#DC2626' },
          { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar', risk: 'MEDIUM', compliance: 79.2, establishments: 1240, high_risk: 85, complaints: 19, inspections: 64, color: '#D97706' },
          { id: 'kolhapur', name: 'Kolhapur', risk: 'LOW', compliance: 89.6, establishments: 1180, high_risk: 35, complaints: 12, inspections: 78, color: '#15803D' },
          { id: 'solapur', name: 'Solapur', risk: 'MEDIUM', compliance: 76.5, establishments: 940, high_risk: 72, complaints: 18, inspections: 52, color: '#D97706' },
          { id: 'amravati', name: 'Amravati', risk: 'LOW', compliance: 86.2, establishments: 780, high_risk: 28, complaints: 9, inspections: 46, color: '#15803D' }
        ];

        var priorityQueue = store.establishments.map(function (e) {
          return {
            id: e.id,
            establishment_code: e.establishment_code,
            name: e.name,
            district: e.district,
            ward: e.ward,
            risk_level: e.risk_level,
            risk_score: e.risk_score,
            factors_list: e.risk_factors,
            license_status: e.license_status,
            current_rating: e.current_rating,
            assigned_inspector_id: e.assigned_inspector_id,
            last_inspection: 'SATISFACTORY',
            last_activity: 'Evidence submitted today'
          };
        }).sort(function (a, b) { return b.risk_score - a.risk_score; });

        var inspectors = [
          { id: 2, name: 'Inspector Vikram Deshmukh', division: 'Pune', assigned: 14, completed_week: 6, completed_month: 24, pending: 4, overdue: 1, complaints_resolved: 12 },
          { id: 3, name: 'Inspector Ananya Rao', division: 'Mumbai City', assigned: 18, completed_week: 8, completed_month: 31, pending: 5, overdue: 2, complaints_resolved: 19 },
          { id: 4, name: 'Inspector Nilesh Gokhale', division: 'Thane', assigned: 16, completed_week: 5, completed_month: 22, pending: 7, overdue: 3, complaints_resolved: 15 },
          { id: 5, name: 'Inspector Sandeep Tiwari', division: 'Nagpur', assigned: 11, completed_week: 4, completed_month: 18, pending: 3, overdue: 0, complaints_resolved: 9 },
          { id: 6, name: 'Inspector Hemant Shirsath', division: 'Nashik', assigned: 15, completed_week: 5, completed_month: 20, pending: 6, overdue: 2, complaints_resolved: 14 }
        ];

        return {
          kpis: kpis,
          district_data: districtData,
          priority_queue: priorityQueue,
          inspectors: inspectors,
          assignments: store.assignments,
          last_updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' | ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }

      // 11. POST /senior/assign-inspection
      if (endpoint === '/senior/assign-inspection' && method === 'POST') {
        var assignEst = store.establishments.find(function (e) {
          return e.id == body.establishment_id;
        }) || store.establishments[0];

        var newAssignment = {
          id: store.assignments.length + 1,
          establishment_id: assignEst.id,
          establishment_name: assignEst.name,
          district: assignEst.district,
          inspector_id: body.inspector_id || 2,
          priority: body.priority || 'HIGH',
          deadline_date: body.deadline_date || '2026-09-22',
          status: 'ASSIGNED',
          notes: body.notes || 'Routine high priority inspection dispatch.',
          created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        store.assignments.unshift(newAssignment);
        saveStorage(store);

        return {
          success: true,
          assignment_id: newAssignment.id,
          message: 'Inspection order formally assigned to division field officer.'
        };
      }

      // 12. GET /reports
      if (endpoint.startsWith('/reports')) {
        var rType = 'compliance';
        var rm = endpoint.match(/type=([^&]*)/);
        if (rm) rType = decodeURIComponent(rm[1]);

        var records = [];
        if (rType === 'inspections') {
          records = store.inspections.map(function (i) {
            var e = store.establishments.find(function (est) { return est.id == i.establishment_id; }) || {};
            return Object.assign({}, i, { establishment_name: e.name || 'Establishment', district: e.district || 'Maharashtra' });
          });
        } else if (rType === 'complaints') {
          records = store.complaints;
        } else if (rType === 'audit') {
          records = [
            { id: 101, action: 'Inspection Order Dispatched', actor: 'Dr. Rajesh Patil (Joint Commissioner)', entity_type: 'ASSIGNMENT', entity_id: 1, created_at: '16 Sep 2026, 10:00 AM' },
            { id: 102, action: 'Citizen Complaint Triaged', actor: 'District Cell Officer', entity_type: 'COMPLAINT', entity_id: 142, created_at: '15 Sep 2026, 08:20 PM' },
            { id: 103, action: 'Daily Compliance Batch Sealed', actor: 'System Verification Engine', entity_type: 'COMPLIANCE', entity_id: 781, created_at: '15 Sep 2026, 12:00 PM' }
          ];
        } else {
          records = store.establishments;
        }

        return {
          type: rType,
          count: records.length,
          records: records,
          generated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }

      return { message: 'OK', endpoint: endpoint };
    }
  };

  global.MFTM_STANDALONE_API = StandaloneAPI;
})(window);
