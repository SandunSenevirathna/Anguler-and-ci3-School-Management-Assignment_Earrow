<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Teacher extends MX_Controller
{
    public function __construct()
    {
        parent::__construct();

        // Load the teacher model
        $this->load->model('Teacher_model');

        // Set JSON header for all responses since this is an API
        header('Content-Type: application/json');

        // Enable CORS for frontend communication
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Handle preflight OPTIONS requests
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            exit(0);
        }
    }

    public function get_all()
    {
        try {
            $teachers = $this->Teacher_model->get_all_teachers();

            $response = array(
                'status' => 'success',
                'message' => 'Teachers retrieved successfully',
                'data' => $teachers,
                'count' => count($teachers)
            );

            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to retrieve teachers: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }

    public function get_by_id($id = null)
    {
        if (empty($id) || !is_numeric($id)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid teacher ID provided',
                'data' => null
            ));
            return;
        }

        try {
            $teacher = $this->Teacher_model->get_teacher_by_id($id);

            if ($teacher) {
                http_response_code(200);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => 'Teacher found',
                    'data' => $teacher
                ));
            } else {
                http_response_code(404);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Teacher not found',
                    'data' => null
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to retrieve teacher: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }

    /**
     * Get teacher by name (for attendance system)
     * URL: GET /teacher/get_by_name/{teacher_name}
     */
    public function get_by_name($teacher_name = null)
    {
        if (empty($teacher_name)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Teacher name is required',
                'data' => null
            ));
            return;
        }

        // Decode URL-encoded name (in case it has spaces)
        $teacher_name = urldecode($teacher_name);

        try {
            $teacher = $this->Teacher_model->get_teacher_by_name($teacher_name);

            if ($teacher) {
                http_response_code(200);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => 'Teacher found',
                    'data' => $teacher
                ));
            } else {
                http_response_code(404);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Teacher not found with name: ' . $teacher_name,
                    'data' => null
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to retrieve teacher: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }

    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Only POST requests are allowed',
                'data' => null
            ));
            return;
        }

        $input_data = json_decode(file_get_contents('php://input'), true);

        $required_fields = ['teacher_name', 'class_name', 'gender'];
        foreach ($required_fields as $field) {
            if (empty($input_data[$field])) {
                http_response_code(400);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => "Field '{$field}' is required",
                    'data' => null
                ));
                return;
            }
        }

        try {
            $teacher_id = $this->Teacher_model->create_teacher($input_data);

            if ($teacher_id) {
                http_response_code(201);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => 'Teacher created successfully',
                    'data' => array('teacher_id' => $teacher_id)
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Failed to create teacher',
                    'data' => null
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to create teacher: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }

    public function update($id = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Only PUT requests are allowed',
                'data' => null
            ));
            return;
        }

        if (empty($id) || !is_numeric($id)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid teacher ID provided',
                'data' => null
            ));
            return;
        }

        $input_data = json_decode(file_get_contents('php://input'), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid JSON data provided',
                'data' => null
            ));
            return;
        }

        try {
            $existing = $this->Teacher_model->get_teacher_by_id($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Teacher not found',
                    'data' => null
                ));
                return;
            }

            $updated = $this->Teacher_model->update_teacher($id, $input_data);

            if ($updated) {
                $teacher = $this->Teacher_model->get_teacher_by_id($id);
                http_response_code(200);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => 'Teacher updated successfully',
                    'data' => $teacher
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Failed to update teacher',
                    'data' => null
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to update teacher: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }

    public function delete($id = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            http_response_code(405);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Only DELETE requests are allowed',
                'data' => null
            ));
            return;
        }

        if (empty($id) || !is_numeric($id)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid teacher ID provided',
                'data' => null
            ));
            return;
        }

        try {
            $existing = $this->Teacher_model->get_teacher_by_id($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Teacher not found',
                    'data' => null
                ));
                return;
            }

            $deleted = $this->Teacher_model->delete_teacher($id);

            if ($deleted) {
                http_response_code(200);
                echo json_encode(array(
                    'status' => 'success',
                    'message' => 'Teacher deleted successfully',
                    'data' => array('deleted_id' => $id)
                ));
            } else {
                http_response_code(500);
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Failed to delete teacher',
                    'data' => null
                ));
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to delete teacher: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }

    public function get_by_class($class_name = null)
    {
        if (empty($class_name)) {
            http_response_code(400);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid class name provided',
                'data' => null
            ));
            return;
        }

        try {
            $teachers = $this->Teacher_model->get_teachers_by_class($class_name);

            http_response_code(200);
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Teachers retrieved successfully',
                'data' => $teachers,
                'count' => count($teachers)
            ));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to retrieve teachers: ' . $e->getMessage(),
                'data' => null
            ));
        }
    }
}
