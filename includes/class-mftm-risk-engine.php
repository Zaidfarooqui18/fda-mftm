<?php
/**
 * Transparent Risk Engine and Compliance Rating Calculation
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MFTM_Risk_Engine {

	public static $weights = array(
		'missed_operating_day' => 10,
		'citizen_complaint'    => 15,
		'repeated_complaint'   => 20,
		'previous_violation'   => 20,
		'inspection_overdue'   => 15,
		'critical_violation'   => 40,
	);

	public static function calculate_risk( $establishment_id ) {
		global $wpdb;

		$table_establishments = MFTM_DB::$table_establishments;
		$table_submissions    = MFTM_DB::$table_submissions;
		$table_complaints     = MFTM_DB::$table_complaints;
		$table_inspections    = MFTM_DB::$table_inspections;

		$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_establishments WHERE id = %d", $establishment_id ) );
		if ( ! $establishment ) {
			return null;
		}

		$score = 0;
		$factors = array();

		// 1. Check missed submissions on operating days (last 14 days)
		$operating_days = json_decode( $establishment->operating_days, true );
		if ( ! is_array( $operating_days ) ) {
			$operating_days = array( 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' );
		}

		$missed_count = 0;
		$today = new DateTime();
		for ( $i = 1; $i <= 7; $i++ ) {
			$check_date = clone $today;
			$check_date->modify( "-$i day" );
			$day_name = $check_date->format( 'D' );
			$date_str = $check_date->format( 'Y-m-d' );

			if ( in_array( $day_name, $operating_days, true ) ) {
				$sub_count = $wpdb->get_var( $wpdb->prepare(
					"SELECT COUNT(*) FROM $table_submissions WHERE establishment_id = %d AND submission_date = %s",
					$establishment_id,
					$date_str
				) );
				if ( $sub_count < 3 ) {
					$missed_count++;
				}
			}
		}

		if ( $missed_count > 0 ) {
			$pts = min( $missed_count * self::$weights['missed_operating_day'], 30 );
			$score += $pts;
			$factors[] = "$missed_count missed operating-day compliance submission(s)";
		}

		// 2. Citizen complaints
		$complaints = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM $table_complaints WHERE establishment_id = %d AND status != 'RESOLVED'",
			$establishment_id
		) );
		$complaint_count = count( $complaints );

		if ( $complaint_count === 1 ) {
			$score += self::$weights['citizen_complaint'];
			$factors[] = "1 active citizen complaint under review";
		} elseif ( $complaint_count > 1 ) {
			$score += self::$weights['citizen_complaint'] + self::$weights['repeated_complaint'];
			$factors[] = "$complaint_count unresolved citizen complaints recorded";
		}

		// 3. Inspection History
		$last_inspection = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM $table_inspections WHERE establishment_id = %d ORDER BY inspection_date DESC LIMIT 1",
			$establishment_id
		) );

		if ( $last_inspection ) {
			if ( $last_inspection->overall_result === 'ACTION_REQUIRED' || $last_inspection->findings_level === 'CRITICAL' ) {
				$score += self::$weights['critical_violation'];
				$factors[] = "Critical findings in last FDA inspection ({$last_inspection->inspection_date})";
			} elseif ( $last_inspection->overall_result === 'NEEDS_IMPROVEMENT' || $last_inspection->findings_level === 'MAJOR' ) {
				$score += self::$weights['previous_violation'];
				$factors[] = "Previous inspection identified major compliance gaps";
			}

			$insp_date = new DateTime( $last_inspection->inspection_date );
			$diff_days = $today->diff( $insp_date )->days;
			if ( $diff_days > 180 ) {
				$score += self::$weights['inspection_overdue'];
				$factors[] = "Routine inspection overdue ($diff_days days elapsed)";
			}
		} else {
			$score += 15;
			$factors[] = "New registration - initial verification pending";
		}

		$score = min( 100, max( 5, $score ) );

		if ( $score <= 25 ) {
			$level = 'LOW';
		} elseif ( $score <= 50 ) {
			$level = 'MEDIUM';
		} elseif ( $score <= 75 ) {
			$level = 'HIGH';
		} else {
			$level = 'CRITICAL';
		}

		if ( empty( $factors ) ) {
			$factors[] = "Consistent daily compliance and satisfactory inspection record";
		}

		$wpdb->update(
			$table_establishments,
			array(
				'risk_score'   => $score,
				'risk_level'   => $level,
				'risk_factors' => json_encode( $factors ),
				'updated_at'   => current_time( 'mysql' ),
			),
			array( 'id' => $establishment_id )
		);

		return array(
			'score'   => $score,
			'level'   => $level,
			'factors' => $factors,
		);
	}

	public static function calculate_transparency_rating( $establishment_id ) {
		global $wpdb;

		$table_establishments = MFTM_DB::$table_establishments;
		$table_submissions    = MFTM_DB::$table_submissions;
		$table_complaints     = MFTM_DB::$table_complaints;
		$table_inspections    = MFTM_DB::$table_inspections;

		$establishment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_establishments WHERE id = %d", $establishment_id ) );
		if ( ! $establishment ) {
			return 4.0;
		}

		$sub_count_week = $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(DISTINCT submission_date) FROM $table_submissions WHERE establishment_id = %d AND submission_date >= date('now', '-7 days')",
			$establishment_id
		) );
		$consistency_score = min( 2.0, ( (float) $sub_count_week / 6.0 ) * 2.0 );

		$on_time_count = $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM $table_submissions WHERE establishment_id = %d AND submission_time <= '12:00:00' AND submission_date >= date('now', '-7 days')",
			$establishment_id
		) );
		$timeliness_score = $sub_count_week > 0 ? min( 1.0, ( (float) $on_time_count / max( 1, (float) $sub_count_week * 4 ) ) * 1.0 ) : 0.5;

		$last_inspection = $wpdb->get_row( $wpdb->prepare(
			"SELECT * FROM $table_inspections WHERE establishment_id = %d ORDER BY inspection_date DESC LIMIT 1",
			$establishment_id
		) );
		$inspection_score = 0.8;
		if ( $last_inspection ) {
			if ( $last_inspection->overall_result === 'SATISFACTORY' ) {
				$inspection_score = 1.0;
			} elseif ( $last_inspection->overall_result === 'NEEDS_IMPROVEMENT' ) {
				$inspection_score = 0.6;
			} else {
				$inspection_score = 0.2;
			}
		}

		$active_complaints = $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM $table_complaints WHERE establishment_id = %d AND status != 'RESOLVED'",
			$establishment_id
		) );
		$complaint_score = max( 0.2, 1.0 - ( $active_complaints * 0.3 ) );

		$total_rating = round( $consistency_score + $timeliness_score + $inspection_score + $complaint_score, 1 );
		$total_rating = min( 5.0, max( 1.0, $total_rating ) );

		$wpdb->update(
			$table_establishments,
			array(
				'current_rating' => $total_rating,
				'updated_at'     => current_time( 'mysql' ),
			),
			array( 'id' => $establishment_id )
		);

		return array(
			'rating' => $total_rating,
			'breakdown' => array(
				'consistency' => array( 'label' => 'Daily Submission Consistency (40%)', 'score' => round( $consistency_score, 2 ), 'max' => 2.0 ),
				'timeliness'  => array( 'label' => 'Submission Timeliness (20%)', 'score' => round( $timeliness_score, 2 ), 'max' => 1.0 ),
				'inspection'  => array( 'label' => 'Inspection Outcome Record (20%)', 'score' => round( $inspection_score, 2 ), 'max' => 1.0 ),
				'complaints'  => array( 'label' => 'Complaint & Resolution Record (20%)', 'score' => round( $complaint_score, 2 ), 'max' => 1.0 ),
			),
			'explanation' => "Rating reflects recorded compliance activity, inspection history and complaint-resolution record.",
		);
	}
}
