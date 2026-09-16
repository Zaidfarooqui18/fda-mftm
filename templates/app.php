<?php
/**
 * Master Template for Maharashtra Food Trust Mission (MFTM) Single Page Application
 * Redesigned as an Indian Government Digital Service (GDS) 2026 Portal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$plugin_url = MFTM_PLUGIN_URL;
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Maharashtra Food Trust Mission (MFTM) | FDA Maharashtra</title>
	<link rel="stylesheet" href="<?php echo esc_url( $plugin_url . 'assets/css/mftm-app.css?v=' . time() ); ?>">
</head>
<body>

	<!-- 1. Top Thin Government Utility Bar -->
	<div class="gov-utility-bar">
		<div class="gov-utility-left">
			<span class="gov-service-tag">🇮🇳 GOVERNMENT DIGITAL SERVICE</span>
			<span style="color:#889e95;">|</span>
			<span>अन्न व औषध प्रशासन, महाराष्ट्र शासन | Food &amp; Drug Administration, Govt. of Maharashtra</span>
			<span class="gov-badge-demo">CONCEPT PROTOTYPE</span>
		</div>
		<div class="gov-utility-right">
			<a class="gov-utility-link" onclick="window.MFTM.toggleAccessibility()">Accessibility</a>
			<span style="color:#334d43;">|</span>
			<a class="gov-utility-link" onclick="window.MFTM.showContactModal()">Contact</a>
			<span style="color:#334d43;">|</span>
			<a class="gov-utility-link" onclick="window.MFTM.showHelpModal()">Help</a>
			<span style="color:#334d43;">|</span>
			<button class="lang-toggle-btn" id="btn-lang-toggle" onclick="window.MFTM.toggleLanguage()">English | मराठी</button>
		</div>
	</div>

	<!-- 2. Main Government Header -->
	<header class="gov-main-header">
		<a href="/" class="header-brand-wrap">
			<div class="header-emblem-box">
				<!-- Ashoka Stambha / Government Seal Emblem SVG -->
				<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:36px;">
					<circle cx="50" cy="50" r="46" stroke="#0B5D3B" stroke-width="4" fill="#FFFFFF"/>
					<circle cx="50" cy="50" r="40" stroke="#D96B16" stroke-width="1.5" stroke-dasharray="3 3"/>
					<text x="50" y="38" font-family="sans-serif" font-size="9" font-weight="bold" fill="#0B5D3B" text-anchor="middle">महाराष्ट्र शासन</text>
					<path d="M50 42 L56 54 L69 54 L58 62 L62 74 L50 66 L38 74 L42 62 L31 54 L44 54 Z" fill="#D96B16"/>
					<text x="50" y="85" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0B5D3B" text-anchor="middle">FDA MAHA</text>
				</svg>
			</div>
			<div class="header-title-box">
				<h1 id="hdr-main-title">MAHARASHTRA FOOD TRUST MISSION</h1>
				<div class="header-dept" id="hdr-dept-subtitle">Food Safety Accountability &amp; Inspection Prioritization</div>
				<div class="header-sub">FDA Maharashtra Digital Enforcement Portal</div>
			</div>
		</a>

		<div class="header-nav-shortcuts">
			<button class="nav-shortcut-btn active" data-role="public" id="nav-btn-public">Citizen (Public QR)</button>
			<button class="nav-shortcut-btn" data-role="restaurant" id="nav-btn-restaurant">Restaurant Portal</button>
			<button class="nav-shortcut-btn" data-role="inspector" id="nav-btn-inspector">FDA Inspector</button>
			<button class="nav-shortcut-btn" data-role="senior" id="nav-btn-senior">Senior Command Center</button>
			<button class="nav-shortcut-btn" data-role="reports" id="nav-btn-reports">Reports &amp; Analytics</button>

			<div class="header-est-select-box">
				<span>Establishment:</span>
				<select id="header-est-select"></select>
			</div>
		</div>
	</header>

	<!-- Thin Saffron Line Underneath Header -->
	<div class="gov-header-saffron-stripe"></div>

	<!-- 3. Breadcrumb Navigation Bar -->
	<div class="breadcrumb-container" id="app-breadcrumbs-bar">
		<a href="#" onclick="window.MFTM.setRole('public'); return false;">Home</a>
		<span class="breadcrumb-sep">›</span>
		<span id="bc-level-1">Public Information</span>
		<span class="breadcrumb-sep" id="bc-sep-2" style="display:none;">›</span>
		<span id="bc-level-2" style="display:none;font-weight:700;color:var(--text-main);">Spice Symphony</span>
	</div>

	<!-- 4. Formal Dashboard Header Banner -->
	<div class="page-title-banner" id="page-banner">
		<div class="page-title-box">
			<h2 id="page-banner-title">PUBLIC FOOD SAFETY INFORMATION</h2>
			<div class="page-title-desc" id="page-banner-desc">Official establishment transparency &amp; daily verified compliance status</div>
		</div>
		<div style="display:flex;align-items:center;gap:10px;">
			<span class="page-timestamp" id="page-banner-timestamp">Last updated: 16 September 2026 | 07:20 PM</span>
			<button class="btn btn-outline" onclick="window.MFTM.refreshCurrentView()" style="padding:4px 10px;font-size:11px;">↻ Refresh</button>
		</div>
	</div>

	<!-- 5. Main Application Content Area -->
	<main>

		<!-- Role 1: Public Customer View (Centered Public Layout) -->
		<div id="view-public" class="view-section active">
			<div class="public-full-layout">
				<div id="public-view-content"></div>
			</div>
		</div>

		<!-- Dashboards Shell Layout (Sidebar + Main Content) for Restaurant, Inspector, Senior, Reports -->
		<div id="admin-shell-layout" class="admin-layout-wrapper" style="display:none;">
			<aside class="admin-sidebar">
				<div class="sidebar-heading" id="sb-heading-dash">DASHBOARD</div>
				<ul class="sidebar-nav-list">
					<li class="sidebar-nav-item active" data-nav="establishments" onclick="window.MFTM.handleSidebarNav('establishments')">
						<span class="sidebar-icon">🏢</span> <span class="sidebar-text">Establishments</span>
					</li>
					<li class="sidebar-nav-item" data-nav="compliance" onclick="window.MFTM.handleSidebarNav('compliance')">
						<span class="sidebar-icon">📋</span> <span class="sidebar-text">Compliance</span>
					</li>
					<li class="sidebar-nav-item" data-nav="inspections" onclick="window.MFTM.handleSidebarNav('inspections')">
						<span class="sidebar-icon">🔍</span> <span class="sidebar-text">Inspections</span>
					</li>
					<li class="sidebar-nav-item" data-nav="complaints" onclick="window.MFTM.handleSidebarNav('complaints')">
						<span class="sidebar-icon">⚠️</span> <span class="sidebar-text">Complaints</span>
					</li>
					<li class="sidebar-nav-item" data-nav="priority" onclick="window.MFTM.handleSidebarNav('priority')">
						<span class="sidebar-icon">🚨</span> <span class="sidebar-text">Risk &amp; Priority</span>
					</li>
					<li class="sidebar-nav-item" data-nav="assignments" onclick="window.MFTM.handleSidebarNav('assignments')">
						<span class="sidebar-icon">📌</span> <span class="sidebar-text">Assignments</span>
					</li>
					<li class="sidebar-nav-item" data-nav="reports" onclick="window.MFTM.handleSidebarNav('reports')">
						<span class="sidebar-icon">📊</span> <span class="sidebar-text">Reports</span>
					</li>
					<li class="sidebar-nav-item" data-nav="analytics" onclick="window.MFTM.handleSidebarNav('analytics')">
						<span class="sidebar-icon">📈</span> <span class="sidebar-text">Analytics</span>
					</li>
				</ul>

				<div class="sidebar-heading" id="sb-heading-admin" style="margin-top:14px;">ADMINISTRATION</div>
				<ul class="sidebar-nav-list">
					<li class="sidebar-nav-item" data-nav="inspectors" onclick="window.MFTM.handleSidebarNav('inspectors')">
						<span class="sidebar-icon">👥</span> <span class="sidebar-text">Inspectors</span>
					</li>
					<li class="sidebar-nav-item" data-nav="users" onclick="window.MFTM.handleSidebarNav('users')">
						<span class="sidebar-icon">👤</span> <span class="sidebar-text">Users</span>
					</li>
					<li class="sidebar-nav-item" data-nav="audit" onclick="window.MFTM.handleSidebarNav('audit')">
						<span class="sidebar-icon">📜</span> <span class="sidebar-text">Audit Logs</span>
					</li>
					<li class="sidebar-nav-item" data-nav="settings" onclick="window.MFTM.handleSidebarNav('settings')">
						<span class="sidebar-icon">⚙️</span> <span class="sidebar-text">Settings</span>
					</li>
				</ul>
			</aside>

			<div class="admin-content-area">
				<!-- Role 2: Restaurant Portal View -->
				<section id="view-restaurant" class="view-section">
					<div id="restaurant-dashboard-content"></div>
				</section>

				<!-- Role 3: Inspector Portal View -->
				<section id="view-inspector" class="view-section">
					<div id="inspector-portal-content"></div>
				</section>

				<!-- Role 4: Senior Command Center View -->
				<section id="view-senior" class="view-section">
					<div id="senior-dashboard-content"></div>
				</section>

				<!-- Role 5: Reports View -->
				<section id="view-reports" class="view-section">
					<div id="reports-content"></div>
				</section>
			</div>
		</div>

	</main>

	<!-- 6. Formal Government Footer -->
	<footer class="gov-site-footer">
		<div class="gov-footer-content">
			<div>
				<div style="font-weight:700;font-size:12px;color:#ffffff;margin-bottom:2px;">MAHARASHTRA FOOD TRUST MISSION (MFTM)</div>
				<div style="color:#d8e2dc;font-size:11px;">Food and Drug Administration (FDA), Government of Maharashtra</div>
				<div class="gov-footer-note">Important: This prototype is for demonstration purposes and is not an official government service unless separately authorized.</div>
			</div>
			<div class="gov-footer-links">
				<a href="#accessibility" onclick="window.MFTM.showAccessibilityInfo(); return false;">Accessibility</a>
				<a href="#privacy" onclick="window.MFTM.showPrivacyInfo(); return false;">Privacy</a>
				<a href="#terms" onclick="window.MFTM.showTermsInfo(); return false;">Terms</a>
				<a href="#help" onclick="window.MFTM.showHelpModal(); return false;">Help</a>
				<a href="#contact" onclick="window.MFTM.showContactModal(); return false;">Contact</a>
				<span style="color:#64748b;">|</span>
				<span style="color:#94a3b8;">Version: Prototype v1.0</span>
			</div>
		</div>
	</footer>

	<!-- ============================================================
	     GOVERNMENT MODALS (RESTRAINED, NO GLOW, NO GLASSMORPHISM)
	     ============================================================ -->

	<!-- Modal 1: Live Camera Compliance Capture -->
	<div id="modal-camera-capture" class="modal-backdrop">
		<div class="modal-dialog">
			<div class="modal-header">
				<h3>LIVE COMPLIANCE CAPTURE: <span id="camera-category-label">Kitchen Cleanliness</span></h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body">
				<div class="gov-camera-anti-cheat-bar">
					<span>🔒</span>
					<div><strong>LIVE CAMERA REQUIRED:</strong> Normal gallery upload is disabled. Photos must be taken live using the device camera to verify real-time premises compliance.</div>
				</div>

				<div class="gov-camera-viewfinder">
					<video id="camera-video" autoplay playsinline></video>
					<canvas id="camera-canvas" style="display:none;"></canvas>
					<img id="camera-preview-img" style="width:100%;height:100%;object-fit:cover;display:none;" alt="Captured preview" />
				</div>

				<div style="background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:10px 14px;font-size:11px;margin-bottom:12px;">
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
						<div>
							<span style="color:var(--text-muted);">GPS STATUS:</span><br>
							<strong id="camera-geo-status" style="color:var(--gov-green);">Verifying premises perimeter...</strong>
						</div>
						<div>
							<span style="color:var(--text-muted);">TIME RECORDING:</span><br>
							<strong style="font-family:var(--font-mono);color:var(--text-main);">Automatically recorded</strong>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-outline modal-close-trigger">Cancel</button>
				<button id="btn-camera-retake" class="btn btn-outline" style="display:none;">RETAKE</button>
				<button id="btn-camera-capture" class="btn btn-primary">CAPTURE PHOTO</button>
				<button id="btn-camera-submit" class="btn btn-saffron" style="display:none;">SUBMIT EVIDENCE</button>
			</div>
		</div>
	</div>

	<!-- Modal 2: Report a Concern / Citizen Complaint -->
	<div id="modal-complaint" class="modal-backdrop">
		<div class="modal-dialog">
			<div class="modal-header">
				<h3>REPORT A FOOD SAFETY CONCERN</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<form id="complaint-form">
				<div class="modal-body">
					<p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Your report will be registered with FDA Maharashtra and assigned to the local food safety enforcement squad.</p>
					
					<div class="gov-form-group">
						<label class="gov-form-label">Concern Category <span class="req-marker">*</span></label>
						<select id="complaint-category" class="gov-form-select" required>
							<option value="Cleanliness">Kitchen / Dining Cleanliness</option>
							<option value="Food Quality">Food Quality / Stale Ingredients</option>
							<option value="Hygiene">Staff Personal Hygiene / Gloves / Hairnets</option>
							<option value="Pest Concern">Pest / Insect Infestation Sighting</option>
							<option value="Food Storage">Improper Food Storage / Temperature</option>
							<option value="Water Quality">Drinking Water / Ice Quality</option>
							<option value="Other">Other Violation</option>
						</select>
					</div>

					<div class="gov-form-group">
						<label class="gov-form-label">Description of Concern <span class="req-marker">*</span></label>
						<textarea id="complaint-desc" required class="gov-form-textarea" style="height:90px;" placeholder="Please describe what you observed (e.g. food odor, cleanliness issue, pest sighting)..."></textarea>
						<div class="gov-form-help">Provide specific details to assist inspecting officers.</div>
					</div>

					<div class="gov-form-group">
						<label style="font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer;">
							<input type="checkbox" id="complaint-anon" checked /> Submit Anonymously (Identity protected under State Whistleblower Guidelines)
						</label>
					</div>

					<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
						<div class="gov-form-group">
							<label class="gov-form-label">Your Name (Optional)</label>
							<input type="text" id="complaint-name" class="gov-form-input" placeholder="Citizen name" />
						</div>
						<div class="gov-form-group">
							<label class="gov-form-label">Mobile for SMS Updates (Optional)</label>
							<input type="text" id="complaint-phone" class="gov-form-input" placeholder="10-digit number" />
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-outline modal-close-trigger">Cancel</button>
					<button type="submit" class="btn btn-saffron">SUBMIT COMPLAINT</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Modal 3: Complaint Submitted Success -->
	<div id="modal-complaint-success" class="modal-backdrop">
		<div class="modal-dialog">
			<div class="modal-header">
				<h3>CONCERN SUCCESSFULLY REGISTERED</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body" style="text-align:center;padding:24px 20px;">
				<div style="font-size:36px;margin-bottom:10px;">📋</div>
				<div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Official Reference Tracking Code</div>
				<div id="complaint-success-code" style="font-size:22px;font-weight:800;font-family:var(--font-mono);color:var(--gov-green-dark);margin:8px 0 16px 0;letter-spacing:1px;background:var(--off-white);padding:8px;border:1px dashed var(--border-color);border-radius:var(--radius-card);">MFTM-2026-000185</div>
				<p style="font-size:12px;color:var(--text-muted);max-width:440px;margin:0 auto 20px auto;line-height:1.6;">
					Your concern has been registered in the FDA Maharashtra enforcement system. You can track investigation milestones anytime using this code.
				</p>
				<button class="btn btn-primary" onclick="window.MFTM.closeAllModals()">DONE</button>
			</div>
		</div>
	</div>

	<!-- Modal 4: Complaint Tracker -->
	<div id="modal-complaint-tracker" class="modal-backdrop">
		<div class="modal-dialog">
			<div class="modal-header">
				<h3>COMPLAINT INVESTIGATION TRACKER</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body" id="complaint-tracker-body"></div>
			<div class="modal-footer">
				<button class="btn btn-outline modal-close-trigger">CLOSE</button>
			</div>
		</div>
	</div>

	<!-- Modal 5: 6-Step Guided Field Inspection Wizard (Digital Government Form) -->
	<div id="modal-inspection-wizard" class="modal-backdrop">
		<div class="modal-dialog" style="max-width:680px;">
			<div class="modal-header">
				<h3>FDA OFFICIAL FIELD INSPECTION WORKFLOW</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body">
				<div style="display:flex;border-bottom:1px solid var(--border-color);margin-bottom:16px;background:var(--off-white);border-radius:var(--radius-card);overflow:hidden;">
					<div class="wizard-step-tab active" data-step="1" style="flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;border-bottom:2px solid var(--gov-green);color:var(--gov-green-dark);">1. Location</div>
					<div class="wizard-step-tab" data-step="2" style="flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);">2. Checklist</div>
					<div class="wizard-step-tab" data-step="3" style="flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);">3. Evidence</div>
					<div class="wizard-step-tab" data-step="4" style="flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);">4. Findings</div>
					<div class="wizard-step-tab" data-step="5" style="flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);">5. Result</div>
					<div class="wizard-step-tab" data-step="6" style="flex:1;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);">6. Signoff</div>
				</div>

				<div id="wizard-step-content" style="min-height:260px;"></div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-outline" onclick="window.MFTM.wizardBack()">BACK</button>
				<button class="btn btn-saffron" onclick="window.MFTM.wizardNext()">NEXT STEP →</button>
			</div>
		</div>
	</div>

	<!-- Modal 6: Inspector Confidential Establishment Dossier -->
	<div id="modal-inspector-est-details" class="modal-backdrop">
		<div class="modal-dialog" style="max-width:640px;">
			<div class="modal-header">
				<h3>ESTABLISHMENT DETAILS &amp; CONFIDENTIAL DOSSIER</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body" id="inspector-est-modal-body"></div>
		</div>
	</div>

	<!-- Modal 7: Senior Officer Assign Inspection -->
	<div id="modal-assign-inspection" class="modal-backdrop">
		<div class="modal-dialog">
			<div class="modal-header">
				<h3>DISPATCH FIELD INSPECTION ORDER</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body">
				<div style="background:var(--off-white);padding:10px 14px;border:1px solid var(--border-color);border-radius:var(--radius-card);margin-bottom:14px;">
					<div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Establishment Target</div>
					<strong id="assign-est-name" style="font-size:14px;color:var(--gov-green-dark);">Spice Symphony</strong>
				</div>
				<input type="hidden" id="assign-est-id" value="1" />

				<div class="gov-form-group">
					<label class="gov-form-label">Assign to FDA Field Inspector <span class="req-marker">*</span></label>
					<select id="assign-inspector-select" class="gov-form-select">
						<option value="2">Inspector Vikram Deshmukh (Pune Enforcement Squad)</option>
						<option value="3">Inspector Ananya Rao (Mumbai City Division)</option>
						<option value="4">Inspector Nilesh Gokhale (Thane West Squad)</option>
						<option value="5">Inspector Sandeep Tiwari (Nagpur Zone)</option>
						<option value="6">Inspector Hemant Shirsath (Nashik Circle)</option>
					</select>
				</div>

				<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
					<div class="gov-form-group">
						<label class="gov-form-label">Priority Level <span class="req-marker">*</span></label>
						<select id="assign-priority-select" class="gov-form-select">
							<option value="NORMAL">Normal Routine</option>
							<option value="HIGH" selected>High Priority (Within 48h)</option>
							<option value="URGENT">Urgent (Within 24h)</option>
							<option value="EMERGENCY">Emergency (Immediate)</option>
						</select>
					</div>
					<div class="gov-form-group">
						<label class="gov-form-label">Completion Deadline <span class="req-marker">*</span></label>
						<input type="date" id="assign-deadline-input" value="2026-09-20" class="gov-form-input" />
					</div>
				</div>

				<div class="gov-form-group">
					<label class="gov-form-label">Enforcement Instructions / Notes</label>
					<textarea id="assign-notes" class="gov-form-textarea" style="height:70px;" placeholder="Specify inspection focus (e.g. citizen pest complaint, temperature violation check)..."></textarea>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-outline modal-close-trigger">CANCEL</button>
				<button class="btn btn-saffron" onclick="window.MFTM.submitAssignment()">ISSUE INSPECTION ORDER</button>
			</div>
		</div>
	</div>

	<!-- Modal 8: Physical QR Poster Simulator -->
	<div id="modal-qr-display" class="modal-backdrop">
		<div class="modal-dialog" style="max-width:440px;text-align:center;">
			<div class="modal-header">
				<h3 id="qr-modal-title">QR CODE SPECIFICATION</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body" style="padding:20px;">
				<div style="font-size:15px;font-weight:800;color:var(--gov-green-dark);margin-bottom:2px;" id="qr-modal-est-name">Spice Symphony</div>
				<p id="qr-modal-desc" style="font-size:11px;color:var(--text-muted);margin-bottom:16px;"></p>
				
				<div id="qr-svg-container" style="display:flex;justify-content:center;margin-bottom:14px;background:#ffffff;padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-card);"></div>

				<div style="background:var(--off-white);border:1px solid var(--border-color);border-radius:var(--radius-card);padding:8px 12px;font-size:11px;color:var(--text-muted);">
					Display mandatorily at establishment customer entrance &amp; cash counter as per Food Safety Regulations.
				</div>
			</div>
			<div class="modal-footer" style="justify-content:center;">
				<button class="btn btn-primary" onclick="window.print()">PRINT POSTER</button>
				<button class="btn btn-outline modal-close-trigger">CLOSE</button>
			</div>
		</div>
	</div>

	<!-- Modal 9: Lightbox Image Viewer -->
	<div id="modal-lightbox" class="modal-backdrop">
		<div class="modal-dialog" style="max-width:680px;">
			<div class="modal-header">
				<h3>VERIFIED EVIDENCE PHOTO</h3>
				<button class="modal-close-btn modal-close-trigger">&times;</button>
			</div>
			<div class="modal-body" style="padding:0;background:#000;">
				<img id="lightbox-img" style="width:100%;max-height:75vh;object-fit:contain;display:block;" alt="Evidence photograph" />
			</div>
			<div class="modal-footer">
				<button class="btn btn-outline modal-close-trigger">CLOSE</button>
			</div>
		</div>
	</div>

	<!-- Client-Side QR & Application Scripts -->
	<script src="<?php echo esc_url( $plugin_url . 'assets/js/qr-generator.js?v=' . time() ); ?>"></script>
	<script src="<?php echo esc_url( $plugin_url . 'assets/js/mftm-app.js?v=' . time() ); ?>"></script>

</body>
</html>
