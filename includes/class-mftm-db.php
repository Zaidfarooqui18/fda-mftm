<?php
/**
 * Database Schema and Management for Maharashtra Food Trust Mission (MFTM)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MFTM_DB {

	public static $table_establishments = 'wp_mftm_establishments';
	public static $table_submissions    = 'wp_mftm_compliance_submissions';
	public static $table_inspections    = 'wp_mftm_inspections';
	public static $table_complaints     = 'wp_mftm_complaints';
	public static $table_assignments    = 'wp_mftm_inspection_assignments';
	public static $table_qr             = 'wp_mftm_qr_identities';
	public static $table_audit          = 'wp_mftm_audit_logs';

	public static function create_tables() {
		// Use direct PDO execution to ensure native SQLite DDL executes cleanly
		$db_file = defined( 'FQDB' ) ? FQDB : ( defined( 'DB_DIR' ) ? DB_DIR . DB_FILE : WP_CONTENT_DIR . '/database/mftm_database.sqlite' );
		try {
			$pdo = new PDO( 'sqlite:' . $db_file );
			$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

			$tables = array(
				self::$table_establishments => "CREATE TABLE IF NOT EXISTS " . self::$table_establishments . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					establishment_code TEXT UNIQUE,
					name TEXT NOT NULL,
					fssai_license TEXT NOT NULL,
					category TEXT DEFAULT 'Restaurant',
					address TEXT,
					district TEXT,
					ward TEXT,
					latitude REAL,
					longitude REAL,
					owner_name TEXT,
					owner_phone TEXT,
					manager_name TEXT,
					manager_phone TEXT,
					operating_days TEXT,
					opening_time TEXT DEFAULT '09:00',
					closing_time TEXT DEFAULT '23:00',
					license_status TEXT DEFAULT 'ACTIVE',
					license_validity TEXT,
					assigned_inspector_id INTEGER DEFAULT 0,
					current_rating REAL DEFAULT 4.2,
					risk_score INTEGER DEFAULT 20,
					risk_level TEXT DEFAULT 'LOW',
					risk_factors TEXT,
					created_at TEXT,
					updated_at TEXT
				)",
				self::$table_submissions => "CREATE TABLE IF NOT EXISTS " . self::$table_submissions . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					establishment_id INTEGER,
					category TEXT,
					user_id INTEGER,
					photo_url TEXT,
					submission_date TEXT,
					submission_time TEXT,
					latitude REAL,
					longitude REAL,
					gps_accuracy REAL,
					location_verification TEXT DEFAULT 'VERIFIED',
					capture_session_id TEXT,
					submission_notes TEXT,
					created_at TEXT
				)",
				self::$table_inspections => "CREATE TABLE IF NOT EXISTS " . self::$table_inspections . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					inspection_code TEXT UNIQUE,
					establishment_id INTEGER,
					inspector_id INTEGER,
					inspector_name TEXT,
					inspection_date TEXT,
					inspection_time TEXT,
					latitude REAL,
					longitude REAL,
					overall_result TEXT,
					findings_level TEXT,
					corrective_action TEXT,
					evidence_photos TEXT,
					checklist_data TEXT,
					notes TEXT,
					created_at TEXT
				)",
				self::$table_complaints => "CREATE TABLE IF NOT EXISTS " . self::$table_complaints . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					complaint_code TEXT UNIQUE,
					establishment_id INTEGER,
					category TEXT,
					description TEXT,
					evidence_photo TEXT,
					customer_name TEXT,
					customer_phone TEXT,
					is_anonymous INTEGER DEFAULT 0,
					status TEXT DEFAULT 'SUBMITTED',
					priority TEXT DEFAULT 'MEDIUM',
					assigned_inspector_id INTEGER DEFAULT 0,
					internal_notes TEXT,
					resolution_summary TEXT,
					created_at TEXT,
					updated_at TEXT
				)",
				self::$table_assignments => "CREATE TABLE IF NOT EXISTS " . self::$table_assignments . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					establishment_id INTEGER,
					inspector_id INTEGER,
					assigned_by_user_id INTEGER,
					priority TEXT DEFAULT 'NORMAL',
					deadline_date TEXT,
					status TEXT DEFAULT 'ASSIGNED',
					notes TEXT,
					created_at TEXT,
					updated_at TEXT
				)",
				self::$table_qr => "CREATE TABLE IF NOT EXISTS " . self::$table_qr . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					establishment_id INTEGER,
					qr_type TEXT,
					secure_token TEXT UNIQUE,
					created_at TEXT
				)",
				self::$table_audit => "CREATE TABLE IF NOT EXISTS " . self::$table_audit . " (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER,
					user_role TEXT,
					action TEXT,
					entity_type TEXT,
					entity_id INTEGER,
					details TEXT,
					ip_address TEXT,
					created_at TEXT
				)"
			);

			foreach ( $tables as $name => $sql ) {
				$pdo->exec( $sql );
			}
		} catch ( Exception $e ) {
			error_log( 'MFTM DB Creation Error: ' . $e->getMessage() );
		}
	}

	public static function log_action( $user_id, $user_role, $action, $entity_type, $entity_id, $details = '' ) {
		global $wpdb;
		$wpdb->insert(
			self::$table_audit,
			array(
				'user_id'     => intval( $user_id ),
				'user_role'   => sanitize_text_field( $user_role ),
				'action'      => sanitize_text_field( $action ),
				'entity_type' => sanitize_text_field( $entity_type ),
				'entity_id'   => intval( $entity_id ),
				'details'     => is_array( $details ) ? json_encode( $details ) : sanitize_textarea_field( $details ),
				'ip_address'  => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( $_SERVER['REMOTE_ADDR'] ) : '127.0.0.1',
				'created_at'  => current_time( 'mysql' ),
			)
		);
	}
}
