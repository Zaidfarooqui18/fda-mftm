<?php
/**
 * REST API Endpoints for Maharashtra Food Trust Mission
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MFTM_API {

	public static function register_routes() {
		$namespace = 'mftm/v1';

		// Public Routes (No authentication required)
		register_rest_route( $namespace, '/public/restaurant/(?P<id_or_code>[a-zA-Z0-9_-]+)', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_public_restaurant' ),
			'permission_callback' => array( __CLASS__, 'verify_public' ),
		) );

		register_rest_route( $namespace, '/public/complaint', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'submit_public_complaint' ),
			'permission_callback' => array( __CLASS__, 'verify_public' ),
		) );

		register_rest_route( $namespace, '/public/complaint/track/(?P<code>[a-zA-Z0-9_-]+)', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'track_public_complaint' ),
			'permission_callback' => array( __CLASS__, 'verify_public' ),
		) );

		// Restaurant Portal Routes
		register_rest_route( $namespace, '/restaurant/dashboard', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_restaurant_dashboard' ),
			'permission_callback' => array( __CLASS__, 'verify_restaurant' ),
		) );

		register_rest_route( $namespace, '/restaurant/compliance', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'submit_restaurant_compliance' ),
			'permission_callback' => array( __CLASS__, 'verify_restaurant' ),
		) );

		// Inspector Portal Routes
		register_rest_route( $namespace, '/inspector/search', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'search_inspector_establishments' ),
			'permission_callback' => array( __CLASS__, 'verify_inspector' ),
		) );

		register_rest_route( $namespace, '/inspector/establishment/(?P<id>\d+)', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_inspector_establishment' ),
			'permission_callback' => array( __CLASS__, 'verify_inspector' ),
		) );

		register_rest_route( $namespace, '/inspector/inspection', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'submit_inspector_inspection' ),
			'permission_callback' => array( __CLASS__, 'verify_inspector' ),
		) );

		// Senior Officer & Command Center Routes
		register_rest_route( $namespace, '/senior/command-dashboard', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_senior_command_dashboard' ),
			'permission_callback' => array( __CLASS__, 'verify_senior' ),
		) );

		register_rest_route( $namespace, '/senior/assign-inspection', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( __CLASS__, 'assign_inspection' ),
			'permission_callback' => array( __CLASS__, 'verify_senior' ),
		) );

		// Reports & Export (Senior only)
		register_rest_route( $namespace, '/reports', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_reports' ),
			'permission_callback' => array( __CLASS__, 'verify_senior' ),
		) );

		// All Establishments List
		register_rest_route( $namespace, '/establishments', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'get_all_establishments' ),
			'permission_callback' => array( __CLASS__, 'verify_public' ),
		) );
	}

	public static function verify_public() { return true; }
	
	public static function verify_restaurant( $request ) { return self::check_role_hierarchy( $request, 'restaurant' ); }
	
	public static function verify_inspector( $request ) { return self::check_role_hierarchy( $request, 'inspector' ); }
	
	public static function verify_senior( $request ) { return self::check_role_hierarchy( $request, 'senior' ); }

	private static function check_role_hierarchy( $request, $required_role ) {
		$role = $request->get_header( 'x-mftm-role' );
		if ( ! $role ) {
			$role = $request->get_header( 'x_mftm_role' );
		}
		if ( ! $role && isset( $_SERVER['HTTP_X_MFTM_ROLE'] ) ) {
			$role = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_MFTM_ROLE'] ) );
		}
		if ( ! $role && isset( $_GET['role'] ) ) {
			$role = sanitize_text_field( wp_unslash( $_GET['role'] ) );
		}
		if ( ! $role ) {
			$role = 'senior';
		}
		
		$hierarchy = array( 'public' => 0, 'restaurant' => 1, 'inspector' => 2, 'senior' => 3 );
		if ( ! isset( $hierarchy[ $role ] ) || ! isset( $hierarchy[ $required_role ] ) ) return false;
		
		return $hierarchy[ $role ] >= $hierarchy[ $required_role ];
	}

	public static function calculate_distance_meters( $lat1, $lon1, $lat2, $lon2 ) {
		$earth_radius = 6371000;

		$dLat = deg2rad( $lat2 - $lat1 );
		$dLon = deg2rad( $lon2 - $lon1 );

		$a = sin( $dLat / 2 ) * sin( $dLat / 2 ) +
			 cos( deg2rad( $lat1 ) ) * cos( deg2rad( $lat2 ) ) *
			 sin( $dLon / 2 ) * sin( $dLon / 2 );

		$c = 2 * atan2( sqrt( $a ), sqrt( 1 - $a ) );
		return $earth_radius * $c;
	}

	public static function get_public_restaurant( $request ) {
		global $wpdb;
		$id_or_code = $request['id_or_code'];

		$table_est   = MFTM_DB::$table_establishments;
		$table_sub   = MFTM_DB::$table_submissions;
		$table_insp  = MFTM_DB::$table_inspections;
		$table_qr    = MFTM_DB::$table_qr;

		if ( is_numeric( $id_or_code ) ) {
			$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_est WHERE id = %d", intval( $id_or_code ) ) );
		} else {
			$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_est WHERE establishment_code = %s", $id_or_code ) );
			if ( ! $establishment ) {
				$eid = $wpdb->get_var( $wpdb->prepare( "SELECT establishment_id FROM $table_qr WHERE secure_token = %s", $id_or_code ) );
				if ( $eid ) {
					$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_est WHERE id = %d", $eid ) );
				}
			}
		}

		if ( ! $establishment ) {
			return new WP_Error( 'not_found', 'Establishment not found', array( 'status' => 404 ) );
		}

		$est_id = intval( $establishment->id );
		$today = current_time( 'Y-m-d' );
		$today_day_name = current_time( 'D' );

		$operating_days = json_decode( $establishment->operating_days, true );
		if ( ! is_array( $operating_days ) ) {
			$operating_days = array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' );
		}

		$is_scheduled_closed_today = ! in_array( $today_day_name, $operating_days, true );

		$categories = array(
			'Kitchen Cleanliness',
			'Food Storage',
			'Handwash Area',
			'Waste Disposal',
			'Water Quality',
			'Pest Control',
			'Staff Hygiene',
		);

		$today_submissions = $wpdb->get_results( $wpdb->prepare(
			"SELECT category, photo_url, submission_date, submission_time, location_verification FROM $table_sub WHERE establishment_id = %d AND submission_date = %s",
			$est_id,
			$today
		), OBJECT_K );

		$last_submission = $wpdb->get_row( $wpdb->prepare(
			"SELECT submission_date, submission_time FROM $table_sub WHERE establishment_id = %d ORDER BY submission_date DESC, submission_time DESC LIMIT 1",
			$est_id
		) );

		$compliance_cards = array();
		foreach ( $categories as $cat ) {
			if ( isset( $today_submissions[ $cat ] ) ) {
				$sub = $today_submissions[ $cat ];
				$compliance_cards[] = array(
					'category'              => $cat,
					'has_submission'        => true,
					'photo_url'             => $sub->photo_url,
					'submission_time'       => date( 'h:i A', strtotime( $sub->submission_time ) ),
					'submission_date'       => $sub->submission_date,
					'status_badge'          => "✓ Today's Evidence Submitted",
					'location_verification' => $sub->location_verification,
					'is_closed_day'         => false,
				);
			} else {
				$compliance_cards[] = array(
					'category'              => $cat,
					'has_submission'        => false,
					'photo_url'             => null,
					'submission_time'       => null,
					'submission_date'       => null,
					'status_badge'          => $is_scheduled_closed_today ? 'Scheduled Closed Day' : "Today's compliance evidence has not been submitted.",
					'last_submitted_text'   => $last_submission ? date( 'd M Y, h:i A', strtotime( $last_submission->submission_date . ' ' . $last_submission->submission_time ) ) : 'No prior submissions',
					'is_closed_day'         => $is_scheduled_closed_today,
				);
			}
		}

		$last_insp = $wpdb->get_row( $wpdb->prepare(
			"SELECT inspection_date, overall_result FROM $table_insp WHERE establishment_id = %d ORDER BY inspection_date DESC LIMIT 1",
			$est_id
		) );

		$rating_data = MFTM_Risk_Engine::calculate_transparency_rating( $est_id );

		MFTM_DB::log_action( 0, 'PUBLIC_CUSTOMER', 'Scanned Public QR Code', 'ESTABLISHMENT', $est_id );

		return rest_ensure_response( array(
			'id'                        => $establishment->id,
			'establishment_code'        => $establishment->establishment_code,
			'name'                      => $establishment->name,
			'fssai_license'             => $establishment->fssai_license,
			'category'                  => $establishment->category,
			'address'                   => $establishment->address,
			'district'                  => $establishment->district,
			'ward'                      => $establishment->ward,
			'license_status'            => $establishment->license_status,
			'license_validity'          => date( 'd M Y', strtotime( $establishment->license_validity ) ),
			'operating_days'            => $operating_days,
			'opening_time'              => $establishment->opening_time,
			'closing_time'              => $establishment->closing_time,
			'is_scheduled_closed_today' => $is_scheduled_closed_today,
			'today_day_name'            => $today_day_name,
			'transparency_rating'       => $rating_data['rating'],
			'rating_breakdown'          => $rating_data['breakdown'],
			'rating_explanation'        => $rating_data['explanation'],
			'compliance_cards'          => $compliance_cards,
			'last_inspection'           => $last_insp ? array(
				'date'   => date( 'd M Y', strtotime( $last_insp->inspection_date ) ),
				'result' => $last_insp->overall_result,
			) : array(
				'date'   => 'Inspection Pending',
				'result' => 'NEW_REGISTRATION',
			),
			'disclaimer'                => 'Demonstration Prototype — Data shown is fictional and for concept demonstration only.',
		) );
	}

	public static function submit_public_complaint( $request ) {
		global $wpdb;
		$params = $request->get_json_params();

		$establishment_id = intval( isset( $params['establishment_id'] ) ? $params['establishment_id'] : 1 );
		$category         = sanitize_text_field( isset( $params['category'] ) ? $params['category'] : 'Cleanliness' );
		$description      = sanitize_textarea_field( isset( $params['description'] ) ? $params['description'] : '' );
		$is_anonymous     = ! empty( $params['is_anonymous'] ) ? 1 : 0;
		$customer_name    = $is_anonymous ? 'Anonymous Citizen' : sanitize_text_field( isset( $params['customer_name'] ) ? $params['customer_name'] : 'Citizen' );
		$customer_phone   = $is_anonymous ? '' : sanitize_text_field( isset( $params['customer_phone'] ) ? $params['customer_phone'] : '' );
		$evidence_photo   = isset( $params['evidence_photo'] ) ? $params['evidence_photo'] : '';

		if ( empty( $description ) ) {
			return new WP_Error( 'missing_field', 'Please provide a description of your concern.', array( 'status' => 400 ) );
		}

		$table_complaints = MFTM_DB::$table_complaints;
		$next_num = $wpdb->get_var( "SELECT COUNT(*) FROM $table_complaints" ) + 185;
		$complaint_code = sprintf( 'MFTM-2026-%06d', $next_num );

		$priority = 'MEDIUM';
		if ( in_array( $category, array( 'Pest Concern', 'Food Quality' ), true ) ) {
			$priority = 'HIGH';
		}

		$now = current_time( 'mysql' );
		$wpdb->insert(
			$table_complaints,
			array(
				'complaint_code'       => $complaint_code,
				'establishment_id'     => $establishment_id,
				'category'             => $category,
				'description'          => $description,
				'evidence_photo'       => $evidence_photo,
				'customer_name'        => $customer_name,
				'customer_phone'       => $customer_phone,
				'is_anonymous'         => $is_anonymous,
				'status'               => 'SUBMITTED',
				'priority'             => $priority,
				'assigned_inspector_id'=> 2,
				'internal_notes'       => 'Citizen submission logged via Public QR interface.',
				'resolution_summary'   => '',
				'created_at'           => $now,
				'updated_at'           => $now,
			)
		);

		MFTM_Risk_Engine::calculate_risk( $establishment_id );
		MFTM_Risk_Engine::calculate_transparency_rating( $establishment_id );

		MFTM_DB::log_action( 0, 'CITIZEN', 'Submitted Concern / Complaint', 'COMPLAINT', $wpdb->insert_id, "Complaint ID: $complaint_code ($category)" );

		return rest_ensure_response( array(
			'success'        => true,
			'complaint_code' => $complaint_code,
			'status'         => 'SUBMITTED',
			'message'        => 'Your concern has been registered with FDA Maharashtra Food Trust Mission.',
			'tracking_url'   => "/public/complaint/track/$complaint_code",
			'created_at'     => date( 'd M Y, h:i A', strtotime( $now ) ),
		) );
	}

	public static function track_public_complaint( $request ) {
		global $wpdb;
		$code = $request['code'];

		$table_complaints = MFTM_DB::$table_complaints;
		$table_est        = MFTM_DB::$table_establishments;

		$complaint = $wpdb->get_row( $wpdb->prepare(
			"SELECT c.*, e.name as establishment_name, e.district FROM $table_complaints c JOIN $table_est e ON c.establishment_id = e.id WHERE c.complaint_code = %s",
			$code
		) );

		if ( ! $complaint ) {
			return new WP_Error( 'not_found', 'Complaint record not found', array( 'status' => 404 ) );
		}

		$stages = array(
			'SUBMITTED'           => array( 'title' => 'Submitted', 'desc' => 'Concern received in FDA portal' ),
			'RECEIVED'            => array( 'title' => 'Received & Triaged', 'desc' => 'Verified by district cell' ),
			'ASSIGNED'            => array( 'title' => 'Assigned', 'desc' => 'Allocated to division food safety officer' ),
			'UNDER_INVESTIGATION' => array( 'title' => 'Under Investigation', 'desc' => 'Cross-checking evidence & logs' ),
			'INSPECTION_REQUIRED' => array( 'title' => 'Inspection Scheduled', 'desc' => 'Physical inspection mandated' ),
			'ACTION_TAKEN'        => array( 'title' => 'Action Taken', 'desc' => 'Corrective notice / verification done' ),
			'RESOLVED'            => array( 'title' => 'Resolved', 'desc' => 'Final closure verified' ),
		);

		return rest_ensure_response( array(
			'complaint_code'      => $complaint->complaint_code,
			'category'            => $complaint->category,
			'status'              => $complaint->status,
			'establishment_name'  => $complaint->establishment_name,
			'district'            => $complaint->district,
			'description'         => $complaint->description,
			'created_at'          => date( 'd M Y, h:i A', strtotime( $complaint->created_at ) ),
			'resolution_summary'  => $complaint->resolution_summary,
			'stages'              => $stages,
		) );
	}

	public static function get_restaurant_dashboard( $request ) {
		global $wpdb;
		$table_est  = MFTM_DB::$table_establishments;
		$table_sub  = MFTM_DB::$table_submissions;
		$table_comp = MFTM_DB::$table_complaints;
		$table_insp = MFTM_DB::$table_inspections;
		$table_qr   = MFTM_DB::$table_qr;

		$est_id = isset( $_GET['establishment_id'] ) ? intval( $_GET['establishment_id'] ) : 1;
		$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_est WHERE id = %d", $est_id ) );

		if ( ! $establishment ) {
			return new WP_Error( 'not_found', 'Establishment not found', array( 'status' => 404 ) );
		}

		$today = current_time( 'Y-m-d' );
		$categories = array(
			'Kitchen Cleanliness',
			'Food Storage',
			'Handwash Area',
			'Waste Disposal',
			'Water Quality',
			'Pest Control',
			'Staff Hygiene',
		);

		$today_subs = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table_sub WHERE establishment_id = %d AND submission_date = %s",
			$est_id,
			$today
		), OBJECT_K );

		$cat_status = array();
		$completed_count = 0;
		foreach ( $categories as $c ) {
			if ( isset( $today_subs[ $c ] ) ) {
				$sub = $today_subs[ $c ];
				$completed_count++;
				$cat_status[] = array(
					'category'              => $c,
					'is_submitted'          => true,
					'photo_url'             => $sub->photo_url,
					'time'                  => date( 'h:i A', strtotime( $sub->submission_time ) ),
					'location_verification' => $sub->location_verification,
					'gps_accuracy'          => $sub->gps_accuracy,
					'capture_session_id'    => $sub->capture_session_id,
				);
			} else {
				$cat_status[] = array(
					'category'     => $c,
					'is_submitted' => false,
					'photo_url'    => null,
					'time'         => null,
					'location_verification' => 'PENDING',
				);
			}
		}

		$pub_qr = $wpdb->get_var( $wpdb->prepare( "SELECT secure_token FROM $table_qr WHERE establishment_id = %d AND qr_type = 'PUBLIC_CUSTOMER'", $est_id ) );
		$insp_qr = $wpdb->get_var( $wpdb->prepare( "SELECT secure_token FROM $table_qr WHERE establishment_id = %d AND qr_type = 'INSPECTOR_FIELD'", $est_id ) );

		$complaints = $wpdb->get_results( $wpdb->prepare(
			"SELECT complaint_code, category, description, status, created_at, resolution_summary FROM $table_comp WHERE establishment_id = %d ORDER BY created_at DESC LIMIT 5",
			$est_id
		) );

		$last_insp = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM $table_insp WHERE establishment_id = %d ORDER BY inspection_date DESC LIMIT 1",
			$est_id
		) );

		return rest_ensure_response( array(
			'establishment'    => $establishment,
			'operating_days'   => json_decode( $establishment->operating_days, true ),
			'today_date'       => date( 'd M Y' ),
			'today_day_name'   => current_time( 'D' ),
			'today_submission_count' => $completed_count,
			'total_categories' => count( $categories ),
			'categories_status'=> $cat_status,
			'public_qr_token'  => $pub_qr,
			'inspector_qr_token'=> $insp_qr,
			'complaints'       => $complaints,
			'last_inspection'  => $last_insp,
			'rating'           => $establishment->current_rating,
		) );
	}

	public static function submit_restaurant_compliance( $request ) {
		global $wpdb;
		$params = $request->get_json_params();

		$establishment_id = intval( isset( $params['establishment_id'] ) ? $params['establishment_id'] : 1 );
		$category         = sanitize_text_field( isset( $params['category'] ) ? $params['category'] : 'Kitchen Cleanliness' );
		$photo_url        = isset( $params['photo_url'] ) ? $params['photo_url'] : '';
		$lat              = floatval( isset( $params['latitude'] ) ? $params['latitude'] : 0.0 );
		$lng              = floatval( isset( $params['longitude'] ) ? $params['longitude'] : 0.0 );
		$accuracy         = floatval( isset( $params['gps_accuracy'] ) ? $params['gps_accuracy'] : 5.0 );
		$capture_session  = sanitize_text_field( isset( $params['capture_session_id'] ) ? $params['capture_session_id'] : ( 'sess_live_' . uniqid() ) );
		$notes            = sanitize_textarea_field( isset( $params['submission_notes'] ) ? $params['submission_notes'] : '' );

		$table_est = MFTM_DB::$table_establishments;
		$table_sub = MFTM_DB::$table_submissions;

		$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_est WHERE id = %d", $establishment_id ) );
		if ( ! $establishment ) {
			return new WP_Error( 'not_found', 'Establishment not found', array( 'status' => 404 ) );
		}

		$distance_meters = 0;
		$loc_status = 'VERIFIED';
		if ( $lat != 0.0 && $lng != 0.0 && $establishment->latitude != 0.0 ) {
			$distance_meters = self::calculate_distance_meters( $lat, $lng, $establishment->latitude, $establishment->longitude );
			if ( $distance_meters > 100.0 ) {
				$loc_status = 'REQUIRES_REVIEW';
			}
		}

		$today = current_time( 'Y-m-d' );
		$time  = current_time( 'H:i:s' );

		$existing_id = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM $table_sub WHERE establishment_id = %d AND category = %s AND submission_date = %s",
			$establishment_id,
			$category,
			$today
		) );

		if ( $existing_id ) {
			$wpdb->update(
				$table_sub,
				array(
					'photo_url'             => $photo_url,
					'submission_time'       => $time,
					'latitude'              => $lat,
					'longitude'             => $lng,
					'gps_accuracy'          => $accuracy,
					'location_verification' => $loc_status,
					'capture_session_id'    => $capture_session,
					'submission_notes'      => $notes,
				),
				array( 'id' => $existing_id )
			);
			$sub_id = $existing_id;
		} else {
			$wpdb->insert(
				$table_sub,
				array(
					'establishment_id'      => $establishment_id,
					'category'              => $category,
					'user_id'               => 1,
					'photo_url'             => $photo_url,
					'submission_date'       => $today,
					'submission_time'       => $time,
					'latitude'              => $lat,
					'longitude'             => $lng,
					'gps_accuracy'          => $accuracy,
					'location_verification' => $loc_status,
					'capture_session_id'    => $capture_session,
					'submission_notes'      => $notes,
					'created_at'            => "$today $time",
				)
			);
			$sub_id = $wpdb->insert_id;
		}

		MFTM_Risk_Engine::calculate_risk( $establishment_id );
		$rating_data = MFTM_Risk_Engine::calculate_transparency_rating( $establishment_id );

		MFTM_DB::log_action( 1, 'RESTAURANT_OWNER', "Submitted Live Compliance Evidence ($category)", 'COMPLIANCE', $sub_id, array(
			'location_status' => $loc_status,
			'distance_meters' => round( $distance_meters, 1 ),
			'timestamp'       => "$today $time",
		) );

		return rest_ensure_response( array(
			'success'               => true,
			'submission_id'         => $sub_id,
			'category'              => $category,
			'submission_time'       => date( 'h:i A', strtotime( $time ) ),
			'location_verification' => $loc_status,
			'distance_meters'       => round( $distance_meters, 1 ),
			'location_message'      => ( $loc_status === 'VERIFIED' ) ? 'Location Verified (Within 100m of registered premises)' : 'Location Outside Expected Area (Requires Review)',
			'new_rating'            => $rating_data['rating'],
		) );
	}

	public static function search_inspector_establishments( $request ) {
		global $wpdb;
		$table_est = MFTM_DB::$table_establishments;
		$table_qr  = MFTM_DB::$table_qr;

		$query = isset( $_GET['q'] ) ? sanitize_text_field( trim( $_GET['q'] ) ) : '';

		if ( empty( $query ) ) {
			$results = $wpdb->get_results( "SELECT id, establishment_code, name, fssai_license, district, ward, risk_level, risk_score, current_rating FROM $table_est ORDER BY risk_score DESC LIMIT 10" );
			return rest_ensure_response( $results );
		}

		$qr_est_id = $wpdb->get_var( $wpdb->prepare( "SELECT establishment_id FROM $table_qr WHERE secure_token = %s", $query ) );
		if ( $qr_est_id ) {
			$results = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_est WHERE id = %d", $qr_est_id ) );
			return rest_ensure_response( $results );
		}

		$like = '%' . $wpdb->esc_like( $query ) . '%';
		$results = $wpdb->get_results( $wpdb->prepare(
			"SELECT id, establishment_code, name, fssai_license, district, ward, risk_level, risk_score, current_rating FROM $table_est WHERE fssai_license LIKE %s OR name LIKE %s OR establishment_code LIKE %s OR district LIKE %s ORDER BY risk_score DESC",
			$like, $like, $like, $like
		) );

		return rest_ensure_response( $results );
	}

	public static function get_inspector_establishment( $request ) {
		global $wpdb;
		$est_id = intval( $request['id'] );

		$table_est   = MFTM_DB::$table_establishments;
		$table_sub   = MFTM_DB::$table_submissions;
		$table_insp  = MFTM_DB::$table_inspections;
		$table_comp  = MFTM_DB::$table_complaints;
		$table_audit = MFTM_DB::$table_audit;

		$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_est WHERE id = %d", $est_id ) );
		if ( ! $establishment ) {
			return new WP_Error( 'not_found', 'Establishment not found', array( 'status' => 404 ) );
		}

		$today = current_time( 'Y-m-d' );
		$today_subs = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table_sub WHERE establishment_id = %d AND submission_date = %s ORDER BY submission_time ASC",
			$est_id,
			$today
		) );

		$history_subs = $wpdb->get_results( $wpdb->prepare(
			"SELECT submission_date, COUNT(*) as count, MIN(location_verification) as worst_loc FROM $table_sub WHERE establishment_id = %d GROUP BY submission_date ORDER BY submission_date DESC LIMIT 14",
			$est_id
		) );

		$inspections = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table_insp WHERE establishment_id = %d ORDER BY inspection_date DESC",
			$est_id
		) );

		$complaints = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table_comp WHERE establishment_id = %d ORDER BY created_at DESC",
			$est_id
		) );

		$audit_trail = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table_audit WHERE entity_type = 'ESTABLISHMENT' AND entity_id = %d OR entity_type = 'COMPLIANCE' ORDER BY created_at DESC LIMIT 10",
			$est_id
		) );

		MFTM_DB::log_action( 2, 'FDA_INSPECTOR', 'Opened Establishment Internal Profile', 'ESTABLISHMENT', $est_id );

		return rest_ensure_response( array(
			'establishment'    => $establishment,
			'operating_days'   => json_decode( $establishment->operating_days, true ),
			'risk_factors'     => json_decode( $establishment->risk_factors, true ),
			'today_submissions'=> $today_subs,
			'compliance_history'=> $history_subs,
			'inspections'      => $inspections,
			'complaints'       => $complaints,
			'audit_trail'      => $audit_trail,
		) );
	}

	public static function submit_inspector_inspection( $request ) {
		global $wpdb;
		$params = $request->get_json_params();

		$establishment_id = intval( isset( $params['establishment_id'] ) ? $params['establishment_id'] : 1 );
		$inspector_name   = sanitize_text_field( isset( $params['inspector_name'] ) ? $params['inspector_name'] : 'Inspector Vikram Deshmukh' );
		$overall_result   = sanitize_text_field( isset( $params['overall_result'] ) ? $params['overall_result'] : 'SATISFACTORY' );
		$findings_level   = sanitize_text_field( isset( $params['findings_level'] ) ? $params['findings_level'] : 'MINOR' );
		$corrective_action= sanitize_textarea_field( isset( $params['corrective_action'] ) ? $params['corrective_action'] : '' );
		$checklist_data   = isset( $params['checklist_data'] ) ? json_encode( $params['checklist_data'] ) : '[]';
		$evidence_photos  = isset( $params['evidence_photos'] ) ? json_encode( $params['evidence_photos'] ) : '[]';
		$notes            = sanitize_textarea_field( isset( $params['notes'] ) ? $params['notes'] : '' );
		$lat              = floatval( isset( $params['latitude'] ) ? $params['latitude'] : 18.5204 );
		$lng              = floatval( isset( $params['longitude'] ) ? $params['longitude'] : 73.8567 );

		$table_insp   = MFTM_DB::$table_inspections;
		$table_assign = MFTM_DB::$table_assignments;

		$next_num = $wpdb->get_var( "SELECT COUNT(*) FROM $table_insp" ) + 245;
		$insp_code = sprintf( 'INSP-MH-2026-%04d', $next_num );

		$now_date = current_time( 'Y-m-d' );
		$now_time = current_time( 'H:i:s' );

		$wpdb->insert(
			$table_insp,
			array(
				'inspection_code'  => $insp_code,
				'establishment_id' => $establishment_id,
				'inspector_id'     => 2,
				'inspector_name'   => $inspector_name,
				'inspection_date'  => $now_date,
				'inspection_time'  => $now_time,
				'latitude'         => $lat,
				'longitude'        => $lng,
				'overall_result'   => $overall_result,
				'findings_level'   => $findings_level,
				'corrective_action'=> $corrective_action,
				'evidence_photos'  => $evidence_photos,
				'checklist_data'   => $checklist_data,
				'notes'            => $notes,
				'created_at'       => "$now_date $now_time",
			)
		);
		$insp_id = $wpdb->insert_id;

		$wpdb->update(
			$table_assign,
			array( 'status' => 'COMPLETED', 'updated_at' => current_time( 'mysql' ) ),
			array( 'establishment_id' => $establishment_id, 'status' => 'ASSIGNED' )
		);

		MFTM_Risk_Engine::calculate_risk( $establishment_id );
		MFTM_Risk_Engine::calculate_transparency_rating( $establishment_id );

		MFTM_DB::log_action( 2, 'FDA_INSPECTOR', "Completed & Submitted Inspection ($insp_code: $overall_result)", 'INSPECTION', $insp_id, array(
			'findings' => $findings_level,
			'result'   => $overall_result,
		) );

		return rest_ensure_response( array(
			'success'         => true,
			'inspection_code' => $insp_code,
			'result'          => $overall_result,
			'message'         => 'Official FDA Inspection report successfully recorded and added to audit trail.',
		) );
	}

	public static function get_senior_command_dashboard( $request ) {
		global $wpdb;

		$table_est    = MFTM_DB::$table_establishments;
		$table_sub    = MFTM_DB::$table_submissions;
		$table_insp   = MFTM_DB::$table_inspections;
		$table_comp   = MFTM_DB::$table_complaints;
		$table_assign = MFTM_DB::$table_assignments;

		$kpis = array(
			'total_establishments'   => 24536,
			'submitted_today'        => 18752,
			'submission_rate'        => 76.4,
			'missed_submissions'     => 3842,
			'high_risk'              => 1942,
			'active_complaints'      => 418,
			'inspections_this_month' => 1280,
			'overdue_inspections'    => 215,
		);

		$district_data = array(
			array( 'id' => 'mumbai_city', 'name' => 'Mumbai City', 'risk' => 'HIGH', 'compliance' => 71.2, 'establishments' => 3840, 'high_risk' => 380, 'complaints' => 64, 'inspections' => 184, 'color' => '#EA580C' ),
			array( 'id' => 'mumbai_sub', 'name' => 'Mumbai Suburban', 'risk' => 'HIGH', 'compliance' => 73.5, 'establishments' => 5210, 'high_risk' => 490, 'complaints' => 88, 'inspections' => 240, 'color' => '#EA580C' ),
			array( 'id' => 'pune', 'name' => 'Pune', 'risk' => 'MEDIUM', 'compliance' => 84.1, 'establishments' => 4150, 'high_risk' => 210, 'complaints' => 42, 'inspections' => 210, 'color' => '#D97706' ),
			array( 'id' => 'thane', 'name' => 'Thane', 'risk' => 'CRITICAL', 'compliance' => 68.4, 'establishments' => 2980, 'high_risk' => 340, 'complaints' => 76, 'inspections' => 140, 'color' => '#DC2626' ),
			array( 'id' => 'nagpur', 'name' => 'Nagpur', 'risk' => 'HIGH', 'compliance' => 74.0, 'establishments' => 1820, 'high_risk' => 165, 'complaints' => 31, 'inspections' => 95, 'color' => '#EA580C' ),
			array( 'id' => 'nashik', 'name' => 'Nashik', 'risk' => 'CRITICAL', 'compliance' => 66.8, 'establishments' => 1640, 'high_risk' => 195, 'complaints' => 45, 'inspections' => 88, 'color' => '#DC2626' ),
			array( 'id' => 'aurangabad', 'name' => 'Chhatrapati Sambhajinagar', 'risk' => 'MEDIUM', 'compliance' => 79.2, 'establishments' => 1240, 'high_risk' => 85, 'complaints' => 19, 'inspections' => 64, 'color' => '#D97706' ),
			array( 'id' => 'kolhapur', 'name' => 'Kolhapur', 'risk' => 'LOW', 'compliance' => 89.6, 'establishments' => 1180, 'high_risk' => 35, 'complaints' => 12, 'inspections' => 78, 'color' => '#15803D' ),
			array( 'id' => 'solapur', 'name' => 'Solapur', 'risk' => 'MEDIUM', 'compliance' => 76.5, 'establishments' => 940, 'high_risk' => 72, 'complaints' => 18, 'inspections' => 52, 'color' => '#D97706' ),
			array( 'id' => 'amravati', 'name' => 'Amravati', 'risk' => 'LOW', 'compliance' => 86.2, 'establishments' => 780, 'high_risk' => 28, 'complaints' => 9, 'inspections' => 46, 'color' => '#15803D' ),
			array( 'id' => 'nanded', 'name' => 'Nanded', 'risk' => 'MEDIUM', 'compliance' => 77.8, 'establishments' => 620, 'high_risk' => 45, 'complaints' => 14, 'inspections' => 38, 'color' => '#D97706' ),
			array( 'id' => 'sangli', 'name' => 'Sangli', 'risk' => 'LOW', 'compliance' => 88.0, 'establishments' => 590, 'high_risk' => 22, 'complaints' => 8, 'inspections' => 40, 'color' => '#15803D' ),
		);

		$priority_queue = $wpdb->get_results( "SELECT id, establishment_code, name, district, ward, risk_level, risk_score, risk_factors, license_status, current_rating, assigned_inspector_id FROM $table_est ORDER BY risk_score DESC LIMIT 8" );
		if ( is_array( $priority_queue ) ) {
			foreach ( $priority_queue as $item ) {
				$item->factors_list = json_decode( $item->risk_factors, true );
				$item->last_inspection = $wpdb->get_var( $wpdb->prepare( "SELECT overall_result FROM $table_insp WHERE establishment_id = %d ORDER BY inspection_date DESC LIMIT 1", $item->id ) );
			}
		}

		$inspectors = array(
			array( 'id' => 2, 'name' => 'Inspector Vikram Deshmukh', 'division' => 'Pune', 'assigned' => 14, 'completed_week' => 6, 'completed_month' => 24, 'pending' => 4, 'overdue' => 1, 'complaints_resolved' => 12 ),
			array( 'id' => 3, 'name' => 'Inspector Ananya Rao', 'division' => 'Mumbai City', 'assigned' => 18, 'completed_week' => 8, 'completed_month' => 31, 'pending' => 5, 'overdue' => 2, 'complaints_resolved' => 19 ),
			array( 'id' => 4, 'name' => 'Inspector Nilesh Gokhale', 'division' => 'Thane', 'assigned' => 16, 'completed_week' => 5, 'completed_month' => 22, 'pending' => 7, 'overdue' => 3, 'complaints_resolved' => 15 ),
			array( 'id' => 5, 'name' => 'Inspector Sandeep Tiwari', 'division' => 'Nagpur', 'assigned' => 11, 'completed_week' => 4, 'completed_month' => 18, 'pending' => 3, 'overdue' => 0, 'complaints_resolved' => 9 ),
			array( 'id' => 6, 'name' => 'Inspector Hemant Shirsath', 'division' => 'Nashik', 'assigned' => 15, 'completed_week' => 5, 'completed_month' => 20, 'pending' => 6, 'overdue' => 2, 'complaints_resolved' => 14 ),
		);

		$assignments = $wpdb->get_results( "SELECT a.*, e.name as establishment_name, e.district FROM $table_assign a JOIN $table_est e ON a.establishment_id = e.id ORDER BY a.created_at DESC LIMIT 5" );

		MFTM_DB::log_action( 3, 'SENIOR_FDA_OFFICER', 'Accessed Maharashtra Command Dashboard', 'SYSTEM', 0 );

		return rest_ensure_response( array(
			'kpis'            => $kpis,
			'district_data'   => $district_data,
			'priority_queue'  => $priority_queue,
			'inspectors'      => $inspectors,
			'assignments'     => $assignments,
			'last_updated'    => current_time( 'd M Y, h:i A' ),
		) );
	}

	public static function assign_inspection( $request ) {
		global $wpdb;
		$params = $request->get_json_params();

		$est_id       = intval( isset( $params['establishment_id'] ) ? $params['establishment_id'] : 0 );
		$inspector_id = intval( isset( $params['inspector_id'] ) ? $params['inspector_id'] : 2 );
		$priority     = sanitize_text_field( isset( $params['priority'] ) ? $params['priority'] : 'HIGH' );
		$deadline     = sanitize_text_field( isset( $params['deadline_date'] ) ? $params['deadline_date'] : date( 'Y-m-d', strtotime( '+3 days' ) ) );
		$notes        = sanitize_textarea_field( isset( $params['notes'] ) ? $params['notes'] : '' );

		$table_assign = MFTM_DB::$table_assignments;
		$table_est    = MFTM_DB::$table_establishments;

		$wpdb->insert(
			$table_assign,
			array(
				'establishment_id'    => $est_id,
				'inspector_id'        => $inspector_id,
				'assigned_by_user_id' => 3,
				'priority'            => $priority,
				'deadline_date'       => $deadline,
				'status'              => 'ASSIGNED',
				'notes'               => $notes,
				'created_at'          => current_time( 'mysql' ),
				'updated_at'          => current_time( 'mysql' ),
			)
		);
		$assignment_id = $wpdb->insert_id;

		$wpdb->update(
			$table_est,
			array( 'assigned_inspector_id' => $inspector_id ),
			array( 'id' => $est_id )
		);

		MFTM_DB::log_action( 3, 'SENIOR_FDA_OFFICER', "Assigned Inspection for Establishment #$est_id", 'ASSIGNMENT', $assignment_id, array(
			'priority' => $priority,
			'deadline' => $deadline,
		) );

		return rest_ensure_response( array(
			'success'       => true,
			'assignment_id' => $assignment_id,
			'message'       => 'Inspection order formally assigned to division field officer.',
		) );
	}

	public static function get_reports( $request ) {
		global $wpdb;

		$table_est   = MFTM_DB::$table_establishments;
		$table_insp  = MFTM_DB::$table_inspections;
		$table_comp  = MFTM_DB::$table_complaints;
		$table_audit = MFTM_DB::$table_audit;

		$type = isset( $_GET['type'] ) ? sanitize_text_field( $_GET['type'] ) : 'compliance';

		if ( $type === 'inspections' ) {
			$data = $wpdb->get_results( "SELECT i.*, e.name as establishment_name, e.district FROM $table_insp i JOIN $table_est e ON i.establishment_id = e.id ORDER BY i.inspection_date DESC LIMIT 50" );
		} elseif ( $type === 'complaints' ) {
			$data = $wpdb->get_results( "SELECT c.*, e.name as establishment_name, e.district FROM $table_comp c JOIN $table_est e ON c.establishment_id = e.id ORDER BY c.created_at DESC LIMIT 50" );
		} elseif ( $type === 'audit' ) {
			$data = $wpdb->get_results( "SELECT * FROM $table_audit ORDER BY created_at DESC LIMIT 50" );
		} else {
			$data = $wpdb->get_results( "SELECT id, establishment_code, name, fssai_license, district, ward, category, risk_level, risk_score, current_rating, license_status FROM $table_est ORDER BY risk_score DESC LIMIT 50" );
		}

		return rest_ensure_response( array(
			'type'      => $type,
			'count'     => count( $data ),
			'records'   => $data,
			'generated' => current_time( 'd M Y, h:i A' ),
		) );
	}

	public static function get_all_establishments( $request ) {
		global $wpdb;
		$table_est = MFTM_DB::$table_establishments;
		$table_qr  = MFTM_DB::$table_qr;

		$list = $wpdb->get_results( "SELECT e.id, e.establishment_code, e.name, e.fssai_license, e.district, e.ward, e.risk_level, e.risk_score, e.current_rating, q1.secure_token as public_qr_token, q2.secure_token as inspector_qr_token FROM $table_est e LEFT JOIN $table_qr q1 ON e.id = q1.establishment_id AND q1.qr_type = 'PUBLIC_CUSTOMER' LEFT JOIN $table_qr q2 ON e.id = q2.establishment_id AND q2.qr_type = 'INSPECTOR_FIELD' ORDER BY e.id ASC" );

		return rest_ensure_response( $list );
	}
}
