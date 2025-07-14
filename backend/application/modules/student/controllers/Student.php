<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Student extends MX_Controller
{

    public function __construct()
    {
        parent::__construct();

        // Load the model - notice we don't need to specify the path
        // HMVC automatically looks in the current module first
        $this->load->model('Student_model');

        // Set JSON header for all responses since this is an API
        header('Content-Type: application/json');

        // Enable CORS for frontend communication
        // This allows your frontend to make requests from different origins
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Handle preflight OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            exit(0);
        }
    }

    /**
     * Get all students
     * URL: GET /student/get_all
     * This is your main endpoint to fetch all student records
     */
    public function get_all()
    {
        try {
            // Call the model method to get all students
            $students = $this->Student_model->get_all_students();

            // Prepare the response
            $response = array(
                'status' => 'success',
                'message' => 'Students retrieved successfully',
                'data' => $students,
                'count' => count($students)
            );

            // Return JSON response with 200 status code
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            // Handle any errors that might occur
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve students: ' . $e->getMessage(),
                'data' => null
            );

            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get a single student by ID
     * URL: GET /student/get_by_id/{id}
     * This demonstrates how to handle URL parameters
     */
    public function get_by_id($id = null)
    {
        // Validate the ID parameter
        if (empty($id) || !is_numeric($id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid student ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $student = $this->Student_model->get_student_by_id($id);

            if ($student) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Student found',
                    'data' => $student
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Student not found',
                    'data' => null
                );
                http_response_code(404);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve student: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get students by class name (for attendance system)
     * URL: GET /student/get_by_class_name/{class_name}
     */
    public function get_by_class_name($class_name = null)
    {
        if (empty($class_name)) {
            $response = array(
                'status' => 'error',
                'message' => 'Class name is required',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        // Decode URL-encoded class name (in case it has spaces)
        $class_name = urldecode($class_name);

        try {
            $students = $this->Student_model->get_students_by_class_name($class_name);

            $response = array(
                'status' => 'success',
                'message' => 'Students retrieved successfully',
                'data' => $students,
                'count' => count($students)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve students: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Create a new student
     * URL: POST /student/create
     * Expects JSON data in request body
     * Required fields: student_name, birth_date, gender, class_id
     */
    public function create()
    {
        // Only allow POST requests for this method
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $response = array(
                'status' => 'error',
                'message' => 'Only POST requests are allowed',
                'data' => null
            );
            http_response_code(405);
            echo json_encode($response);
            return;
        }

        // Get JSON input data
        $input_data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required_fields = ['student_name', 'birth_date', 'gender', 'class_id'];
        foreach ($required_fields as $field) {
            if (empty($input_data[$field])) {
                $response = array(
                    'status' => 'error',
                    'message' => "Field '{$field}' is required",
                    'data' => null
                );
                http_response_code(400);
                echo json_encode($response);
                return;
            }
        }

        try {
            $student_id = $this->Student_model->create_student($input_data);

            if ($student_id) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Student created successfully',
                    'data' => array('student_id' => $student_id)
                );
                http_response_code(201);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to create student',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to create student: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Update an existing student
     * URL: PUT /student/update/{id}
     * Expects JSON data in request body
     */
    public function update($id = null)
    {
        // Only allow PUT requests for this method
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            $response = array(
                'status' => 'error',
                'message' => 'Only PUT requests are allowed',
                'data' => null
            );
            http_response_code(405);
            echo json_encode($response);
            return;
        }

        // Validate the ID parameter
        if (empty($id) || !is_numeric($id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid student ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        // Get JSON input data
        $input_data = json_decode(file_get_contents('php://input'), true);

        // Check if JSON data is valid
        if (json_last_error() !== JSON_ERROR_NONE) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid JSON data provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        // Validate that at least one field is provided for update
        $allowed_fields = ['student_name', 'birth_date', 'gender', 'class_id'];
        $has_valid_field = false;

        foreach ($allowed_fields as $field) {
            if (isset($input_data[$field]) && !empty(trim($input_data[$field]))) {
                $has_valid_field = true;
                break;
            }
        }

        if (!$has_valid_field) {
            $response = array(
                'status' => 'error',
                'message' => 'At least one field (student_name, birth_date, gender, class_id) is required for update',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if student exists
            $existing_student = $this->Student_model->get_student_by_id($id);
            if (!$existing_student) {
                $response = array(
                    'status' => 'error',
                    'message' => 'Student not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to update the student
            $update_result = $this->Student_model->update_student($id, $input_data);

            if ($update_result) {
                // Get the updated student data
                $updated_student = $this->Student_model->get_student_by_id($id);

                $response = array(
                    'status' => 'success',
                    'message' => 'Student updated successfully',
                    'data' => $updated_student
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to update student',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to update student: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Delete a student
     * URL: DELETE /student/delete/{id}
     */
    public function delete($id = null)
    {
        // Only allow DELETE requests for this method
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            $response = array(
                'status' => 'error',
                'message' => 'Only DELETE requests are allowed',
                'data' => null
            );
            http_response_code(405);
            echo json_encode($response);
            return;
        }

        // Validate the ID parameter
        if (empty($id) || !is_numeric($id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid student ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if student exists before deletion
            $existing_student = $this->Student_model->get_student_by_id($id);
            if (!$existing_student) {
                $response = array(
                    'status' => 'error',
                    'message' => 'Student not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to delete the student
            $delete_result = $this->Student_model->delete_student($id);

            if ($delete_result) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Student deleted successfully',
                    'data' => array('deleted_id' => $id)
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to delete student',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to delete student: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get students by class ID
     * URL: GET /student/get_by_class/{class_id}
     */
    public function get_by_class($class_id = null)
    {
        // Validate the class_id parameter
        if (empty($class_id) || !is_numeric($class_id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid class ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $students = $this->Student_model->get_students_by_class($class_id);

            $response = array(
                'status' => 'success',
                'message' => 'Students retrieved successfully',
                'data' => $students,
                'count' => count($students)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve students: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }
}
