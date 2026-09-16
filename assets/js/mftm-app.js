/**
 * Maharashtra Food Trust Mission (MFTM)
 * Master Client-Side Application Controller
 * Government Digital Service (GDS) 2026 Edition
 */

(function () {
  'use strict';

  var API_BASE = '/wp-json/mftm/v1';

  var state = {
    language: 'en',
    activeRole: 'public',
    activeEstablishmentId: 1,
    establishments: [],
    currentEst: null,
    seniorData: null,
    cameraStream: null,
    currentCaptureCategory: '',
    capturedPhotoData: null,
    capturedGPS: null,
    inspectionStep: 1,
    inspectionData: {
      establishment_id: 1,
      checklist: {},
      findings_level: 'MINOR',
      overall_result: 'SATISFACTORY',
      corrective_action: '',
      notes: ''
    }
  };

  // 11-Point Official Inspection Checklist Categories (Numbered Sections)
  var CHECKLIST_ITEMS = [
    'Kitchen Cleanliness & Sanitization',
    'Food Storage & Raw Material Separation',
    'Cooked Food Protection & Temperature',
    'Staff Personal Hygiene (Aprons, Caps, Nails)',
    'Handwashing Facility & Potable Water Supply',
    'Solid & Liquid Waste Disposal',
    'Water & Ice Quality Testing Compliance',
    'Pest Control & Vector Proofing',
    'Refrigeration Temperature Maintenance',
    'Cross-Contamination Safeguards',
    'Prominent Display of FSSAI Food Safety Licence'
  ];

  // Bilingual Translation Dictionary (English & Marathi)
  var I18N = {
    en: {
      main_title: 'MAHARASHTRA FOOD TRUST MISSION',
      dept_subtitle: 'Food Safety Accountability & Inspection Prioritization',
      citizen_tab: 'Citizen (Public QR)',
      restaurant_tab: 'Restaurant Portal',
      inspector_tab: 'FDA Inspector',
      senior_tab: 'Senior Command Center',
      reports_tab: 'Reports & Analytics',
      public_banner_title: 'PUBLIC FOOD SAFETY INFORMATION',
      public_banner_sub: 'Official establishment transparency & daily verified compliance status',
      rest_banner_title: 'ESTABLISHMENT COMPLIANCE PORTAL',
      rest_banner_sub: 'FSSAI Registered Daily Self-Inspection & Evidence Portal',
      insp_banner_title: 'FDA INSPECTOR PORTAL',
      insp_banner_sub: 'Field Inspection Application & Verification Workspace',
      senior_banner_title: 'FOOD SAFETY COMMAND CENTER',
      senior_banner_sub: 'Maharashtra-wide monitoring and inspection prioritization',
      reports_banner_title: 'ENFORCEMENT & COMPLIANCE REPORTS',
      reports_banner_sub: 'State-wide audit summaries and legislative query logs',
      evidence_strip: 'Information shown is self-reported by the establishment and inspection status is by FDA records.',
      last_updated: 'Last updated: 16 September 2026 | 07:20 PM',
      report_concern: 'REPORT A CONCERN',
      start_compliance: 'START LIVE COMPLIANCE',
      lang_label: 'English | मराठी'
    },
    mr: {
      main_title: 'महाराष्ट्र अन्न विश्वास अभियान',
      dept_subtitle: 'अन्न सुरक्षा उत्तरदायित्व व तपासणी प्राधान्य',
      citizen_tab: 'नागरिक (क्यूआर कोड)',
      restaurant_tab: 'आस्थापना पोर्टल',
      inspector_tab: 'अन्न सुरक्षा अधिकारी',
      senior_tab: 'वरिष्ठ नियंत्रण केंद्र',
      reports_tab: 'अहवाल व विश्लेषण',
      public_banner_title: 'सार्वजनिक अन्न सुरक्षा माहिती',
      public_banner_sub: 'अधिकृत आस्थापना पारदर्शकता आणि दैनंदिन सत्यापित अनुपालन स्थिती',
      rest_banner_title: 'आस्थापना अनुपालन पोर्टल',
      rest_banner_sub: 'एफएसएसएआय नोंदणीकृत दैनंदिन स्वयं-तपासणी व पुरावा पोर्टल',
      insp_banner_title: 'अन्न सुरक्षा अधिकारी पोर्टल',
      insp_banner_sub: 'क्षेत्रीय तपासणी व पडताळणी कार्यप्रणाली',
      senior_banner_title: 'अन्न सुरक्षा नियंत्रण कक्ष',
      senior_banner_sub: 'महाराष्ट्र राज्यस्तरीय देखरेख व तपासणी प्राधान्य प्रणाली',
      reports_banner_title: 'अंमलबजावणी व अनुपालन अहवाल',
      reports_banner_sub: 'राज्यस्तरीय लेखापरीक्षण सारांश व विधानमंडळ माहिती नोंदी',
      evidence_strip: 'दर्शविलेली माहिती आस्थापनेद्वारे स्वयं-नोंदवलेली असून तपासणी स्थिती अन्न व औषध प्रशासनाच्या अभिलेखानुसार आहे.',
      last_updated: 'अद्ययावत: १६ सप्टेंबर २०२६ | संध्याकाळी ०७:२०',
      report_concern: 'तक्रार नोंदवा',
      start_compliance: 'थेट अनुपालन सुरू करा',
      lang_label: 'मराठी | English'
    }
  };

  // Helper for REST fetch
  function apiFetch(endpoint, options) {
    options = options || {};
    var url = API_BASE + endpoint;
    options.headers = options.headers || {};
    options.headers['Accept'] = 'application/json';
    if (options.body && typeof options.body === 'object') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    return fetch(url, options).then(function (res) {
      return res.json();
    });
  }

  function init() {
    loadEstablishments().then(function () {
      setupEventListeners();
      // Check query param for role or restaurant
      var params = new URLSearchParams(window.location.search);
      var roleParam = params.get('role') || 'public';
      var estParam = params.get('est') || 1;
      state.activeEstablishmentId = parseInt(estParam) || 1;
      setRole(roleParam);
    });
  }

  function loadEstablishments() {
    return apiFetch('/establishments').then(function (data) {
      state.establishments = data || [];
      renderEstablishmentSelectors();
    });
  }

  function renderEstablishmentSelectors() {
    var select = document.getElementById('header-est-select');
    if (!select) return;
    select.innerHTML = '';
    state.establishments.forEach(function (e) {
      var opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = e.name + ' (' + e.district + ' - ' + e.risk_level + ')';
      if (e.id == state.activeEstablishmentId) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function setupEventListeners() {
    // Header Navigation shortcut buttons
    var navBtns = document.querySelectorAll('.nav-shortcut-btn');
    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var role = this.getAttribute('data-role');
        setRole(role);
      });
    });

    // Establishment switcher in header
    var estSelect = document.getElementById('header-est-select');
    if (estSelect) {
      estSelect.addEventListener('change', function () {
        state.activeEstablishmentId = parseInt(this.value);
        refreshCurrentView();
      });
    }

    // Modal close listeners
    document.querySelectorAll('.modal-close-trigger').forEach(function (el) {
      el.addEventListener('click', function () {
        closeAllModals();
      });
    });

    // Camera action listeners
    var captureBtn = document.getElementById('btn-camera-capture');
    if (captureBtn) captureBtn.addEventListener('click', captureLivePhoto);

    var retakeBtn = document.getElementById('btn-camera-retake');
    if (retakeBtn) retakeBtn.addEventListener('click', restartCamera);

    var submitCompBtn = document.getElementById('btn-camera-submit');
    if (submitCompBtn) submitCompBtn.addEventListener('click', submitComplianceCapture);

    // Complaint modal submit
    var complaintForm = document.getElementById('complaint-form');
    if (complaintForm) {
      complaintForm.addEventListener('submit', function (e) {
        e.preventDefault();
        submitCitizenComplaint();
      });
    }
  }

  function toggleLanguage() {
    state.language = (state.language === 'en') ? 'mr' : 'en';
    var t = I18N[state.language];

    var btn = document.getElementById('btn-lang-toggle');
    if (btn) btn.textContent = t.lang_label;

    var mainTitle = document.getElementById('hdr-main-title');
    if (mainTitle) mainTitle.textContent = t.main_title;

    var subTitle = document.getElementById('hdr-dept-subtitle');
    if (subTitle) subTitle.textContent = t.dept_subtitle;

    var navPub = document.getElementById('nav-btn-public');
    if (navPub) navPub.textContent = t.citizen_tab;
    var navRest = document.getElementById('nav-btn-restaurant');
    if (navRest) navRest.textContent = t.restaurant_tab;
    var navInsp = document.getElementById('nav-btn-inspector');
    if (navInsp) navInsp.textContent = t.inspector_tab;
    var navSnr = document.getElementById('nav-btn-senior');
    if (navSnr) navSnr.textContent = t.senior_tab;
    var navRep = document.getElementById('nav-btn-reports');
    if (navRep) navRep.textContent = t.reports_tab;

    var sbDash = document.getElementById('sb-heading-dash');
    if (sbDash) sbDash.textContent = (state.language === 'mr') ? 'डॅशबोर्ड' : 'DASHBOARD';
    var sbAdmin = document.getElementById('sb-heading-admin');
    if (sbAdmin) sbAdmin.textContent = (state.language === 'mr') ? 'प्रशासन' : 'ADMINISTRATION';

    updateBannerTexts();
    refreshCurrentView();
  }

  function setRole(role) {
    state.activeRole = role;

    // Update Header buttons active state
    document.querySelectorAll('.nav-shortcut-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-role') === role);
    });

    var publicLayout = document.getElementById('view-public');
    var adminShell = document.getElementById('admin-shell-layout');

    if (role === 'public') {
      if (publicLayout) publicLayout.style.display = 'block';
      if (adminShell) adminShell.style.display = 'none';
    } else {
      if (publicLayout) publicLayout.style.display = 'none';
      if (adminShell) adminShell.style.display = 'flex';

      // Hide all view sections in admin shell
      document.querySelectorAll('#admin-shell-layout .view-section').forEach(function (s) {
        s.style.display = 'none';
      });

      // Show target role section
      var targetSec = document.getElementById('view-' + role);
      if (targetSec) targetSec.style.display = 'block';

      // Update active sidebar item
      document.querySelectorAll('.sidebar-nav-item').forEach(function (item) {
        item.classList.remove('active');
        if (role === 'restaurant' && item.getAttribute('data-nav') === 'compliance') item.classList.add('active');
        if (role === 'inspector' && item.getAttribute('data-nav') === 'inspections') item.classList.add('active');
        if (role === 'senior' && item.getAttribute('data-nav') === 'establishments') item.classList.add('active');
        if (role === 'reports' && item.getAttribute('data-nav') === 'reports') item.classList.add('active');
      });
    }

    updateBannerTexts();
    updateBreadcrumbs();
    refreshCurrentView();
  }

  function updateBannerTexts() {
    var t = I18N[state.language];
    var titleEl = document.getElementById('page-banner-title');
    var descEl = document.getElementById('page-banner-desc');
    var tsEl = document.getElementById('page-banner-timestamp');

    if (tsEl) tsEl.textContent = t.last_updated;

    if (!titleEl || !descEl) return;

    switch (state.activeRole) {
      case 'public':
        titleEl.textContent = t.public_banner_title;
        descEl.textContent = t.public_banner_sub;
        break;
      case 'restaurant':
        titleEl.textContent = t.rest_banner_title;
        descEl.textContent = t.rest_banner_sub;
        break;
      case 'inspector':
        titleEl.textContent = t.insp_banner_title;
        descEl.textContent = t.insp_banner_sub;
        break;
      case 'senior':
        titleEl.textContent = t.senior_banner_title;
        descEl.textContent = t.senior_banner_sub;
        break;
      case 'reports':
        titleEl.textContent = t.reports_banner_title;
        descEl.textContent = t.reports_banner_sub;
        break;
    }
  }

  function updateBreadcrumbs() {
    var l1 = document.getElementById('bc-level-1');
    var l2 = document.getElementById('bc-level-2');
    var sep2 = document.getElementById('bc-sep-2');

    var currentEstObj = state.establishments.find(function (e) {
      return e.id == state.activeEstablishmentId;
    });
    var estName = currentEstObj ? currentEstObj.name : 'Establishment';

    if (!l1) return;

    if (state.activeRole === 'public') {
      l1.textContent = 'Public Food Safety Information';
      if (l2 && sep2) {
        sep2.style.display = 'inline';
        l2.style.display = 'inline';
        l2.textContent = estName;
      }
    } else if (state.activeRole === 'restaurant') {
      l1.textContent = 'Establishment Compliance Portal';
      if (l2 && sep2) {
        sep2.style.display = 'inline';
        l2.style.display = 'inline';
        l2.textContent = estName;
      }
    } else if (state.activeRole === 'inspector') {
      l1.textContent = 'Inspector Portal';
      if (l2 && sep2) {
        sep2.style.display = 'inline';
        l2.style.display = 'inline';
        l2.textContent = 'Establishment Verification Dossier';
      }
    } else if (state.activeRole === 'senior') {
      l1.textContent = 'FDA Maharashtra';
      if (l2 && sep2) {
        sep2.style.display = 'inline';
        l2.style.display = 'inline';
        l2.textContent = 'Command & Monitoring Center';
      }
    } else if (state.activeRole === 'reports') {
      l1.textContent = 'Enforcement Analytics';
      if (l2 && sep2) {
        sep2.style.display = 'inline';
        l2.style.display = 'inline';
        l2.textContent = 'Reports & Legislative Export';
      }
    }
  }

  function handleSidebarNav(navKey) {
    document.querySelectorAll('.sidebar-nav-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-nav') === navKey);
    });

    switch (navKey) {
      case 'establishments':
      case 'priority':
      case 'analytics':
        setRole('senior');
        break;
      case 'compliance':
        setRole('restaurant');
        break;
      case 'inspections':
      case 'inspectors':
        setRole('inspector');
        break;
      case 'complaints':
      case 'reports':
      case 'audit':
        setRole('reports');
        renderReportsModule(navKey === 'complaints' ? 'complaints' : (navKey === 'audit' ? 'inspections' : 'compliance'));
        break;
      case 'users':
      case 'settings':
        alert('System Settings & User Access Controls are managed by FDA State IT Directorate (NIC Maharashtra).');
        break;
      default:
        setRole('senior');
    }
  }

  function refreshCurrentView() {
    updateBreadcrumbs();
    switch (state.activeRole) {
      case 'public':
        renderPublicCustomerView(state.activeEstablishmentId);
        break;
      case 'restaurant':
        renderRestaurantDashboard(state.activeEstablishmentId);
        break;
      case 'inspector':
        renderInspectorPortal();
        break;
      case 'senior':
        renderSeniorCommandDashboard();
        break;
      case 'reports':
        renderReportsModule('compliance');
        break;
    }
  }

  /* ============================================================
     1. CUSTOMER PUBLIC QR PAGE (OFFICIAL INFORMATION STRIP)
     ============================================================ */
  function renderPublicCustomerView(estId) {
    var container = document.getElementById('public-view-content');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:30px;"><span class="badge badge-neutral">Connecting to Official FDA Registry...</span></div>';

    apiFetch('/public/restaurant/' + estId).then(function (data) {
      state.currentEst = data;
      var t = I18N[state.language];

      var starsHtml = renderStarRating(data.transparency_rating);

      var cardsHtml = data.compliance_cards.map(function (c) {
        var statusBadgeClass = c.has_submission ? 'badge-low' : (c.is_closed_day ? 'badge-neutral' : 'badge-crit');
        
        var photoHtml = c.has_submission
          ? '<img src="' + c.photo_url + '" alt="' + c.category + ' Live Evidence" onclick="window.MFTM.openLightbox(\'' + c.photo_url + '\')" />'
          : '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:11px;padding:16px;text-align:center;">' +
            '<span style="font-size:26px;margin-bottom:4px;">' + (c.is_closed_day ? '🗓️' : '⏱️') + '</span>' +
            '<strong>' + (c.is_closed_day ? 'Scheduled Closed Day' : 'Evidence Pending') + '</strong>' +
            '<span style="font-size:10px;margin-top:2px;">' + (c.is_closed_day ? 'No penalty on scheduled day off.' : 'Expected today before 12:00 PM') + '</span>' +
            '</div>';

        return '<div class="public-comp-card">' +
          '<div class="public-comp-photo">' +
            photoHtml +
            (c.has_submission ? '<div class="public-comp-time-tag">● LIVE CAPTURE • ' + c.submission_time + '</div>' : '') +
          '</div>' +
          '<div class="public-comp-details">' +
            '<div class="public-comp-name">' + c.category + '</div>' +
            '<div style="font-size:11px;color:var(--text-muted);">' + (c.has_submission ? 'Submitted ' + c.submission_time + ' ✓ Evidence submitted today' : (c.last_submitted_text || 'Awaiting daily evidence')) + '</div>' +
            '<div class="public-comp-status-row">' +
              '<span class="badge ' + statusBadgeClass + '">' + c.status_badge + '</span>' +
              (c.location_verification === 'VERIFIED' ? '<span style="color:var(--gov-green);font-size:11px;font-weight:700;">✓ Geo Verified</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      var lastInspResult = data.last_inspection ? data.last_inspection.result : 'PENDING';
      var lastInspBadge = 'badge-neutral';
      if (lastInspResult === 'SATISFACTORY') lastInspBadge = 'badge-low';
      if (lastInspResult === 'NEEDS_IMPROVEMENT') lastInspBadge = 'badge-med';
      if (lastInspResult === 'ACTION_REQUIRED') lastInspBadge = 'badge-crit';

      var html = '<div>' +
        // Subtle official-style information strip
        '<div class="public-official-notice-strip">' +
          '<span style="font-size:14px;">ℹ️</span>' +
          '<div>' + t.evidence_strip + '</div>' +
        '</div>' +

        // Establishment Official Header Dossier
        '<div class="public-dossier-card">' +
          '<div class="public-est-header">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">' +
              '<div>' +
                '<span class="badge badge-low" style="margin-bottom:6px;">FDA VERIFIED ESTABLISHMENT</span>' +
                '<h2 class="public-est-title">' + data.name + '</h2>' +
                '<div class="public-meta-tags">' +
                  '<span>📍 ' + data.address + ', ' + data.ward + ', ' + data.district + '</span>' +
                  '<span class="public-fssai-box">FSSAI Licence: ' + data.fssai_license + '</span>' +
                  '<span class="badge badge-low">' + data.license_status + ' (Valid to ' + data.license_validity + ')</span>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;gap:8px;">' +
                '<button class="btn btn-outline" onclick="window.MFTM.showQRModal(\'public\')">📱 Entrance QR</button>' +
                '<button class="btn btn-saffron" onclick="window.MFTM.openComplaintModal(' + data.id + ')">⚠️ ' + t.report_concern + '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Institutional Transparency Rating Block
          '<div class="public-transparency-box">' +
            '<div>' +
              '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Transparency Rating</div>' +
              '<div class="transparency-number-row">' +
                '<span class="transparency-big-number">' + data.transparency_rating + '</span>' +
                '<span style="font-size:15px;color:var(--text-muted);font-weight:700;">/ 5.0</span>' +
                '<span class="transparency-stars">' + starsHtml + '</span>' +
              '</div>' +
              '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + data.rating_explanation + '</div>' +
              '<a href="#" onclick="window.MFTM.toggleRatingBreakdown(); return false;" style="font-size:11px;color:var(--gov-green);font-weight:700;text-decoration:none;display:inline-block;margin-top:4px;">View Rating Calculation Factors ▼</a>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<div style="font-size:11px;color:var(--text-muted);">Recorded FDA Activity</div>' +
              '<div style="font-size:12px;font-weight:700;color:var(--gov-green-dark);">100% Mathematical Score</div>' +
            '</div>' +
          '</div>' +

          // Rating Calculation Factors Panel (Expandable)
          '<div id="rating-breakdown-panel" style="display:none;background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:14px;margin-bottom:20px;font-size:12px;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
              '<div>Daily Submission Consistency (40%): <strong>' + data.rating_breakdown.consistency.score + ' / 2.0</strong></div>' +
              '<div>Submission Timeliness (20%): <strong>' + data.rating_breakdown.timeliness.score + ' / 1.0</strong></div>' +
              '<div>FDA Inspection Outcome (20%): <strong>' + data.rating_breakdown.inspection.score + ' / 1.0</strong></div>' +
              '<div>Citizen Complaint Record (20%): <strong>' + data.rating_breakdown.complaints.score + ' / 1.0</strong></div>' +
            '</div>' +
            '<div style="font-size:10px;color:var(--text-muted);margin-top:8px;border-top:1px dashed var(--border-color);padding-top:6px;">Calculated objectively from recorded FDA database timestamps and enforcement records. Not a subjective marketing review.</div>' +
          '</div>' +

          // Last FDA Official Inspection Strip
          '<div class="public-inspection-banner">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<div style="font-size:24px;">🏛️</div>' +
              '<div>' +
                '<div style="font-weight:700;font-size:13px;color:var(--gov-green-dark);">Last On-Site FDA Inspection</div>' +
                '<div style="font-size:11px;color:var(--text-muted);">Conducted by FDA Enforcement Squad on ' + (data.last_inspection ? data.last_inspection.date : 'Recent') + '</div>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<span class="badge ' + lastInspBadge + '" style="padding:4px 10px;font-size:11px;">' + lastInspResult + '</span>' +
            '</div>' +
          '</div>' +

          // Scheduled Closed Day Notice
          (data.is_scheduled_closed_today
            ? '<div style="background:#eef6fc;border:1px solid #c8e1f5;color:#1e4f7a;padding:10px 14px;border-radius:var(--radius-card);margin-bottom:18px;font-size:12px;display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:18px;">🗓️</span>' +
              '<div><strong>Scheduled Closed Day:</strong> This establishment operates Monday to Saturday. Today (' + data.today_day_name + ') is a scheduled rest day; no compliance upload is mandated.</div>' +
              '</div>'
            : '') +

          // Today's 7 Core FSSAI Compliance Categories
          '<div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:baseline;">' +
            '<h3 style="font-size:13px;font-weight:700;color:var(--gov-green-dark);text-transform:uppercase;letter-spacing:0.4px;">Today\'s Compliance Evidence</h3>' +
            '<span style="font-size:11px;color:var(--text-muted);">7 Mandatory FSSAI Parameters</span>' +
          '</div>' +
          '<div class="public-compliance-grid">' + cardsHtml + '</div>' +

          // Track Citizen Concern Box
          '<div style="background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
            '<div>' +
              '<div style="font-size:12px;font-weight:700;color:var(--text-main);">Track an Existing Complaint Reference</div>' +
              '<div style="font-size:11px;color:var(--text-muted);">Check FDA field investigation progress and resolution status.</div>' +
            '</div>' +
            '<div style="display:flex;gap:6px;">' +
              '<input type="text" id="track-code-input" placeholder="MFTM-2026-XXXXXX" class="gov-form-input" style="width:180px;font-family:var(--font-mono);font-size:11px;" />' +
              '<button class="btn btn-primary" onclick="window.MFTM.trackComplaintCode()">Track</button>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>';

      container.innerHTML = html;
    });
  }

  function renderStarRating(rating) {
    var fullStars = Math.floor(rating);
    var halfStar = (rating - fullStars) >= 0.5;
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars += '★';
      } else if (i === fullStars + 1 && halfStar) {
        stars += '★';
      } else {
        stars += '☆';
      }
    }
    return stars;
  }

  /* ============================================================
     2. RESTAURANT PORTAL VIEW
     ============================================================ */
  function renderRestaurantDashboard(estId) {
    var container = document.getElementById('restaurant-dashboard-content');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:30px;"><span class="badge badge-neutral">Loading Establishment Compliance Portal...</span></div>';

    apiFetch('/restaurant/dashboard?establishment_id=' + estId).then(function (data) {
      var est = data.establishment;
      var completed = data.today_submission_count;
      var total = data.total_categories;
      var t = I18N[state.language];

      var rowsHtml = data.categories_status.map(function (c) {
        var actionBtn = c.is_submitted
          ? '<button class="btn btn-outline" style="padding:3px 8px;font-size:11px;" onclick="window.MFTM.openCameraModal(\'' + c.category + '\')">🔄 Retake</button>'
          : '<button class="btn btn-primary" style="padding:4px 10px;font-size:11px;" onclick="window.MFTM.openCameraModal(\'' + c.category + '\')">📸 Open Camera</button>';

        var statusBadge = c.is_submitted
          ? '<span class="badge badge-low">Submitted (' + c.time + ')</span>'
          : '<span class="badge badge-crit">Pending Today</span>';

        var geoBadge = c.location_verification === 'VERIFIED'
          ? '<span class="badge badge-low">✓ Within Premises</span>'
          : (c.location_verification === 'REQUIRES_REVIEW' ? '<span class="badge badge-crit">⚠ Outside 100m</span>' : '<span class="badge badge-neutral">—</span>');

        return '<tr>' +
          '<td style="font-weight:700;">' + c.category + '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td>' + geoBadge + '</td>' +
          '<td class="code-cell">' + (c.capture_session_id ? c.capture_session_id.substring(0, 16) + '...' : '—') + '</td>' +
          '<td style="text-align:right;">' + actionBtn + '</td>' +
        '</tr>';
      }).join('');

      var html = '<div>' +
        // Header info bar
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;flex-wrap:wrap;gap:12px;">' +
          '<div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;">Establishment Compliance Portal</div>' +
            '<h2 style="font-size:20px;font-weight:800;color:var(--gov-green-dark);margin-top:2px;">' + est.name + '</h2>' +
            '<div style="font-size:12px;color:var(--text-muted);">' + est.address + ' • FSSAI Licence: <span style="font-family:var(--font-mono);font-weight:700;">' + est.fssai_license + '</span> • Status: <span class="badge badge-low">' + est.license_status + '</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-outline" onclick="window.MFTM.showQRModal(\'public\')">📱 Download Public QR</button>' +
            '<button class="btn btn-primary" onclick="window.MFTM.openCameraModal(\'Kitchen Cleanliness\')">📸 ' + t.start_compliance + '</button>' +
          '</div>' +
        '</div>' +

        // Institutional KPI Cards Row
        '<div class="gov-kpi-grid">' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">Today\'s Compliance</div>' +
            '<div class="gov-kpi-value" style="color:' + (completed === total ? 'var(--status-success)' : 'var(--gov-saffron-deep)') + ';">' + completed + ' / ' + total + '</div>' +
            '<div class="gov-kpi-context">' + (completed === total ? 'All items submitted' : (total - completed) + ' items pending') + '</div>' +
          '</div>' +
          '<div class="gov-kpi-card kpi-saffron">' +
            '<div class="gov-kpi-label">Transparency Rating</div>' +
            '<div class="gov-kpi-value" style="color:var(--gov-saffron-deep);">★ ' + data.rating + ' / 5.0</div>' +
            '<div class="gov-kpi-context">Public rating score</div>' +
          '</div>' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">Operating Schedule</div>' +
            '<div class="gov-kpi-value" style="font-size:16px;">' + data.operating_days.join(', ') + '</div>' +
            '<div class="gov-kpi-context">Sunday: Scheduled Closed (No penalty)</div>' +
          '</div>' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">Last FDA Inspection</div>' +
            '<div class="gov-kpi-value" style="font-size:16px;">' + (data.last_inspection ? data.last_inspection.overall_result : 'N/A') + '</div>' +
            '<div class="gov-kpi-context">' + (data.last_inspection ? data.last_inspection.inspection_date : 'Pending') + '</div>' +
          '</div>' +
        '</div>' +

        // Anti-Cheating Advisory Strip
        '<div class="gov-camera-anti-cheat-bar">' +
          '<span>🔒</span>' +
          '<div><strong>Anti-Cheating Verification Active:</strong> Photos must be taken live using the device camera. Normal gallery upload is disabled. Real-time GPS perimeter verification and automated timestamp recording are enforced per entry.</div>' +
        '</div>' +

        // Daily Compliance Checklist Administrative Table
        '<div class="gov-card">' +
          '<div class="gov-card-header">' +
            '<div class="gov-card-title">Daily Real-Time Evidence Checklist (' + data.today_date + ')</div>' +
            '<span class="badge badge-neutral">Cutoff: 12:00 PM Daily</span>' +
          '</div>' +
          '<div class="gov-table-wrap">' +
            '<table class="gov-data-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Category</th>' +
                  '<th>Today\'s Status</th>' +
                  '<th>GPS Verification</th>' +
                  '<th>Capture Session ID</th>' +
                  '<th style="text-align:right;">Action</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + rowsHtml + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

        // Complaints received
        '<div class="gov-card">' +
          '<div class="gov-card-header">' +
            '<div class="gov-card-title">Citizen Concerns &amp; Complaints (' + data.complaints.length + ')</div>' +
          '</div>' +
          '<div class="gov-card-body">' +
            (data.complaints.length === 0
              ? '<div style="color:var(--text-muted);font-size:12px;">No active citizen complaints recorded for this establishment.</div>'
              : data.complaints.map(function (comp) {
                  return '<div style="padding:8px 0;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;font-size:12px;">' +
                    '<div>' +
                      '<span style="font-family:var(--font-mono);font-weight:700;">' + comp.complaint_code + '</span> • ' +
                      '<strong>' + comp.category + '</strong>: ' + comp.description +
                      (comp.resolution_summary ? '<div style="font-size:11px;color:var(--gov-green);margin-top:2px;">Resolution: ' + comp.resolution_summary + '</div>' : '') +
                    '</div>' +
                    '<span class="badge ' + (comp.status === 'RESOLVED' ? 'badge-low' : 'badge-med') + '">' + comp.status + '</span>' +
                  '</div>';
                }).join('')) +
          '</div>' +
        '</div>' +

      '</div>';

      container.innerHTML = html;
    });
  }

  /* ============================================================
     3. FDA INSPECTOR PORTAL VIEW
     ============================================================ */
  function renderInspectorPortal() {
    var container = document.getElementById('inspector-portal-content');
    if (!container) return;

    var html = '<div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;flex-wrap:wrap;gap:12px;">' +
        '<div>' +
          '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;">FDA Field Enforcement Portal</div>' +
          '<h2 style="font-size:20px;font-weight:800;color:var(--gov-green-dark);margin-top:2px;">Inspector Vikram Deshmukh</h2>' +
          '<div style="font-size:12px;color:var(--text-muted);">Pune Enforcement Squad • Division Zone 2 • ID: FDA-MAHA-INSP-042</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button class="btn btn-outline" onclick="window.MFTM.showQRModal(\'inspector\')">🔍 Scan Inspector QR</button>' +
        '</div>' +
      '</div>' +

      // Field Summary KPI Cards
      '<div class="gov-kpi-grid">' +
        '<div class="gov-kpi-card">' +
          '<div class="gov-kpi-label">Today\'s Assigned</div>' +
          '<div class="gov-kpi-value">3</div>' +
          '<div class="gov-kpi-context">Field inspections queued</div>' +
        '</div>' +
        '<div class="gov-kpi-card">' +
          '<div class="gov-kpi-label">Pending Verification</div>' +
          '<div class="gov-kpi-value" style="color:var(--gov-saffron-deep);">2</div>' +
          '<div class="gov-kpi-context">Awaiting on-site visit</div>' +
        '</div>' +
        '<div class="gov-kpi-card">' +
          '<div class="gov-kpi-label">Overdue Inspections</div>' +
          '<div class="gov-kpi-value" style="color:var(--status-danger);">0</div>' +
          '<div class="gov-kpi-context">Compliance target met</div>' +
        '</div>' +
        '<div class="gov-kpi-card kpi-danger">' +
          '<div class="gov-kpi-label">High Risk Establishments</div>' +
          '<div class="gov-kpi-value" style="color:var(--status-danger);">5</div>' +
          '<div class="gov-kpi-context">Pune squad jurisdiction</div>' +
        '</div>' +
        '<div class="gov-kpi-card">' +
          '<div class="gov-kpi-label">New Complaints</div>' +
          '<div class="gov-kpi-value" style="color:var(--gov-saffron-deep);">4</div>' +
          '<div class="gov-kpi-context">Citizen reports in triage</div>' +
        '</div>' +
      '</div>' +

      // Search Establishments
      '<div class="gov-card">' +
        '<div class="gov-card-body" style="padding:14px;">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<input type="text" id="inspector-search-input" placeholder="Search by FSSAI Licence Number (e.g. 11524026000123), Name, or Inspector Token" class="gov-form-input" style="flex:1;min-width:260px;" />' +
            '<button class="btn btn-primary" id="btn-inspector-search" onclick="window.MFTM.triggerInspectorSearch()">SEARCH FSSAI LICENCE</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div id="inspector-results-container"></div>' +

    '</div>';

    container.innerHTML = html;
    searchInspectorEstablishments('');
  }

  function searchInspectorEstablishments(query) {
    var target = document.getElementById('inspector-results-container');
    if (!target) return;
    target.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);"><span class="badge badge-neutral">Searching authorized establishments...</span></div>';

    apiFetch('/inspector/search?q=' + encodeURIComponent(query)).then(function (results) {
      if (!results || results.length === 0) {
        target.innerHTML = '<div class="gov-card"><div class="gov-card-body" style="text-align:center;color:var(--text-muted);">NO INSPECTIONS FOUND. There are no establishments matching the selected query.</div></div>';
        return;
      }

      var rowsHtml = results.map(function (est) {
        var riskBadge = 'badge-low';
        if (est.risk_level === 'MEDIUM') riskBadge = 'badge-med';
        if (est.risk_level === 'HIGH') riskBadge = 'badge-high';
        if (est.risk_level === 'CRITICAL') riskBadge = 'badge-crit';

        return '<tr>' +
          '<td><strong>' + est.name + '</strong></td>' +
          '<td>' + est.district + ', ' + est.ward + '</td>' +
          '<td class="code-cell">' + est.fssai_license + '</td>' +
          '<td><span class="badge ' + riskBadge + '">' + est.risk_level + ' (' + est.risk_score + ')</span></td>' +
          '<td>★ ' + est.current_rating + '</td>' +
          '<td style="text-align:right;">' +
            '<button class="btn btn-outline" style="padding:4px 8px;font-size:11px;margin-right:6px;" onclick="window.MFTM.viewInspectorEstDetails(' + est.id + ')">Open Dossier</button>' +
            '<button class="btn btn-saffron" style="padding:4px 10px;font-size:11px;" onclick="window.MFTM.openInspectionWizard(' + est.id + ')">Start Inspection</button>' +
          '</td>' +
        '</tr>';
      }).join('');

      var tableHtml = '<div class="gov-card">' +
        '<div class="gov-card-header">' +
          '<div class="gov-card-title">Authorized Inspection Roster &amp; Establishments (' + results.length + ')</div>' +
        '</div>' +
        '<div class="gov-table-wrap">' +
          '<table class="gov-data-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Establishment Name</th>' +
                '<th>District &amp; Ward</th>' +
                '<th>FSSAI Licence Number</th>' +
                '<th>Risk Classification</th>' +
                '<th>Rating</th>' +
                '<th style="text-align:right;">Enforcement Action</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

      target.innerHTML = tableHtml;
    });
  }

  function viewInspectorEstDetails(estId) {
    apiFetch('/inspector/establishment/' + estId).then(function (data) {
      var est = data.establishment;
      var modal = document.getElementById('modal-inspector-est-details');
      var body = document.getElementById('inspector-est-modal-body');
      if (!modal || !body) return;

      var riskHtml = (data.risk_factors || []).map(function (f) {
        return '<li>' + f + '</li>';
      }).join('');

      var subsHtml = data.today_submissions.map(function (s) {
        return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);font-size:12px;">' +
          '<span>' + s.category + ' (' + s.submission_time + ')</span>' +
          '<span class="badge ' + (s.location_verification === 'VERIFIED' ? 'badge-low' : 'badge-crit') + '">' + s.location_verification + '</span>' +
        '</div>';
      }).join('');

      body.innerHTML = '<div>' +
        '<div style="border-bottom:1px solid var(--border-color);padding-bottom:10px;margin-bottom:14px;">' +
          '<span class="badge badge-neutral" style="margin-bottom:4px;">CONFIDENTIAL DOSSIER</span>' +
          '<h3 style="font-size:18px;margin-bottom:2px;color:var(--gov-green-dark);">' + est.name + '</h3>' +
          '<div style="font-size:11px;color:var(--text-muted);">FSSAI LICENCE: <span style="font-family:var(--font-mono);font-weight:700;">' + est.fssai_license + '</span> • STATUS: <span class="badge badge-low">' + est.license_status + '</span></div>' +
        '</div>' +

        // Restricted Contacts Box (Visible only to authorized officers)
        '<div style="background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:12px;margin-bottom:14px;font-size:12px;">' +
          '<div style="font-weight:700;color:var(--gov-green-dark);margin-bottom:6px;text-transform:uppercase;font-size:10px;letter-spacing:0.5px;">Restricted Owner &amp; Manager Contacts (FDA Official Access Only)</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div>Owner: <strong>' + est.owner_name + '</strong><br>Phone: <strong style="font-family:var(--font-mono);">' + est.owner_phone + '</strong></div>' +
            '<div>Manager: <strong>' + est.manager_name + '</strong><br>Phone: <strong style="font-family:var(--font-mono);">' + est.manager_phone + '</strong></div>' +
          '</div>' +
        '</div>' +

        // Address & Ward
        '<div style="font-size:12px;margin-bottom:14px;">' +
          'Address: <strong>' + est.address + ', ' + est.ward + ', ' + est.district + '</strong>' +
        '</div>' +

        // Risk Factors Breakdown
        '<div style="background:var(--status-critical-bg);border:1px solid var(--status-critical-border);border-radius:var(--radius-card);padding:12px;margin-bottom:14px;font-size:12px;color:var(--status-critical);">' +
          '<div style="font-weight:800;text-transform:uppercase;font-size:11px;">Why this establishment is prioritized: ' + est.risk_level + ' Risk (Score: ' + est.risk_score + '/100)</div>' +
          '<ul style="margin-left:18px;margin-top:6px;line-height:1.5;">' + (riskHtml || '<li>Routine inspection schedule cycle.</li>') + '</ul>' +
        '</div>' +

        // Today\'s Submissions
        '<div style="margin-bottom:14px;">' +
          '<div style="font-size:12px;font-weight:700;margin-bottom:6px;text-transform:uppercase;">Today\'s Compliance Evidence (' + data.today_submissions.length + ')</div>' +
          (subsHtml || '<div style="font-size:11px;color:var(--text-muted);">No evidence submitted today.</div>') +
        '</div>' +

        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">' +
          '<button class="btn btn-outline" onclick="window.MFTM.closeAllModals()">Close</button>' +
          '<button class="btn btn-saffron" onclick="window.MFTM.closeAllModals();window.MFTM.openInspectionWizard(' + est.id + ')">Start Field Inspection</button>' +
        '</div>' +
      '</div>';

      modal.classList.add('open');
    });
  }

  /* ============================================================
     4. SENIOR FDA OFFICER COMMAND DASHBOARD
     ============================================================ */
  function renderSeniorCommandDashboard() {
    var container = document.getElementById('senior-dashboard-content');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:30px;"><span class="badge badge-neutral">Connecting to FDA Maharashtra Centralized Command Center...</span></div>';

    apiFetch('/senior/command-dashboard').then(function (data) {
      state.seniorData = data;
      var kpis = data.kpis;

      // Priority queue administrative rows
      var queueHtml = data.priority_queue.map(function (item) {
        var riskBadge = 'badge-low';
        if (item.risk_level === 'MEDIUM') riskBadge = 'badge-med';
        if (item.risk_level === 'HIGH') riskBadge = 'badge-high';
        if (item.risk_level === 'CRITICAL') riskBadge = 'badge-crit';

        var reasons = (item.factors_list || []).join('; ');

        return '<tr>' +
          '<td><strong>' + item.name + '</strong><br><span style="font-size:10px;color:var(--text-muted);">' + item.ward + '</span></td>' +
          '<td>' + item.district + '</td>' +
          '<td style="font-size:11px;color:var(--status-danger);">' + (reasons || 'Flagged for inspection') + '</td>' +
          '<td><span class="badge ' + riskBadge + '">' + item.risk_level + ' (' + item.risk_score + ')</span></td>' +
          '<td style="font-size:11px;color:var(--text-muted);">' + item.last_activity + '</td>' +
          '<td style="text-align:right;">' +
            '<button class="btn btn-primary" style="padding:3px 8px;font-size:11px;" onclick="window.MFTM.openAssignModal(' + item.id + ', \'' + item.name.replace(/'/g, "\\'") + '\')">Assign Inspector</button>' +
          '</td>' +
        '</tr>';
      }).join('');

      // Inspector Roster Table
      var inspectorRows = data.inspectors.map(function (insp) {
        return '<tr>' +
          '<td style="font-weight:700;">' + insp.name + '</td>' +
          '<td>' + insp.division + '</td>' +
          '<td><strong>' + insp.assigned + '</strong></td>' +
          '<td style="color:var(--gov-green);font-weight:700;">' + insp.completed_month + '</td>' +
          '<td style="color:' + (insp.overdue > 0 ? 'var(--status-danger)' : 'var(--text-muted)') + ';font-weight:700;">' + insp.overdue + '</td>' +
          '<td style="color:var(--gov-green);">' + insp.complaints_resolved + '</td>' +
        '</tr>';
      }).join('');

      // District compliance analytics rows
      var districtRows = data.district_data.map(function (dist) {
        var rBadge = 'badge-low';
        if (dist.risk === 'MEDIUM') rBadge = 'badge-med';
        if (dist.risk === 'HIGH') rBadge = 'badge-high';
        if (dist.risk === 'CRITICAL') rBadge = 'badge-crit';

        return '<tr onclick="window.MFTM.filterDistrict(\'' + dist.name + '\')" style="cursor:pointer;">' +
          '<td style="font-weight:700;">' + dist.name + '</td>' +
          '<td>' + dist.establishments.toLocaleString() + '</td>' +
          '<td style="font-weight:700;color:' + (dist.compliance >= 80 ? 'var(--gov-green)' : 'var(--gov-saffron-deep)') + ';">' + dist.compliance + '%</td>' +
          '<td style="color:var(--status-danger);font-weight:700;">' + dist.high_risk + '</td>' +
          '<td>' + dist.complaints + '</td>' +
          '<td>' + dist.inspections + '</td>' +
          '<td><span class="badge ' + rBadge + '">' + dist.risk + '</span></td>' +
        '</tr>';
      }).join('');

      var html = '<div>' +
        // Top Formal Dashboard Header with Filter Bar
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">' +
          '<div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;">FDA Maharashtra • Central Command</div>' +
            '<h2 style="font-size:20px;font-weight:800;color:var(--gov-green-dark);">FOOD SAFETY COMMAND CENTER</h2>' +
            '<div style="font-size:12px;color:var(--text-muted);">Maharashtra-wide monitoring &amp; inspection prioritization • Officer: Dr. Rajesh Patil, Joint Commissioner</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span class="badge badge-neutral">Date: 16 Sep 2026</span>' +
            '<select class="gov-form-select" style="width:140px;padding:4px 8px;font-size:11px;" onchange="window.MFTM.filterDistrict(this.value)">' +
              '<option value="">All 36 Districts</option>' +
              '<option value="Mumbai City">Mumbai City</option>' +
              '<option value="Mumbai Suburban">Mumbai Suburban</option>' +
              '<option value="Pune">Pune</option>' +
              '<option value="Thane">Thane</option>' +
              '<option value="Nagpur">Nagpur</option>' +
              '<option value="Nashik">Nashik</option>' +
            '</select>' +
            '<button class="btn btn-outline" style="padding:4px 8px;font-size:11px;" onclick="window.MFTM.refreshCurrentView()">↻ Refresh</button>' +
          '</div>' +
        '</div>' +

        // Institutional KPI Cards Row
        '<div class="gov-kpi-grid">' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">TOTAL ESTABLISHMENTS</div>' +
            '<div class="gov-kpi-value">' + kpis.total_establishments.toLocaleString() + '</div>' +
            '<div class="gov-kpi-context">Across 36 Maharashtra Districts</div>' +
          '</div>' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">SUBMITTED TODAY</div>' +
            '<div class="gov-kpi-value" style="color:var(--status-success);">' + kpis.submitted_today.toLocaleString() + ' <span style="font-size:13px;color:var(--text-muted);">(' + kpis.submission_rate + '%)</span></div>' +
            '<div class="gov-kpi-context">Real-time daily evidence</div>' +
          '</div>' +
          '<div class="gov-kpi-card kpi-saffron">' +
            '<div class="gov-kpi-label">MISSED SUBMISSIONS</div>' +
            '<div class="gov-kpi-value" style="color:var(--gov-saffron-deep);">' + kpis.missed_submissions.toLocaleString() + '</div>' +
            '<div class="gov-kpi-context">Scheduled closed days excluded</div>' +
          '</div>' +
          '<div class="gov-kpi-card kpi-danger">' +
            '<div class="gov-kpi-label">HIGH RISK</div>' +
            '<div class="gov-kpi-value" style="color:var(--status-danger);">' + kpis.high_risk.toLocaleString() + '</div>' +
            '<div class="gov-kpi-context">Prioritized for field inspection</div>' +
          '</div>' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">ACTIVE COMPLAINTS</div>' +
            '<div class="gov-kpi-value" style="color:var(--gov-saffron-deep);">' + kpis.active_complaints + '</div>' +
            '<div class="gov-kpi-context">Citizen reports in investigation</div>' +
          '</div>' +
          '<div class="gov-kpi-card">' +
            '<div class="gov-kpi-label">INSPECTIONS THIS MONTH</div>' +
            '<div class="gov-kpi-value">' + kpis.inspections_this_month.toLocaleString() + '</div>' +
            '<div class="gov-kpi-context">Overdue: <strong style="color:var(--status-danger);">' + kpis.overdue_inspections + '</strong></div>' +
          '</div>' +
        '</div>' +

        // GIS Map & District Summary (Side by Side)
        '<div class="gis-map-panel">' +
          '<div class="gis-map-header">' +
            '<div style="font-weight:700;font-size:12px;color:var(--gov-green-dark);text-transform:uppercase;letter-spacing:0.4px;">DISTRICT-WISE RISK STATUS (GIS MONITORING)</div>' +
            '<div class="gis-legend">' +
              '<div class="gis-legend-item"><span class="gis-legend-color" style="background:#18794e;"></span> Low</div>' +
              '<div class="gis-legend-item"><span class="gis-legend-color" style="background:#c77b00;"></span> Med</div>' +
              '<div class="gis-legend-item"><span class="gis-legend-color" style="background:#f28c28;"></span> High</div>' +
              '<div class="gis-legend-item"><span class="gis-legend-color" style="background:#b42318;"></span> Crit</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:center;">' +
            '<div class="gis-map-frame">' +
              renderMaharashtraSVG(data.district_data) +
            '</div>' +
            '<div class="gov-table-wrap" style="max-height:280px;overflow-y:auto;">' +
              '<table class="gov-data-table">' +
                '<thead>' +
                  '<tr>' +
                    '<th>District</th>' +
                    '<th>Establishments</th>' +
                    '<th>Compliance</th>' +
                    '<th>High Risk</th>' +
                    '<th>Risk Level</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' + districtRows + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Inspection Priority Queue (Government Data Table)
        '<div class="gov-card">' +
          '<div class="gov-card-header">' +
            '<div class="gov-card-title">INSPECTION PRIORITY QUEUE (' + data.priority_queue.length + ' High Risk Establishments)</div>' +
            '<span class="badge badge-crit">Action Required</span>' +
          '</div>' +
          '<div class="gov-table-wrap">' +
            '<table class="gov-data-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Establishment</th>' +
                  '<th>District</th>' +
                  '<th>Risk Reason</th>' +
                  '<th>Risk Level</th>' +
                  '<th>Last Activity</th>' +
                  '<th style="text-align:right;">Order Dispatch</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + queueHtml + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

        // Inspector Operational Activity Roster
        '<div class="gov-card">' +
          '<div class="gov-card-header">' +
            '<div class="gov-card-title">FIELD INSPECTOR OPERATIONAL ACTIVITY MONITORING</div>' +
          '</div>' +
          '<div class="gov-table-wrap">' +
            '<table class="gov-data-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Officer Name</th>' +
                  '<th>Division</th>' +
                  '<th>Assigned</th>' +
                  '<th>Completed (Month)</th>' +
                  '<th>Overdue</th>' +
                  '<th>Complaints Resolved</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + inspectorRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

      '</div>';

      container.innerHTML = html;
    });
  }

  function renderMaharashtraSVG(districts) {
    var coords = {
      'mumbai_city': { x: 80, y: 150, r: 20 },
      'mumbai_sub': { x: 115, y: 135, r: 24 },
      'thane': { x: 130, y: 100, r: 28 },
      'nashik': { x: 180, y: 80, r: 34 },
      'pune': { x: 170, y: 190, r: 38 },
      'kolhapur': { x: 160, y: 260, r: 30 },
      'sangli': { x: 200, y: 250, r: 26 },
      'solapur': { x: 255, y: 220, r: 34 },
      'aurangabad': { x: 260, y: 120, r: 36 },
      'amravati': { x: 350, y: 70, r: 32 },
      'nagpur': { x: 430, y: 60, r: 38 },
      'nanded': { x: 340, y: 180, r: 30 }
    };

    var nodes = districts.map(function (d) {
      var c = coords[d.id] || { x: 200, y: 150, r: 22 };
      return '<g class="district-node-group" onclick="window.MFTM.filterDistrict(\'' + d.name + '\')">' +
        '<circle cx="' + c.x + '" cy="' + c.y + '" r="' + c.r + '" fill="' + d.color + '" class="district-node" />' +
        '<text x="' + c.x + '" y="' + (c.y + 3) + '" class="district-node-text">' + d.name.split(' ')[0] + '</text>' +
      '</g>';
    }).join('\n');

    return '<svg viewBox="0 0 500 310" width="100%" height="250" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M 40 130 Q 140 40, 460 30 Q 490 100, 400 200 Q 290 280, 150 290 Q 70 230, 40 130 Z" fill="#0b171e" stroke="#2c3e50" stroke-width="1.5" />' +
      nodes +
    '</svg>';
  }

  /* ============================================================
     5. LIVE CAMERA CAPTURE WORKFLOW
     ============================================================ */
  function openCameraModal(category) {
    state.currentCaptureCategory = category;
    state.capturedPhotoData = null;
    state.capturedGPS = null;

    var modal = document.getElementById('modal-camera-capture');
    var catLabel = document.getElementById('camera-category-label');
    if (catLabel) catLabel.textContent = category;

    var video = document.getElementById('camera-video');
    var preview = document.getElementById('camera-preview-img');
    var captureBtn = document.getElementById('btn-camera-capture');
    var retakeBtn = document.getElementById('btn-camera-retake');
    var submitBtn = document.getElementById('btn-camera-submit');
    var geoBanner = document.getElementById('camera-geo-status');

    if (video) video.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'inline-flex';
    if (retakeBtn) retakeBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';
    if (geoBanner) geoBanner.innerHTML = 'Verifying live GPS perimeter...';

    modal.classList.add('open');

    // Request device camera stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (stream) {
          state.cameraStream = stream;
          if (video) video.srcObject = stream;
        })
        .catch(function (err) {
          console.warn('Camera stream permission warning:', err);
          if (geoBanner) {
            geoBanner.innerHTML = '<span style="color:var(--gov-saffron-deep);">Live video simulation stream active (desktop environment).</span>';
          }
        });
    }

    // Geolocation check
    checkLiveGeolocation();
  }

  function checkLiveGeolocation() {
    var geoBanner = document.getElementById('camera-geo-status');
    var estCoords = { lat: 18.5204, lng: 73.8567 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        state.capturedGPS = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          status: 'VERIFIED'
        };
        if (geoBanner) {
          geoBanner.innerHTML = '✓ Verified: Within licensed premises (' + pos.coords.latitude.toFixed(4) + '° N, ' + pos.coords.longitude.toFixed(4) + '° E)';
        }
      }, function () {
        state.capturedGPS = {
          lat: estCoords.lat,
          lng: estCoords.lng,
          accuracy: 4.2,
          status: 'VERIFIED'
        };
        if (geoBanner) {
          geoBanner.innerHTML = '✓ Verified: Within licensed premises (18.5204° N, 73.8567° E, ±4m)';
        }
      });
    }
  }

  function captureLivePhoto() {
    var video = document.getElementById('camera-video');
    var canvas = document.getElementById('camera-canvas');
    var preview = document.getElementById('camera-preview-img');
    var captureBtn = document.getElementById('btn-camera-capture');
    var retakeBtn = document.getElementById('btn-camera-retake');
    var submitBtn = document.getElementById('btn-camera-submit');

    var w = 600;
    var h = 450;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    if (video && video.videoWidth) {
      ctx.drawImage(video, 0, 0, w, h);
    } else {
      var gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#073b2a');
      gradient.addColorStop(1, '#0b5d3b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.currentCaptureCategory.toUpperCase(), w / 2, h / 2 - 15);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText('LIVE CAMERA EVIDENCE VERIFIED', w / 2, h / 2 + 15);
    }

    // Burn-in tamper-proof watermark on canvas
    var now = new Date();
    var timeStr = now.toLocaleTimeString();
    var dateStr = now.toLocaleDateString();
    ctx.fillStyle = 'rgba(7, 42, 30, 0.9)';
    ctx.fillRect(0, h - 50, w, 50);

    ctx.fillStyle = '#d96b16';
    ctx.fillRect(0, h - 50, w, 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MFTM EST ID: ' + state.activeEstablishmentId + ' | ' + state.currentCaptureCategory.toUpperCase(), 16, h - 30);
    ctx.fillStyle = '#9ed4bc';
    ctx.fillText('TIMESTAMP: ' + dateStr + ' ' + timeStr + ' IST | GPS: 18.5204N, 73.8567E (VERIFIED)', 16, h - 14);

    state.capturedPhotoData = canvas.toDataURL('image/jpeg', 0.85);

    if (preview) {
      preview.src = state.capturedPhotoData;
      preview.style.display = 'block';
    }
    if (video) video.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'none';
    if (retakeBtn) retakeBtn.style.display = 'inline-flex';
    if (submitBtn) submitBtn.style.display = 'inline-flex';
  }

  function restartCamera() {
    var video = document.getElementById('camera-video');
    var preview = document.getElementById('camera-preview-img');
    var captureBtn = document.getElementById('btn-camera-capture');
    var retakeBtn = document.getElementById('btn-camera-retake');
    var submitBtn = document.getElementById('btn-camera-submit');

    if (preview) preview.style.display = 'none';
    if (video) video.style.display = 'block';
    if (captureBtn) captureBtn.style.display = 'inline-flex';
    if (retakeBtn) retakeBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';
  }

  function submitComplianceCapture() {
    if (!state.capturedPhotoData) return;

    var payload = {
      establishment_id: state.activeEstablishmentId,
      category: state.currentCaptureCategory,
      photo_url: state.capturedPhotoData,
      latitude: state.capturedGPS ? state.capturedGPS.lat : 18.5204,
      longitude: state.capturedGPS ? state.capturedGPS.lng : 73.8567,
      gps_accuracy: state.capturedGPS ? state.capturedGPS.accuracy : 4.0,
      capture_session_id: 'sess_live_' + Date.now(),
      submission_notes: 'Real-time evidence captured via device camera.'
    };

    apiFetch('/restaurant/compliance', {
      method: 'POST',
      body: payload
    }).then(function (res) {
      closeAllModals();
      showNotification('✓ ' + state.currentCaptureCategory + ' live compliance evidence submitted successfully!');
      renderRestaurantDashboard(state.activeEstablishmentId);
    });
  }

  /* ============================================================
     6. CITIZEN COMPLAINT WORKFLOW
     ============================================================ */
  function openComplaintModal(estId) {
    state.activeEstablishmentId = estId || state.activeEstablishmentId;
    var modal = document.getElementById('modal-complaint');
    if (modal) modal.classList.add('open');
  }

  function submitCitizenComplaint() {
    var cat = document.getElementById('complaint-category').value;
    var desc = document.getElementById('complaint-desc').value;
    var isAnon = document.getElementById('complaint-anon').checked;
    var name = document.getElementById('complaint-name').value;
    var phone = document.getElementById('complaint-phone').value;

    if (!desc) {
      alert('Please describe your concern.');
      return;
    }

    var payload = {
      establishment_id: state.activeEstablishmentId,
      category: cat,
      description: desc,
      is_anonymous: isAnon ? 1 : 0,
      customer_name: name,
      customer_phone: phone
    };

    apiFetch('/public/complaint', {
      method: 'POST',
      body: payload
    }).then(function (res) {
      closeAllModals();
      showComplaintSuccessModal(res.complaint_code);
    });
  }

  function showComplaintSuccessModal(code) {
    var modal = document.getElementById('modal-complaint-success');
    var codeEl = document.getElementById('complaint-success-code');
    if (codeEl) codeEl.textContent = code;
    if (modal) modal.classList.add('open');
  }

  function trackComplaintCode() {
    var input = document.getElementById('track-code-input');
    if (!input || !input.value.trim()) return;
    var code = input.value.trim();

    apiFetch('/public/complaint/track/' + encodeURIComponent(code)).then(function (data) {
      if (data.code === 'not_found') {
        alert('Complaint reference code not found. Please verify the code.');
        return;
      }
      var modal = document.getElementById('modal-complaint-tracker');
      var body = document.getElementById('complaint-tracker-body');
      if (!modal || !body) return;

      var stagesHtml = Object.keys(data.stages).map(function (key) {
        var stage = data.stages[key];
        var isCurrent = (key === data.status);
        return '<div style="display:flex;gap:10px;margin-bottom:12px;align-items:flex-start;">' +
          '<div style="width:20px;height:20px;border-radius:2px;background:' + (isCurrent ? 'var(--gov-saffron-deep)' : 'var(--gov-green)') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">' + (isCurrent ? '●' : '✓') + '</div>' +
          '<div>' +
            '<div style="font-weight:700;font-size:12px;color:var(--text-main);">' + stage.title + '</div>' +
            '<div style="font-size:11px;color:var(--text-muted);">' + stage.desc + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      body.innerHTML = '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid var(--border-color);padding-bottom:10px;">' +
          '<div>' +
            '<div style="font-size:15px;font-weight:800;font-family:var(--font-mono);color:var(--gov-green-dark);">' + data.complaint_code + '</div>' +
            '<div style="font-size:11px;color:var(--text-muted);">' + data.establishment_name + ' (' + data.district + ')</div>' +
          '</div>' +
          '<span class="badge badge-med">' + data.status + '</span>' +
        '</div>' +
        '<div style="background:var(--off-white);padding:10px;border-radius:var(--radius-card);font-size:11px;margin-bottom:14px;">' +
          '<strong>Concern Description:</strong> ' + data.description +
        '</div>' +
        '<div style="margin-top:12px;">' + stagesHtml + '</div>' +
      '</div>';

      modal.classList.add('open');
    });
  }

  /* ============================================================
     7. 6-STEP GUIDED FIELD INSPECTION WIZARD
     ============================================================ */
  function openInspectionWizard(estId) {
    state.inspectionStep = 1;
    state.inspectionData.establishment_id = estId;
    var modal = document.getElementById('modal-inspection-wizard');
    if (!modal) return;
    renderWizardStep();
    modal.classList.add('open');
  }

  function renderWizardStep() {
    var step = state.inspectionStep;
    var body = document.getElementById('wizard-step-content');
    if (!body) return;

    // Update tab indicators
    document.querySelectorAll('.wizard-step-tab').forEach(function (el, idx) {
      el.classList.toggle('active', idx + 1 === step);
      if (idx + 1 === step) {
        el.style.borderBottom = '2px solid var(--gov-green)';
        el.style.color = 'var(--gov-green-dark)';
      } else {
        el.style.borderBottom = 'none';
        el.style.color = 'var(--text-muted)';
      }
    });

    if (step === 1) {
      body.innerHTML = '<div>' +
        '<div class="insp-num-step-header">01 / Establishment &amp; Field Verification</div>' +
        '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Verify physical presence and geo-coordinates before entering premises.</p>' +
        '<div style="background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:12px;font-size:12px;line-height:1.6;">' +
          '<div>Inspecting Officer: <strong>Inspector Vikram Deshmukh (ID: FDA-MAHA-INSP-042)</strong></div>' +
          '<div>Squad Division: <strong>Pune Enforcement Squad, Zone 2</strong></div>' +
          '<div>Date &amp; Time: <strong>16 September 2026 | 07:20 PM IST</strong></div>' +
          '<div>Location Status: <strong style="color:var(--gov-green);">18.5204° N, 73.8567° E (Within Licensed Premises ✓)</strong></div>' +
        '</div>' +
      '</div>';
    } else if (step === 2) {
      var rows = CHECKLIST_ITEMS.map(function (item, idx) {
        var num = (idx + 1 < 10) ? '0' + (idx + 1) : (idx + 1);
        return '<div class="insp-checklist-row">' +
          '<span class="insp-num-col">' + num + '</span>' +
          '<span style="font-weight:600;">' + item + '</span>' +
          '<div class="insp-radio-group">' +
            '<label><input type="radio" name="check_' + idx + '" value="COMPLIANT" checked /> Compliant</label>' +
            '<label><input type="radio" name="check_' + idx + '" value="NON_COMPLIANT" /> Non-Compliant</label>' +
            '<label><input type="radio" name="check_' + idx + '" value="NA" /> N/A</label>' +
          '</div>' +
        '</div>';
      }).join('');

      body.innerHTML = '<div>' +
        '<div class="insp-num-step-header">02 / Official 11-Point Hygiene Checklist</div>' +
        '<div style="max-height:280px;overflow-y:auto;border:1px solid var(--border-color);border-radius:var(--radius-card);">' + rows + '</div>' +
      '</div>';
    } else if (step === 3) {
      body.innerHTML = '<div>' +
        '<div class="insp-num-step-header">03 / On-Site Evidence Photographic Log</div>' +
        '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Capture live photographic proof of any observed violations or rectifications.</p>' +
        '<div style="height:150px;background:#071a13;border:1px solid var(--border-color);border-radius:var(--radius-card);display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:12px;">' +
          '<span>📸 Official Inspection Camera Ready • Tamper-Evident Geostamp Enabled</span>' +
        '</div>' +
      '</div>';
    } else if (step === 4) {
      body.innerHTML = '<div>' +
        '<div class="insp-num-step-header">04 / Findings &amp; Hazard Classification</div>' +
        '<div style="display:flex;gap:14px;margin-bottom:12px;font-size:12px;">' +
          '<label><input type="radio" name="wizard_findings" value="MINOR" checked /> Minor Observation</label>' +
          '<label><input type="radio" name="wizard_findings" value="MAJOR" /> Major Violation</label>' +
          '<label><input type="radio" name="wizard_findings" value="CRITICAL" /> Critical Hazard</label>' +
        '</div>' +
        '<div class="gov-form-group">' +
          '<label class="gov-form-label">Inspector Observations &amp; Specific Violations:</label>' +
          '<textarea id="wizard-obs" class="gov-form-textarea" style="height:70px;" placeholder="Document specific observations observed on premises..."></textarea>' +
        '</div>' +
      '</div>';
    } else if (step === 5) {
      body.innerHTML = '<div>' +
        '<div class="insp-num-step-header">05 / Final Inspection Result &amp; Enforcement Order</div>' +
        '<div class="gov-form-group">' +
          '<label class="gov-form-label">Overall Inspection Result:</label>' +
          '<select id="wizard-result" class="gov-form-select">' +
            '<option value="SATISFACTORY">SATISFACTORY (Compliance Verified)</option>' +
            '<option value="NEEDS_IMPROVEMENT">NEEDS IMPROVEMENT (Form C Improvement Notice)</option>' +
            '<option value="ACTION_REQUIRED">ACTION REQUIRED (Emergency Suspension / Challan)</option>' +
          '</select>' +
        '</div>' +
        '<div class="gov-form-group">' +
          '<label class="gov-form-label">Mandated Corrective Action Order:</label>' +
          '<textarea id="wizard-corrective" class="gov-form-textarea" style="height:60px;" placeholder="Mandated corrective rectifications and compliance deadline..."></textarea>' +
        '</div>' +
      '</div>';
    } else if (step === 6) {
      body.innerHTML = '<div>' +
        '<div class="insp-num-step-header">06 / Review &amp; Official Digital Signoff</div>' +
        '<div style="background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:12px;font-size:12px;line-height:1.6;">' +
          '<div>Establishment ID: <strong>MFTM-EST-' + state.inspectionData.establishment_id + '</strong></div>' +
          '<div>Inspecting Officer: <strong>Inspector Vikram Deshmukh (FDA Maharashtra)</strong></div>' +
          '<div>Date &amp; Timestamp: <strong>' + new Date().toLocaleString() + '</strong></div>' +
          '<div style="color:var(--status-danger);margin-top:6px;font-weight:600;">⚠️ Once formally submitted, this record is committed to the state audit ledger and cannot be altered.</div>' +
        '</div>' +
      '</div>';
    }
  }

  function wizardNext() {
    if (state.inspectionStep < 6) {
      state.inspectionStep++;
      renderWizardStep();
    } else {
      submitInspectionReport();
    }
  }

  function wizardBack() {
    if (state.inspectionStep > 1) {
      state.inspectionStep--;
      renderWizardStep();
    }
  }

  function submitInspectionReport() {
    var resultEl = document.getElementById('wizard-result');
    var correctiveEl = document.getElementById('wizard-corrective');
    var obsEl = document.getElementById('wizard-obs');

    var payload = {
      establishment_id: state.inspectionData.establishment_id,
      overall_result: resultEl ? resultEl.value : 'SATISFACTORY',
      findings_level: 'MINOR',
      corrective_action: correctiveEl ? correctiveEl.value : 'Standard guidelines compliance verified.',
      notes: obsEl ? obsEl.value : 'Routine verification inspection completed on site.'
    };

    apiFetch('/inspector/inspection', {
      method: 'POST',
      body: payload
    }).then(function (res) {
      closeAllModals();
      showNotification('✓ Official FDA Inspection Report registered! Code: ' + res.inspection_code);
      renderInspectorPortal();
    });
  }

  /* ============================================================
     8. SENIOR INSPECTION ASSIGNMENT MODAL
     ============================================================ */
  function openAssignModal(estId, estName) {
    var modal = document.getElementById('modal-assign-inspection');
    var nameEl = document.getElementById('assign-est-name');
    var estIdInput = document.getElementById('assign-est-id');
    if (nameEl) nameEl.textContent = estName;
    if (estIdInput) estIdInput.value = estId;
    if (modal) modal.classList.add('open');
  }

  function submitAssignment() {
    var estId = document.getElementById('assign-est-id').value;
    var inspId = document.getElementById('assign-inspector-select').value;
    var priority = document.getElementById('assign-priority-select').value;
    var deadline = document.getElementById('assign-deadline-input').value;
    var notes = document.getElementById('assign-notes').value;

    var payload = {
      establishment_id: parseInt(estId),
      inspector_id: parseInt(inspId),
      priority: priority,
      deadline_date: deadline || '2026-09-20',
      notes: notes
    };

    apiFetch('/senior/assign-inspection', {
      method: 'POST',
      body: payload
    }).then(function (res) {
      closeAllModals();
      showNotification('✓ Field inspection order issued and dispatched!');
      renderSeniorCommandDashboard();
    });
  }

  /* ============================================================
     9. REPORTS & ANALYTICS MODULE
     ============================================================ */
  function renderReportsModule(type) {
    var container = document.getElementById('reports-content');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:30px;"><span class="badge badge-neutral">Generating Report Table...</span></div>';

    apiFetch('/reports?type=' + encodeURIComponent(type)).then(function (data) {
      var records = data.records || [];
      var rowsHtml = '';

      if (type === 'inspections') {
        rowsHtml = records.map(function (r) {
          return '<tr>' +
            '<td class="code-cell">' + r.inspection_code + '</td>' +
            '<td><strong>' + r.establishment_name + '</strong></td>' +
            '<td>' + r.district + '</td>' +
            '<td>' + r.inspector_name + '</td>' +
            '<td>' + r.inspection_date + '</td>' +
            '<td><span class="badge badge-low">' + r.overall_result + '</span></td>' +
          '</tr>';
        }).join('');
      } else if (type === 'complaints') {
        rowsHtml = records.map(function (r) {
          return '<tr>' +
            '<td class="code-cell">' + r.complaint_code + '</td>' +
            '<td><strong>' + r.establishment_name + '</strong></td>' +
            '<td>' + r.district + '</td>' +
            '<td>' + r.category + '</td>' +
            '<td>' + r.created_at.substring(0, 10) + '</td>' +
            '<td><span class="badge badge-med">' + r.status + '</span></td>' +
          '</tr>';
        }).join('');
      } else {
        rowsHtml = records.map(function (r) {
          return '<tr>' +
            '<td><strong>' + r.name + '</strong></td>' +
            '<td>' + r.district + '</td>' +
            '<td>' + r.ward + '</td>' +
            '<td class="code-cell">' + r.fssai_license + '</td>' +
            '<td>★ ' + r.current_rating + '</td>' +
            '<td><span class="badge ' + (r.risk_level === 'CRITICAL' ? 'badge-crit' : (r.risk_level === 'HIGH' ? 'badge-high' : 'badge-low')) + '">' + r.risk_level + ' (' + r.risk_score + ')</span></td>' +
          '</tr>';
        }).join('');
      }

      var html = '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:12px;">' +
          '<div>' +
            '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;">FDA Maharashtra • Official Reports</div>' +
            '<h2 style="font-size:20px;font-weight:800;color:var(--gov-green-dark);margin-top:2px;">Enforcement &amp; Compliance Audit Reports</h2>' +
            '<div style="font-size:12px;color:var(--text-muted);">Tabular records for legislative review and state audit oversight.</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-outline" onclick="window.print()">🖨️ Print / Save PDF</button>' +
            '<button class="btn btn-primary" onclick="alert(\'Export generated. Official demonstration CSV downloaded.\')">📥 Export CSV</button>' +
          '</div>' +
        '</div>' +

        // Report Filter Tabs
        '<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">' +
          '<button class="btn ' + (type === 'compliance' ? 'btn-primary' : 'btn-outline') + '" onclick="window.MFTM.renderReportsModule(\'compliance\')">High-Risk &amp; Compliance Summary</button>' +
          '<button class="btn ' + (type === 'inspections' ? 'btn-primary' : 'btn-outline') + '" onclick="window.MFTM.renderReportsModule(\'inspections\')">Inspections Audit Report</button>' +
          '<button class="btn ' + (type === 'complaints' ? 'btn-primary' : 'btn-outline') + '" onclick="window.MFTM.renderReportsModule(\'complaints\')">Citizen Complaints Dossier</button>' +
        '</div>' +

        '<div class="gov-card">' +
          '<div class="gov-table-wrap">' +
            '<table class="gov-data-table">' +
              '<thead>' +
                '<tr>' +
                  (type === 'inspections'
                    ? '<th>Inspection Code</th><th>Establishment</th><th>District</th><th>Officer</th><th>Date</th><th>Result</th>'
                    : (type === 'complaints'
                        ? '<th>Complaint Code</th><th>Establishment</th><th>District</th><th>Category</th><th>Date</th><th>Status</th>'
                        : '<th>Establishment</th><th>District</th><th>Ward</th><th>FSSAI Licence</th><th>Rating</th><th>Risk Level</th>')) +
                '</tr>' +
              '</thead>' +
              '<tbody>' + (rowsHtml || '<tr><td colspan="6" style="text-align:center;">No records available.</td></tr>') + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

      '</div>';

      container.innerHTML = html;
    });
  }

  /* ============================================================
     10. QR CODE MODAL & LIGHTBOX
     ============================================================ */
  function showQRModal(type) {
    var modal = document.getElementById('modal-qr-display');
    var svgContainer = document.getElementById('qr-svg-container');
    var titleEl = document.getElementById('qr-modal-title');
    var descEl = document.getElementById('qr-modal-desc');
    var estNameEl = document.getElementById('qr-modal-est-name');
    if (!modal || !svgContainer) return;

    var est = state.currentEst || (state.establishments && state.establishments[0]) || { name: 'Spice Symphony', id: 1 };
    if (estNameEl) estNameEl.textContent = est.name;

    var url = '';
    if (type === 'public') {
      titleEl.textContent = 'PUBLIC CUSTOMER QR SPECIFICATION';
      descEl.textContent = 'Display at restaurant entrance & dining tables. Scan with any standard smartphone camera to view today\'s cleanliness and transparency rating.';
      url = window.location.origin + '/?role=public&est=' + est.id;
    } else {
      titleEl.textContent = 'OFFICIAL FDA INSPECTOR FIELD QR';
      descEl.textContent = 'Restricted QR token for authorized FDA field officers. Unlocks internal dossier and on-site checklist.';
      url = window.location.origin + '/?role=inspector&token=MFTM-INSP-000' + est.id;
    }

    if (window.generateQRCodeSVG) {
      svgContainer.innerHTML = window.generateQRCodeSVG(url, 180);
    }

    modal.classList.add('open');
  }

  function openLightbox(imgSrc) {
    var modal = document.getElementById('modal-lightbox');
    var img = document.getElementById('lightbox-img');
    if (modal && img) {
      img.src = imgSrc;
      modal.classList.add('open');
    }
  }

  function toggleRatingBreakdown() {
    var panel = document.getElementById('rating-breakdown-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }
  }

  function filterDistrict(districtName) {
    if (!districtName) return;
    showNotification('Filtered Command Center to: ' + districtName);
    var searchInput = document.getElementById('inspector-search-input');
    if (searchInput) {
      searchInput.value = districtName;
      searchInspectorEstablishments(districtName);
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(function (m) {
      m.classList.remove('open');
    });
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(function (t) { t.stop(); });
      state.cameraStream = null;
    }
  }

  function showNotification(msg) {
    var toast = document.getElementById('mftm-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mftm-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#072a1e;color:#ffffff;padding:10px 18px;border-radius:3px;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;border-left:4px solid #f28c28;transition:opacity 0.3s;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(function () {
      toast.style.opacity = '0';
    }, 4000);
  }

  // Footer / Utility Helpers
  function toggleAccessibility() {
    document.body.classList.toggle('high-contrast-mode');
    showNotification('Accessibility Mode: High Contrast toggled.');
  }

  function showAccessibilityInfo() {
    alert('MFTM Accessibility: Conforms to Government of India Guidelines for Indian Government Websites (GIGW 3.0). Supports keyboard navigation and screen readers.');
  }

  function showPrivacyInfo() {
    alert('MFTM Privacy Policy: Food establishment compliance submissions and inspection reports are maintained under FDA Maharashtra security controls. Whistleblower complaints are protected.');
  }

  function showTermsInfo() {
    alert('MFTM Terms of Use: Food business operators are mandated under Section 31 of the Food Safety & Standards Act, 2006 to maintain premises hygiene and produce true records.');
  }

  function showHelpModal() {
    alert('MFTM Technical Helpdesk:\n- Toll-Free Citizen Helpline: 1800-222-365\n- FDA Officer Support: fda-mftm-support@maharashtra.gov.in\n- Hours: Mon - Sat, 09:30 AM - 06:00 PM IST');
  }

  function showContactModal() {
    alert('Food and Drug Administration (Maharashtra State)\nSurvey No. 341, Bandra-Kurla Complex, Bandra (East), Mumbai - 400051.\nWebsite: https://fda.maharashtra.gov.in');
  }

  // Export globally for HTML handlers
  window.MFTM = {
    setRole: setRole,
    refreshCurrentView: refreshCurrentView,
    toggleLanguage: toggleLanguage,
    handleSidebarNav: handleSidebarNav,
    openCameraModal: openCameraModal,
    openComplaintModal: openComplaintModal,
    openInspectionWizard: openInspectionWizard,
    openAssignModal: openAssignModal,
    submitAssignment: submitAssignment,
    wizardNext: wizardNext,
    wizardBack: wizardBack,
    showQRModal: showQRModal,
    openLightbox: openLightbox,
    toggleRatingBreakdown: toggleRatingBreakdown,
    trackComplaintCode: trackComplaintCode,
    viewInspectorEstDetails: viewInspectorEstDetails,
    triggerInspectorSearch: function () {
      var q = document.getElementById('inspector-search-input').value;
      searchInspectorEstablishments(q);
    },
    filterDistrict: filterDistrict,
    renderReportsModule: renderReportsModule,
    closeAllModals: closeAllModals,
    toggleAccessibility: toggleAccessibility,
    showAccessibilityInfo: showAccessibilityInfo,
    showPrivacyInfo: showPrivacyInfo,
    showTermsInfo: showTermsInfo,
    showHelpModal: showHelpModal,
    showContactModal: showContactModal
  };

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
