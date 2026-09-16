<?php
/**
 * Plugin Name: Maharashtra Food Trust Mission (MFTM)
 * Plugin URI: https://fda.maharashtra.gov.in/food-trust-mission
 * Description: A Practical Digital Accountability System for Food Safety Enforcement across Maharashtra.
 * Version: 1.0.0
 * Author: Food and Drug Administration, Government of Maharashtra
 * Author URI: https://fda.maharashtra.gov.in
 * License: Proprietary / Government Internal
 * Text Domain: mftm
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MFTM_VERSION', '1.0.0' );
define( 'MFTM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MFTM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Load Core Classes
require_once MFTM_PLUGIN_DIR . 'includes/class-mftm-db.php';
require_once MFTM_PLUGIN_DIR . 'includes/class-mftm-risk-engine.php';
require_once MFTM_PLUGIN_DIR . 'includes/class-mftm-demo-data.php';
require_once MFTM_PLUGIN_DIR . 'includes/class-mftm-api.php';

// Plugin Activation Hook
register_activation_hook( __FILE__, 'mftm_activate_plugin' );
function mftm_activate_plugin() {
	// Create custom user roles
	add_role( 'mftm_restaurant', 'Restaurant Owner', array( 'read' => true ) );
	add_role( 'mftm_inspector', 'FDA Inspector', array( 'read' => true ) );
	add_role( 'mftm_senior_officer', 'Senior FDA Officer', array( 'read' => true ) );

	// Initialize Database Tables and Demonstration Seed Data
	MFTM_DB::create_tables();
	MFTM_Demo_Data::seed_all();

	flush_rewrite_rules();
}

// Hook into init for roles and API
add_action( 'init', 'mftm_init_handler' );
function mftm_init_handler() {
	// Ensure roles exist
	if ( ! get_role( 'mftm_restaurant' ) ) {
		add_role( 'mftm_restaurant', 'Restaurant Owner', array( 'read' => true ) );
	}
	if ( ! get_role( 'mftm_inspector' ) ) {
		add_role( 'mftm_inspector', 'FDA Inspector', array( 'read' => true ) );
	}
	if ( ! get_role( 'mftm_senior_officer' ) ) {
		add_role( 'mftm_senior_officer', 'Senior FDA Officer', array( 'read' => true ) );
	}
}

// Register REST API routes
add_action( 'rest_api_init', array( 'MFTM_API', 'register_routes' ) );

// Intercept front-end requests to load the MFTM Single Page Application
add_action( 'template_redirect', 'mftm_frontend_router' );
function mftm_frontend_router() {
	// Don't intercept wp-admin or REST API or wp-login
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
	if ( strpos( $uri, 'wp-admin' ) !== false || strpos( $uri, 'wp-json' ) !== false || strpos( $uri, 'wp-login.php' ) !== false ) {
		return;
	}

	// Serve the Government MFTM Application template
	$template_path = MFTM_PLUGIN_DIR . 'templates/app.php';
	if ( file_exists( $template_path ) ) {
		include $template_path;
		exit;
	}
}
