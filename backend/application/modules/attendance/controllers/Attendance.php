<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Attendance extends MX_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Attendance_model');

        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            exit(0);
        }
    }

    /**
     * Save attendance data
     * URL: POST /attendance/save
     */
    public function save()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Only POST requests are allowed'
            ));
            return;
        }

        $input_data = json_decode(file_get_contents('php://input'), true);

        if (!$input_data || !is_array($input_data)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid attendance data provided'
            ));
            return;
        }

        try {
            $saved_count = $this->Attendance_model->save_bulk_attendance($input_data);

            if ($saved_count > 0) {
                http_response_code(201);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => "Successfully saved attendance for {$saved_count} students",
                    'data' => array('saved_count' => $saved_count)
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Failed to save attendance data'
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error saving attendance: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Check if attendance exists for teacher and date
     * URL: GET /attendance/check_exists/{teacher_name}/{date}
     */
    public function check_exists($teacher_name = null, $date = null)
    {
        if (empty($teacher_name) || empty($date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name and date are required'
            ));
            return;
        }

        // Decode URL-encoded teacher name
        $teacher_name = urldecode($teacher_name);

        try {
            $exists = $this->Attendance_model->check_attendance_exists($teacher_name, $date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance check completed',
                'data' => array(
                    'exists' => $exists,
                    'teacher_name' => $teacher_name,
                    'date' => $date
                )
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error checking attendance: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Delete attendance by teacher name and date
     * URL: DELETE /attendance/delete_by_teacher_date/{teacher_name}/{date}
     */
    public function delete_by_teacher_date($teacher_name = null, $date = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            http_response_code(405);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Only DELETE requests are allowed'
            ));
            return;
        }

        if (empty($teacher_name) || empty($date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name and date are required'
            ));
            return;
        }

        // Decode URL-encoded teacher name
        $teacher_name = urldecode($teacher_name);

        try {
            $deleted_count = $this->Attendance_model->delete_attendance_by_teacher_date($teacher_name, $date);

            if ($deleted_count > 0) {
                http_response_code(200);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => "Successfully deleted attendance records for {$teacher_name} on {$date}",
                    'data' => array(
                        'deleted_count' => $deleted_count,
                        'teacher_name' => $teacher_name,
                        'date' => $date
                    )
                ));
            } else {
                http_response_code(404);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'No attendance records found to delete'
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error deleting attendance: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get attendance by teacher name and date
     * URL: GET /attendance/get_by_teacher_date/{teacher_name}/{date}
     */
    public function get_by_teacher_date($teacher_name = null, $date = null)
    {
        if (empty($teacher_name) || empty($date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name and date are required'
            ));
            return;
        }

        // Decode URL-encoded teacher name
        $teacher_name = urldecode($teacher_name);

        try {
            $attendance = $this->Attendance_model->get_attendance_by_teacher_date($teacher_name, $date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance retrieved successfully',
                'data' => $attendance,
                'count' => count($attendance)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get attendance history for a teacher (recent records)
     * URL: GET /attendance/get_history/{teacher_name}
     */
    public function get_history($teacher_name = null)
    {
        if (empty($teacher_name)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name is required'
            ));
            return;
        }

        // Decode URL-encoded teacher name
        $teacher_name = urldecode($teacher_name);

        try {
            $attendance = $this->Attendance_model->get_attendance_history($teacher_name);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance history retrieved successfully',
                'data' => $attendance,
                'count' => count($attendance)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance history: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get attendance by date range for a specific teacher
     * URL: GET /attendance/get_by_date_range/{teacher_name}/{start_date}/{end_date}
     */
    public function get_by_date_range($teacher_name = null, $start_date = null, $end_date = null)
    {
        if (empty($teacher_name) || empty($start_date) || empty($end_date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name, start date, and end date are required'
            ));
            return;
        }

        // Decode URL-encoded teacher name
        $teacher_name = urldecode($teacher_name);

        try {
            $attendance = $this->Attendance_model->get_attendance_by_date_range($teacher_name, $start_date, $end_date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance history retrieved successfully',
                'data' => $attendance,
                'count' => count($attendance)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance history: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get all attendance by date range (for admin - all teachers)
     * URL: GET /attendance/get_all_by_date_range/{start_date}/{end_date}
     */
    public function get_all_by_date_range($start_date = null, $end_date = null)
    {
        if (empty($start_date) || empty($end_date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Start date and end date are required'
            ));
            return;
        }

        try {
            $attendance = $this->Attendance_model->get_all_attendance_by_date_range($start_date, $end_date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'All attendance history retrieved successfully',
                'data' => $attendance,
                'count' => count($attendance)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance history: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get attendance for a specific date
     * URL: GET /attendance/get_by_date/{date}/{class_name?}
     */
    public function get_by_date($date = null, $class_name = null)
    {
        if (empty($date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Date is required'
            ));
            return;
        }

        try {
            $attendance = $this->Attendance_model->get_attendance_by_date($date, $class_name);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance retrieved successfully',
                'data' => $attendance,
                'count' => count($attendance)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get student attendance history
     * URL: GET /attendance/get_student_history/{student_id}/{start_date?}/{end_date?}
     */
    public function get_student_history($student_id = null, $start_date = null, $end_date = null)
    {
        if (empty($student_id)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Student ID is required'
            ));
            return;
        }

        try {
            $attendance = $this->Attendance_model->get_student_attendance_history($student_id, $start_date, $end_date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Student attendance history retrieved successfully',
                'data' => $attendance,
                'count' => count($attendance)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving student attendance history: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get attendance summary statistics
     * URL: GET /attendance/get_summary/{start_date}/{end_date}
     */
    public function get_summary($start_date = null, $end_date = null)
    {
        if (empty($start_date) || empty($end_date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Start date and end date are required'
            ));
            return;
        }

        try {
            $summary = $this->Attendance_model->get_attendance_summary($start_date, $end_date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance summary retrieved successfully',
                'data' => $summary
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance summary: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get attendance statistics for a teacher and date range
     * URL: GET /attendance/get_stats/{teacher_name}/{start_date}/{end_date}
     */
    public function get_stats($teacher_name = null, $start_date = null, $end_date = null)
    {
        if (empty($teacher_name) || empty($start_date) || empty($end_date)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name, start date, and end date are required'
            ));
            return;
        }

        // Decode URL-encoded teacher name
        $teacher_name = urldecode($teacher_name);

        try {
            $stats = $this->Attendance_model->get_attendance_stats($teacher_name, $start_date, $end_date);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Attendance statistics retrieved successfully',
                'data' => $stats,
                'count' => count($stats)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Error retrieving attendance statistics: ' . $e->getMessage()
            ));
        }
    }
}
