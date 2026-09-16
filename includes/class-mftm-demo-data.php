<?php
/**
 * Realistic Demonstration Data Seeder for Maharashtra Food Trust Mission
 *
 * Clearly flagged: DEMONSTRATION DATA (Fictional records for concept presentation)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MFTM_Demo_Data {

	public static function seed_all() {
		global $wpdb;

		$table_establishments = MFTM_DB::$table_establishments;
		$count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_establishments" );
		if ( $count > 0 ) {
			return; // Already seeded
		}

		self::create_demo_users();
		self::seed_establishments();
		self::seed_compliance_submissions();
		self::seed_inspections();
		self::seed_complaints();
		self::seed_assignments();
		self::seed_qr_tokens();

		// Recalculate risk scores and ratings for all seeded establishments
		$est_ids = $wpdb->get_col( "SELECT id FROM $table_establishments" );
		if ( is_array( $est_ids ) ) {
			foreach ( $est_ids as $eid ) {
				MFTM_Risk_Engine::calculate_risk( $eid );
				MFTM_Risk_Engine::calculate_transparency_rating( $eid );
			}
		}
	}

	private static function create_demo_users() {
		if ( ! username_exists( 'demo_restaurant' ) ) {
			$user_id = wp_create_user( 'demo_restaurant', 'DemoOwner2026!', 'owner@goodfoodpune.demo' );
			$user = new WP_User( $user_id );
			$user->set_role( 'mftm_restaurant' );
			$user->display_name = 'Sanjay K. Shinde (Owner - Spice Symphony)';
			wp_update_user( $user );
		}

		if ( ! username_exists( 'demo_inspector' ) ) {
			$user_id = wp_create_user( 'demo_inspector', 'DemoInsp2026!', 'v.deshmukh@fda.maharashtra.gov.in.demo' );
			$user = new WP_User( $user_id );
			$user->set_role( 'mftm_inspector' );
			$user->display_name = 'Inspector Vikram Deshmukh (Pune Division)';
			wp_update_user( $user );
		}

		if ( ! username_exists( 'demo_senior' ) ) {
			$user_id = wp_create_user( 'demo_senior', 'DemoSenior2026!', 'r.patil@fda.maharashtra.gov.in.demo' );
			$user = new WP_User( $user_id );
			$user->set_role( 'mftm_senior_officer' );
			$user->display_name = 'Dr. Rajesh Patil, Joint Commissioner (Food Enforcement)';
			wp_update_user( $user );
		}
	}

	private static function seed_establishments() {
		global $wpdb;
		$table = MFTM_DB::$table_establishments;

		$establishments = array(
			array(
				'establishment_code' => 'MFTM-EST-001',
				'name'               => 'Spice Symphony & Good Food Restaurant',
				'fssai_license'      => '11524026000123',
				'category'           => 'Restaurant & Family Dining',
				'address'            => 'Plot 42, FC Road, Deccan Gymkhana, Shivajinagar',
				'district'           => 'Pune',
				'ward'               => 'Ward 14 (Shivajinagar)',
				'latitude'           => 18.5204303,
				'longitude'          => 73.8567437,
				'owner_name'         => 'Sanjay K. Shinde',
				'owner_phone'        => '+91 98220 11452',
				'manager_name'       => 'Amol Bhosale',
				'manager_phone'      => '+91 98221 44589',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ) ), // Sunday Closed!
				'opening_time'       => '10:30',
				'closing_time'       => '23:00',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2028-06-30',
				'assigned_inspector_id' => 2,
				'current_rating'     => 4.4,
				'risk_score'         => 18,
				'risk_level'         => 'LOW',
				'risk_factors'       => json_encode( array( 'Consistent daily compliance', 'Satisfactory FDA inspection record' ) ),
				'created_at'         => '2024-01-15 09:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-002',
				'name'               => 'Spice Corner Coastal Kitchen',
				'fssai_license'      => '11522001000889',
				'category'           => 'Multi-Cuisine Casual Dining',
				'address'            => '12 Marine Plaza, Nariman Point',
				'district'           => 'Mumbai City',
				'ward'               => 'Ward A (Colaba/Fort)',
				'latitude'           => 18.9256,
				'longitude'          => 72.8242,
				'owner_name'         => 'Kiran M. Mehta',
				'owner_phone'        => '+91 98200 45891',
				'manager_name'       => 'Prasad Naik',
				'manager_phone'      => '+91 98201 12345',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '11:00',
				'closing_time'       => '23:30',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2027-11-15',
				'assigned_inspector_id' => 3,
				'current_rating'     => 3.2,
				'risk_score'         => 62,
				'risk_level'         => 'HIGH',
				'risk_factors'       => json_encode( array( '2 consecutive missed operating-day submissions', '1 unresolved hygiene complaint', 'Routine inspection overdue' ) ),
				'created_at'         => '2024-02-10 10:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-003',
				'name'               => 'Foodies Hub Multi-Cuisine',
				'fssai_license'      => '11523012000452',
				'category'           => 'Quick Service & Takeaway',
				'address'            => 'Shop 8, High Street Mall, Majiwada Junction',
				'district'           => 'Thane',
				'ward'               => 'Ward 3 (Majiwada-Manpada)',
				'latitude'           => 19.2183,
				'longitude'          => 72.9781,
				'owner_name'         => 'Devendra G. Chawla',
				'owner_phone'        => '+91 98190 77412',
				'manager_name'       => 'Rohan Joshi',
				'manager_phone'      => '+91 98191 88965',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '10:00',
				'closing_time'       => '23:00',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2026-12-31',
				'assigned_inspector_id' => 4,
				'current_rating'     => 2.8,
				'risk_score'         => 70,
				'risk_level'         => 'HIGH',
				'risk_factors'       => json_encode( array( '3 active citizen complaints on food quality and pest sightings', 'Delayed compliance uploads' ) ),
				'created_at'         => '2024-03-01 11:30:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-004',
				'name'               => 'Tasty Bites Family Restaurant',
				'fssai_license'      => '11524026000781',
				'category'           => 'Family Restaurant',
				'address'            => 'Row House 4, Datta Mandir Chowk, Viman Nagar',
				'district'           => 'Pune',
				'ward'               => 'Ward 9 (Viman Nagar)',
				'latitude'           => 18.5679,
				'longitude'          => 73.9143,
				'owner_name'         => 'Manoj V. Kadam',
				'owner_phone'        => '+91 98900 33412',
				'manager_name'       => 'Suresh More',
				'manager_phone'      => '+91 98901 22145',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '09:00',
				'closing_time'       => '22:30',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2027-04-20',
				'assigned_inspector_id' => 2,
				'current_rating'     => 3.6,
				'risk_score'         => 42,
				'risk_level'         => 'MEDIUM',
				'risk_factors'       => json_encode( array( 'Previous inspection indicated Needs Improvement in raw meat segregation', '1 complaint resolved last month' ) ),
				'created_at'         => '2024-03-12 12:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-005',
				'name'               => 'Hotel Green Leaf Pure Veg',
				'fssai_license'      => '11521045000912',
				'category'           => 'Pure Vegetarian Restaurant',
				'address'            => 'Temple Road, Sitabuldi Square',
				'district'           => 'Nagpur',
				'ward'               => 'Ward 6 (Dharampeth)',
				'latitude'           => 21.1458,
				'longitude'          => 79.0882,
				'owner_name'         => 'Anand R. Agrawal',
				'owner_phone'        => '+91 98600 55123',
				'manager_name'       => 'Vikas Mishra',
				'manager_phone'      => '+91 98601 44789',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ) ),
				'opening_time'       => '08:00',
				'closing_time'       => '22:00',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2027-09-15',
				'assigned_inspector_id' => 5,
				'current_rating'     => 3.4,
				'risk_score'         => 58,
				'risk_level'         => 'HIGH',
				'risk_factors'       => json_encode( array( 'Repeated missed operating-day compliance', 'Water quality test certification pending' ) ),
				'created_at'         => '2024-04-05 09:30:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-006',
				'name'               => 'Royal Dining & Banquet Hall',
				'fssai_license'      => '11520033000673',
				'category'           => 'Banquet & Fine Dining',
				'address'            => 'Grand Galleria, College Road',
				'district'           => 'Nashik',
				'ward'               => 'Ward 2 (Panchavati)',
				'latitude'           => 19.9975,
				'longitude'          => 73.7898,
				'owner_name'         => 'Harshwardhan R. Patil',
				'owner_phone'        => '+91 98230 88210',
				'manager_name'       => 'Ganesh Thorat',
				'manager_phone'      => '+91 98231 66542',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '11:30',
				'closing_time'       => '00:00',
				'license_status'     => 'RENEWAL_PENDING',
				'license_validity'   => '2026-10-15',
				'assigned_inspector_id' => 6,
				'current_rating'     => 2.1,
				'risk_score'         => 82,
				'risk_level'         => 'CRITICAL',
				'risk_factors'       => json_encode( array( 'Critical violation: Unsanitary waste disposal and temperature abuse', '3 unverified location submissions', 'Emergency inspection assigned' ) ),
				'created_at'         => '2024-01-20 14:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-007',
				'name'               => 'Konkan Delights Seafood Coastal',
				'fssai_license'      => '11525019000331',
				'category'           => 'Specialty Seafood Restaurant',
				'address'            => 'Sector 17, Palm Beach Road, Vashi',
				'district'           => 'Thane',
				'ward'               => 'Ward 7 (Vashi)',
				'latitude'           => 19.0771,
				'longitude'          => 72.9986,
				'owner_name'         => 'Gautam S. Sawant',
				'owner_phone'        => '+91 98205 99112',
				'manager_name'       => 'Sachin Parab',
				'manager_phone'      => '+91 98206 11223',
				'operating_days'     => json_encode( array( 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '12:00',
				'closing_time'       => '23:30',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2028-12-31',
				'assigned_inspector_id' => 4,
				'current_rating'     => 4.7,
				'risk_score'         => 12,
				'risk_level'         => 'LOW',
				'risk_factors'       => json_encode( array( 'Exemplary cold-chain compliance', 'Zero active citizen complaints', 'Satisfactory FDA inspection' ) ),
				'created_at'         => '2024-02-18 10:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-008',
				'name'               => 'Kolhapur Rasoi Traditional',
				'fssai_license'      => '11524050000819',
				'category'           => 'Traditional Maharashtrian Thali',
				'address'            => '8th Lane, Rajarampuri',
				'district'           => 'Kolhapur',
				'ward'               => 'Ward 5 (Rajarampuri)',
				'latitude'           => 16.7050,
				'longitude'          => 74.2433,
				'owner_name'         => 'Bandopant G. Patil',
				'owner_phone'        => '+91 98223 44102',
				'manager_name'       => 'Tanaji Chougule',
				'manager_phone'      => '+91 98224 55691',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '11:00',
				'closing_time'       => '22:30',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2027-08-10',
				'assigned_inspector_id' => 7,
				'current_rating'     => 4.5,
				'risk_score'         => 15,
				'risk_level'         => 'LOW',
				'risk_factors'       => json_encode( array( 'Consistent daily evidence submission', 'Clean inspection audit' ) ),
				'created_at'         => '2024-03-25 15:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-009',
				'name'               => 'Marathwada Spice Treat',
				'fssai_license'      => '11522060000412',
				'category'           => 'Casual Dining',
				'address'            => 'Cannaught Garden, CIDCO N-5',
				'district'           => 'Chhatrapati Sambhajinagar',
				'ward'               => 'Ward 4 (CIDCO)',
				'latitude'           => 19.8762,
				'longitude'          => 75.3433,
				'owner_name'         => 'Shaikh Feroz Ahmed',
				'owner_phone'        => '+91 98234 11098',
				'manager_name'       => 'Imran Khan',
				'manager_phone'      => '+91 98235 22176',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '11:00',
				'closing_time'       => '23:00',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2027-05-18',
				'assigned_inspector_id' => 8,
				'current_rating'     => 3.8,
				'risk_score'         => 35,
				'risk_level'         => 'MEDIUM',
				'risk_factors'       => json_encode( array( '1 pending citizen inquiry on staff hairnets', 'Satisfactory historical inspection' ) ),
				'created_at'         => '2024-04-10 11:00:00',
				'updated_at'         => current_time( 'mysql' ),
			),
			array(
				'establishment_code' => 'MFTM-EST-010',
				'name'               => 'Solapur Central Cloud Kitchen',
				'fssai_license'      => '11523070000291',
				'category'           => 'Cloud Kitchen & Delivery Hub',
				'address'            => 'Plot 19, MIDC Chhatrapati Shivaji Chowk',
				'district'           => 'Solapur',
				'ward'               => 'Ward 8 (MIDC)',
				'latitude'           => 17.6599,
				'longitude'          => 75.9064,
				'owner_name'         => 'Pradeep S. Gaikwad',
				'owner_phone'        => '+91 98902 44781',
				'manager_name'       => 'Nitin Shinde',
				'manager_phone'      => '+91 98903 66120',
				'operating_days'     => json_encode( array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ) ),
				'opening_time'       => '07:00',
				'closing_time'       => '23:00',
				'license_status'     => 'ACTIVE',
				'license_validity'   => '2026-08-30',
				'assigned_inspector_id' => 9,
				'current_rating'     => 3.5,
				'risk_score'         => 46,
				'risk_level'         => 'MEDIUM',
				'risk_factors'       => json_encode( array( 'Overdue routine FDA inspection (>210 days)', 'Occasional timestamp submission delays' ) ),
				'created_at'         => '2024-05-02 08:30:00',
				'updated_at'         => current_time( 'mysql' ),
			),
		);

		foreach ( $establishments as $est ) {
			$wpdb->insert( $table, $est );
		}
	}

	private static function seed_compliance_submissions() {
		global $wpdb;
		$table = MFTM_DB::$table_submissions;

		$today = current_time( 'Y-m-d' );
		$yesterday = date( 'Y-m-d', strtotime( '-1 day' ) );

		$categories = array(
			'Kitchen Cleanliness' => 'Sanitized cooking countertops, clean exhaust hoods, clean tile flooring.',
			'Food Storage'        => 'Covered ingredient containers, raw meat segregated from prepared gravy bases.',
			'Handwash Area'       => 'Antibacterial handwash soap dispenser operational, single-use drying towels stocked.',
			'Waste Disposal'      => 'Foot-operated segregated wet and dry waste receptacles with fresh liners.',
			'Water Quality'       => 'UV/RO purification filtration unit pressure gauge checked, filter log signed.',
			'Pest Control'        => 'Electric flying insect catchers functional, fly mesh screens clean, ultrasonic repeller active.',
			'Staff Hygiene'       => 'Cooks and food handlers wearing clean aprons, chef caps/hairnets, and nail check verified.',
		);

		// Seed for Establishment 1 (Spice Symphony, Pune) - Today's full submission
		$time_index = 0;
		foreach ( $categories as $cat => $notes ) {
			$hour = 10;
			$min = 15 + ( $time_index * 2 );
			$time_str = sprintf( '%02d:%02d:00', $hour, $min );
			$session_id = 'sess_live_' . md5( $cat . $today );

			$wpdb->insert(
				$table,
				array(
					'establishment_id'      => 1,
					'category'              => $cat,
					'user_id'               => 1,
					'photo_url'             => self::generate_evidence_svg( $cat, $time_str, '18.5204° N, 73.8567° E' ),
					'submission_date'       => $today,
					'submission_time'       => $time_str,
					'latitude'              => 18.520430,
					'longitude'             => 73.856743,
					'gps_accuracy'          => 4.2,
					'location_verification' => 'VERIFIED',
					'capture_session_id'    => $session_id,
					'submission_notes'      => $notes,
					'created_at'            => "$today $time_str",
				)
			);
			$time_index++;
		}

		// Also seed yesterday's submissions for establishment 1
		$time_index = 0;
		foreach ( $categories as $cat => $notes ) {
			$time_str = sprintf( '%02d:%02d:00', 10, 20 + $time_index );
			$wpdb->insert(
				$table,
				array(
					'establishment_id'      => 1,
					'category'              => $cat,
					'user_id'               => 1,
					'photo_url'             => self::generate_evidence_svg( $cat, $time_str, '18.5204° N, 73.8567° E' ),
					'submission_date'       => $yesterday,
					'submission_time'       => $time_str,
					'latitude'              => 18.520430,
					'longitude'             => 73.856743,
					'gps_accuracy'          => 3.8,
					'location_verification' => 'VERIFIED',
					'capture_session_id'    => 'sess_live_yest_' . $time_index,
					'submission_notes'      => $notes,
					'created_at'            => "$yesterday $time_str",
				)
			);
			$time_index++;
		}

		// Seed for Establishment 4 (Tasty Bites, Pune) - Partial submission (4 of 7)
		$p_cats = array_slice( array_keys( $categories ), 0, 4 );
		foreach ( $p_cats as $idx => $cat ) {
			$time_str = sprintf( '%02d:%02d:00', 11, 10 + $idx * 3 );
			$wpdb->insert(
				$table,
				array(
					'establishment_id'      => 4,
					'category'              => $cat,
					'user_id'               => 1,
					'photo_url'             => self::generate_evidence_svg( $cat, $time_str, '18.5679° N, 73.9143° E' ),
					'submission_date'       => $today,
					'submission_time'       => $time_str,
					'latitude'              => 18.5679,
					'longitude'             => 73.9143,
					'gps_accuracy'          => 6.5,
					'location_verification' => 'VERIFIED',
					'capture_session_id'    => 'sess_live_est4_' . $idx,
					'submission_notes'      => 'Daily routine verified by kitchen supervisor.',
					'created_at'            => "$today $time_str",
				)
			);
		}

		// Seed for Establishment 6 (Royal Dining, Nashik) - Location Requires Review
		$wpdb->insert(
			$table,
			array(
				'establishment_id'      => 6,
				'category'              => 'Kitchen Cleanliness',
				'user_id'               => 1,
				'photo_url'             => self::generate_evidence_svg( 'Kitchen Cleanliness', '14:35:00', '19.9820° N, 73.8120° E [OUTSIDE 100M]' ),
				'submission_date'       => $today,
				'submission_time'       => '14:35:00',
				'latitude'              => 19.9820,
				'longitude'             => 73.8120,
				'gps_accuracy'          => 18.0,
				'location_verification' => 'REQUIRES_REVIEW',
				'capture_session_id'    => 'sess_flagged_loc_nashik_01',
				'submission_notes'      => 'Location coordinates differ by 2,410 meters from licensed premises.',
				'created_at'            => "$today 14:35:00",
			)
		);
	}

	private static function seed_inspections() {
		global $wpdb;
		$table = MFTM_DB::$table_inspections;

		$checklist_1 = array(
			array( 'category' => 'Kitchen Cleanliness', 'status' => 'COMPLIANT', 'observation' => 'Stainless steel equipment clean, no grease accumulation.' ),
			array( 'category' => 'Food Storage', 'status' => 'COMPLIANT', 'observation' => 'FIFO labeling implemented. Temperature in cold storage maintained at 3.4°C.' ),
			array( 'category' => 'Raw/Cooked Food Separation', 'status' => 'COMPLIANT', 'observation' => 'Separate color-coded cutting boards and dedicated prep stations.' ),
			array( 'category' => 'Staff Hygiene', 'status' => 'COMPLIANT', 'observation' => 'Medical fitness certificates up-to-date. Aprons, hairnets, and gloves worn.' ),
			array( 'category' => 'Handwashing', 'status' => 'COMPLIANT', 'observation' => 'Dedicated handwashing station with warm water and sanitizing liquid.' ),
			array( 'category' => 'Waste Management', 'status' => 'COMPLIANT', 'observation' => 'Wet waste composting channelized through registered bio-handler.' ),
			array( 'category' => 'Water Quality', 'status' => 'COMPLIANT', 'observation' => 'Latest NABL-accredited water potability test certificate verified.' ),
			array( 'category' => 'Pest Control', 'status' => 'COMPLIANT', 'observation' => 'Monthly pest control contract active; insect trap operational.' ),
			array( 'category' => 'Refrigeration', 'status' => 'COMPLIANT', 'observation' => 'Digital thermometer logs verified daily.' ),
			array( 'category' => 'Food Handling', 'status' => 'COMPLIANT', 'observation' => 'No direct bare-hand contact with ready-to-eat foods.' ),
			array( 'category' => 'Licence Display', 'status' => 'COMPLIANT', 'observation' => 'FSSAI True Copy displayed prominently at customer entrance.' ),
		);

		$wpdb->insert(
			$table,
			array(
				'inspection_code'  => 'INSP-MH-PN-2026-0182',
				'establishment_id' => 1,
				'inspector_id'     => 2,
				'inspector_name'   => 'Inspector Vikram Deshmukh',
				'inspection_date'  => '2026-05-12',
				'inspection_time'  => '14:20:00',
				'latitude'         => 18.52043,
				'longitude'        => 73.85674,
				'overall_result'   => 'SATISFACTORY',
				'findings_level'   => 'MINOR',
				'corrective_action'=> 'Routine observations noted. Advised staff refresher training on allergen advisory labeling.',
				'evidence_photos'  => json_encode( array( 'prep_station_audit.jpg', 'cold_storage_digital_meter.jpg' ) ),
				'checklist_data'   => json_encode( $checklist_1 ),
				'notes'            => 'High standard of hygiene maintained. Self-reporting daily compliance matches on-site ground condition.',
				'created_at'       => '2026-05-12 15:45:00',
			)
		);

		$checklist_2 = array(
			array( 'category' => 'Kitchen Cleanliness', 'status' => 'COMPLIANT', 'observation' => 'Cooking surfaces clean.' ),
			array( 'category' => 'Food Storage', 'status' => 'NON_COMPLIANT', 'observation' => 'Uncovered container found in secondary chiller.' ),
			array( 'category' => 'Raw/Cooked Food Separation', 'status' => 'NON_COMPLIANT', 'observation' => 'Raw poultry placed on shelf above chopped vegetables.' ),
			array( 'category' => 'Staff Hygiene', 'status' => 'COMPLIANT', 'observation' => 'All handlers in uniform.' ),
			array( 'category' => 'Handwashing', 'status' => 'COMPLIANT', 'observation' => 'Soap available.' ),
			array( 'category' => 'Waste Management', 'status' => 'COMPLIANT', 'observation' => 'Bins covered.' ),
			array( 'category' => 'Water Quality', 'status' => 'COMPLIANT', 'observation' => 'Filter tested.' ),
			array( 'category' => 'Pest Control', 'status' => 'COMPLIANT', 'observation' => 'No active pest signs.' ),
			array( 'category' => 'Refrigeration', 'status' => 'COMPLIANT', 'observation' => 'Chiller temp 4.8°C.' ),
			array( 'category' => 'Food Handling', 'status' => 'COMPLIANT', 'observation' => 'Gloves in use.' ),
			array( 'category' => 'Licence Display', 'status' => 'COMPLIANT', 'observation' => 'Licence mounted.' ),
		);

		$wpdb->insert(
			$table,
			array(
				'inspection_code'  => 'INSP-MH-PN-2026-0094',
				'establishment_id' => 4,
				'inspector_id'     => 2,
				'inspector_name'   => 'Inspector Vikram Deshmukh',
				'inspection_date'  => '2026-03-18',
				'inspection_time'  => '11:15:00',
				'latitude'         => 18.5679,
				'longitude'        => 73.9143,
				'overall_result'   => 'NEEDS_IMPROVEMENT',
				'findings_level'   => 'MAJOR',
				'corrective_action'=> 'Issued Form C Improvement Notice. Operator mandated to install physical shelf barriers in refrigerator within 7 days.',
				'evidence_photos'  => json_encode( array( 'chiller_cross_contact.jpg' ) ),
				'checklist_data'   => json_encode( $checklist_2 ),
				'notes'            => 'Cross-contamination risk identified in raw/cooked separation. Follow-up inspection scheduled.',
				'created_at'       => '2026-03-18 12:30:00',
			)
		);

		$checklist_3 = array(
			array( 'category' => 'Kitchen Cleanliness', 'status' => 'NON_COMPLIANT', 'observation' => 'Heavy grease and stagnant water near wash area.' ),
			array( 'category' => 'Food Storage', 'status' => 'NON_COMPLIANT', 'observation' => 'Expired dairy product found in walk-in chiller.' ),
			array( 'category' => 'Raw/Cooked Food Separation', 'status' => 'NON_COMPLIANT', 'observation' => 'Shared knives and chopping boards between raw fish and salads.' ),
			array( 'category' => 'Staff Hygiene', 'status' => 'NON_COMPLIANT', 'observation' => 'Staff working without hairnets; open wounds uncovered.' ),
			array( 'category' => 'Handwashing', 'status' => 'NON_COMPLIANT', 'observation' => 'Sink blocked, no liquid soap provided.' ),
			array( 'category' => 'Waste Management', 'status' => 'NON_COMPLIANT', 'observation' => 'Overflowing open garbage bins near food preparation zone.' ),
			array( 'category' => 'Water Quality', 'status' => 'NON_COMPLIANT', 'observation' => 'Water filter bypass valve left open.' ),
			array( 'category' => 'Pest Control', 'status' => 'NON_COMPLIANT', 'observation' => 'Cockroach activity observed inside dry storage cabinet.' ),
			array( 'category' => 'Refrigeration', 'status' => 'NON_COMPLIANT', 'observation' => 'Chiller temp recorded at 11.2°C (Critical temperature abuse).' ),
			array( 'category' => 'Food Handling', 'status' => 'NON_COMPLIANT', 'observation' => 'Reheated chicken curry kept at room temperature.' ),
			array( 'category' => 'Licence Display', 'status' => 'COMPLIANT', 'observation' => 'Licence framed.' ),
		);

		$wpdb->insert(
			$table,
			array(
				'inspection_code'  => 'INSP-MH-NSK-2026-0041',
				'establishment_id' => 6,
				'inspector_id'     => 6,
				'inspector_name'   => 'Inspector Hemant Shirsath',
				'inspection_date'  => '2026-01-09',
				'inspection_time'  => '16:00:00',
				'latitude'         => 19.9975,
				'longitude'        => 73.7898,
				'overall_result'   => 'ACTION_REQUIRED',
				'findings_level'   => 'CRITICAL',
				'corrective_action'=> 'Emergency suspension notice drafted under Section 32 of FSS Act. Penalty challan issued; immediate deep sanitization ordered.',
				'evidence_photos'  => json_encode( array( 'pest_droppings.jpg', 'temp_violation_11c.jpg' ) ),
				'checklist_data'   => json_encode( $checklist_3 ),
				'notes'            => 'Critical health hazard conditions observed. High risk of foodborne pathogen propagation.',
				'created_at'       => '2026-01-09 18:00:00',
			)
		);
	}

	private static function seed_complaints() {
		global $wpdb;
		$table = MFTM_DB::$table_complaints;

		$complaints = array(
			array(
				'complaint_code'       => 'MFTM-2026-000184',
				'establishment_id'     => 1,
				'category'             => 'Food Storage',
				'description'          => 'Ordered paneer butter masala on Sunday evening. The paneer felt slightly sour and the takeaway packaging was unsealed.',
				'evidence_photo'       => '',
				'customer_name'        => 'Aditya Deshpande',
				'customer_phone'       => '+91 98224 88120',
				'is_anonymous'         => 0,
				'status'               => 'RESOLVED',
				'priority'             => 'MEDIUM',
				'assigned_inspector_id'=> 2,
				'internal_notes'       => 'Spoke with establishment owner. Batch tested; vendor dairy delivery log verified. Replacement provided to customer.',
				'resolution_summary'   => 'Investigation concluded. Cold chain storage verified intact; vendor batch replaced. Matter resolved with customer agreement.',
				'created_at'           => '2026-05-18 19:30:00',
				'updated_at'           => '2026-05-20 14:00:00',
			),
			array(
				'complaint_code'       => 'MFTM-2026-000219',
				'establishment_id'     => 3,
				'category'             => 'Pest Concern',
				'description'          => 'Observed small cockroaches crawling behind the beverage dispenser unit while waiting for my burger order.',
				'evidence_photo'       => '',
				'customer_name'        => 'Anonymous Citizen',
				'customer_phone'       => '',
				'is_anonymous'         => 1,
				'status'               => 'INSPECTION_REQUIRED',
				'priority'             => 'HIGH',
				'assigned_inspector_id'=> 4,
				'internal_notes'       => 'Assigned to Inspector Thane-West for unannounced evening verification visit.',
				'resolution_summary'   => '',
				'created_at'           => '2026-05-22 21:10:00',
				'updated_at'           => '2026-05-23 09:30:00',
			),
			array(
				'complaint_code'       => 'MFTM-2026-000224',
				'establishment_id'     => 2,
				'category'             => 'Staff Hygiene',
				'description'          => 'Cook in the open live kitchen counter was handling raw fish and directly serving salad garnishes without washing hands.',
				'evidence_photo'       => '',
				'customer_name'        => 'Pooja Narang',
				'customer_phone'       => '+91 98201 55432',
				'is_anonymous'         => 0,
				'status'               => 'UNDER_INVESTIGATION',
				'priority'             => 'HIGH',
				'assigned_inspector_id'=> 3,
				'internal_notes'       => 'Cross-checking with establishment live camera stream uploads for the timestamp mentioned.',
				'resolution_summary'   => '',
				'created_at'           => '2026-05-24 13:45:00',
				'updated_at'           => '2026-05-24 16:00:00',
			),
			array(
				'complaint_code'       => 'MFTM-2026-000231',
				'establishment_id'     => 6,
				'category'             => 'Cleanliness',
				'description'          => 'Water dripping from air-conditioner duct directly onto open salad buffet station during wedding reception.',
				'evidence_photo'       => '',
				'customer_name'        => 'Anonymous Citizen',
				'customer_phone'       => '',
				'is_anonymous'         => 1,
				'status'               => 'ACTION_TAKEN',
				'priority'             => 'HIGH',
				'assigned_inspector_id'=> 6,
				'internal_notes'       => 'Emergency notice issued. Duct rerouted under engineering supervision.',
				'resolution_summary'   => 'Defect rectified and confirmed by field officer visit.',
				'created_at'           => '2026-05-25 15:20:00',
				'updated_at'           => '2026-05-26 11:00:00',
			),
		);

		foreach ( $complaints as $c ) {
			$wpdb->insert( $table, $c );
		}
	}

	private static function seed_assignments() {
		global $wpdb;
		$table = MFTM_DB::$table_assignments;

		$assignments = array(
			array(
				'establishment_id'   => 3,
				'inspector_id'       => 4,
				'assigned_by_user_id'=> 3,
				'priority'           => 'HIGH',
				'deadline_date'      => '2026-06-02',
				'status'             => 'ASSIGNED',
				'notes'              => 'Follow up on citizen pest complaint MFTM-2026-000219. Check beverage dispenser perimeter and dry storage.',
				'created_at'         => '2026-05-25 10:00:00',
				'updated_at'         => '2026-05-25 10:00:00',
			),
			array(
				'establishment_id'   => 6,
				'inspector_id'       => 6,
				'assigned_by_user_id'=> 3,
				'priority'           => 'EMERGENCY',
				'deadline_date'      => '2026-05-28',
				'status'             => 'IN_PROGRESS',
				'notes'              => 'Verify compliance with Section 32 improvement order. Conduct full hygiene audit.',
				'created_at'         => '2026-05-24 16:30:00',
				'updated_at'         => '2026-05-25 09:00:00',
			),
			array(
				'establishment_id'   => 10,
				'inspector_id'       => 9,
				'assigned_by_user_id'=> 3,
				'priority'           => 'NORMAL',
				'deadline_date'      => '2026-06-15',
				'status'             => 'ASSIGNED',
				'notes'              => 'Routine annual inspection overdue (>210 days). Inspect oil re-heating records and water test logs.',
				'created_at'         => '2026-05-26 11:15:00',
				'updated_at'         => '2026-05-26 11:15:00',
			),
		);

		foreach ( $assignments as $a ) {
			$wpdb->insert( $table, $a );
		}
	}

	private static function seed_qr_tokens() {
		global $wpdb;
		$table = MFTM_DB::$table_qr;

		for ( $i = 1; $i <= 10; $i++ ) {
			$pub_token = 'MFTM-PUB-' . str_pad( $i, 4, '0', STR_PAD_LEFT ) . '-' . substr( md5( 'pub' . $i . 'secret' ), 0, 8 );
			$wpdb->insert(
				$table,
				array(
					'establishment_id' => $i,
					'qr_type'          => 'PUBLIC_CUSTOMER',
					'secure_token'     => $pub_token,
					'created_at'       => current_time( 'mysql' ),
				)
			);

			$insp_token = 'MFTM-INSP-' . str_pad( $i, 4, '0', STR_PAD_LEFT ) . '-' . substr( md5( 'insp' . $i . 'fda_maha' ), 0, 8 );
			$wpdb->insert(
				$table,
				array(
					'establishment_id' => $i,
					'qr_type'          => 'INSPECTOR_FIELD',
					'secure_token'     => $insp_token,
					'created_at'       => current_time( 'mysql' ),
				)
			);
		}
	}

	public static function generate_evidence_svg( $category, $time_str, $geo_str ) {
		$cat_colors = array(
			'Kitchen Cleanliness' => array( '#0B4F37', '#10B981', '🍳', 'STAINLESS WORKSPACE SANITIZED' ),
			'Food Storage'        => array( '#1E3A8A', '#3B82F6', '❄️', 'COLD CHAIN & INGREDIENT LIDS' ),
			'Handwash Area'       => array( '#065F46', '#059669', '🧼', 'SOAP & DRYING STATION VERIFIED' ),
			'Waste Disposal'      => array( '#78350F', '#D97706', '🗑️', 'FOOT-OPERATED SEGREGATION' ),
			'Water Quality'       => array( '#0E7490', '#06B6D4', '💧', 'RO/UV FILTRATION LOG AUDITED' ),
			'Pest Control'        => array( '#4C1D95', '#8B5CF6', '🛡️', 'FLY TRAP & PEST BARRIER ACTIVE' ),
			'Staff Hygiene'       => array( '#831843', '#EC4899', '👨‍🍳', 'APRONS, NETS & GLOVES AUDIT' ),
		);

		$cfg = isset( $cat_colors[ $category ] ) ? $cat_colors[ $category ] : array( '#1E293B', '#64748B', '📸', 'VERIFIED LIVE EVIDENCE' );
		$c1 = $cfg[0];
		$c2 = $cfg[1];
		$icon = $cfg[2];
		$sub = $cfg[3];

		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
			<defs>
				<linearGradient id="g_' . md5( $category ) . '" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="' . $c1 . '"/>
					<stop offset="100%" stop-color="' . $c2 . '"/>
				</linearGradient>
			</defs>
			<rect width="600" height="450" fill="url(#g_' . md5( $category ) . ')"/>
			<circle cx="300" cy="180" r="64" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
			<text x="300" y="195" font-family="system-ui, -apple-system, sans-serif" font-size="52" text-anchor="middle" fill="#FFFFFF">' . $icon . '</text>
			<text x="300" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="#FFFFFF" letter-spacing="1">' . htmlspecialchars( strtoupper( $category ) ) . '</text>
			<text x="300" y="302" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="rgba(255,255,255,0.85)" letter-spacing="2">' . $sub . '</text>
			<rect x="20" y="20" width="220" height="32" rx="6" fill="rgba(0,0,0,0.6)"/>
			<circle cx="36" cy="36" r="5" fill="#EF4444"/>
			<text x="48" y="41" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">LIVE CAMERA CAPTURE</text>
			<rect x="0" y="380" width="600" height="70" fill="rgba(15,23,42,0.92)"/>
			<line x1="0" y1="380" x2="600" y2="380" stroke="#FF9933" stroke-width="2"/>
			<text x="25" y="405" font-family="monospace" font-size="11" fill="#94A3B8">CAPTURED: <tspan fill="#F8FAFC" font-weight="bold">' . $time_str . '</tspan> | TIMEZONE: IST (UTC+05:30)</text>
			<text x="25" y="425" font-family="monospace" font-size="11" fill="#94A3B8">LOCATION: <tspan fill="#34D399" font-weight="bold">' . $geo_str . '</tspan> | ACCURACY: ±4.2m</text>
			<text x="575" y="415" font-family="monospace" font-size="11" text-anchor="end" fill="#F59E0B">SECURE HASH: 8f2a..e9c1</text>
		</svg>';

		return 'data:image/svg+xml;utf8,' . rawurlencode( $svg );
	}
}
