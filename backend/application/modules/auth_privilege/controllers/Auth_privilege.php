<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Auth_privilege extends MX_Controller
{

    public function __construct()
    {
        parent::__construct();

        // Load the model - notice we don't need to specify the path
        // HMVC automatically looks in the current module first
        $this->load->model('Auth_privilege_model');

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
     * Get all privileges
     * URL: GET /auth_privilege/get_all
     * This endpoint fetches all privilege records
     */
    public function get_all()
    {
        try {
            // Call the model method to get all privileges
            $privileges = $this->Auth_privilege_model->get_all_privileges();

            // Prepare the response
            $response = array(
                'status' => 'success',
                'message' => 'Privileges retrieved successfully',
                'data' => $privileges,
                'count' => count($privileges)
            );

            // Return JSON response with 200 status code
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            // Handle any errors that might occur
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve privileges: ' . $e->getMessage(),
                'data' => null
            );

            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get privileges by role name - MAIN METHOD FOR FRONTEND
     * URL: GET /auth_privilege/get_by_role/{role_name}
     * This is the main method that will be used by the frontend to get user privileges
     */
    public function get_by_role($role_name = null)
    {
        // Validate the role_name parameter
        if (empty($role_name)) {
            $response = array(
                'status' => 'error',
                'message' => 'Role name parameter is required',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $privileges = $this->Auth_privilege_model->get_privileges_by_role($role_name);

            if ($privileges) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Privileges found for role: ' . $role_name,
                    'data' => $privileges
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'No privileges found for role: ' . $role_name,
                    'data' => null
                );
                http_response_code(404);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve privileges: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get a single privilege record by ID
     * URL: GET /auth_privilege/get_by_id/{id}
     */
    public function get_by_id($id = null)
    {
        // Validate the ID parameter
        if (empty($id) || !is_numeric($id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid privilege ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $privilege = $this->Auth_privilege_model->get_privilege_by_id($id);

            if ($privilege) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Privilege found',
                    'data' => $privilege
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Privilege not found',
                    'data' => null
                );
                http_response_code(404);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve privilege: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Create a new privilege record
     * URL: POST /auth_privilege/create
     * Expects JSON data in request body
     * Required fields: role_name, privilege (array)
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
        $required_fields = ['role_name', 'privilege'];
        foreach ($required_fields as $field) {
            if (!isset($input_data[$field]) || empty($input_data[$field])) {
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
            $privilege_id = $this->Auth_privilege_model->create_privilege($input_data);

            if ($privilege_id) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Privilege created successfully',
                    'data' => array('privilege_id' => $privilege_id)
                );
                http_response_code(201);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to create privilege',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to create privilege: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Update an existing privilege record
     * URL: PUT /auth_privilege/update/{id}
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
                'message' => 'Invalid privilege ID provided',
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
        $allowed_fields = ['role_name', 'privilege'];
        $has_valid_field = false;

        foreach ($allowed_fields as $field) {
            if (isset($input_data[$field]) && !empty($input_data[$field])) {
                $has_valid_field = true;
                break;
            }
        }

        if (!$has_valid_field) {
            $response = array(
                'status' => 'error',
                'message' => 'At least one field (role_name, privilege) is required for update',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if privilege exists
            $existing_privilege = $this->Auth_privilege_model->get_privilege_by_id($id);
            if (!$existing_privilege) {
                $response = array(
                    'status' => 'error',
                    'message' => 'Privilege not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to update the privilege
            $update_result = $this->Auth_privilege_model->update_privilege($id, $input_data);

            if ($update_result) {
                // Get the updated privilege data
                $updated_privilege = $this->Auth_privilege_model->get_privilege_by_id($id);

                $response = array(
                    'status' => 'success',
                    'message' => 'Privilege updated successfully',
                    'data' => $updated_privilege
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to update privilege',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to update privilege: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Delete a privilege record
     * URL: DELETE /auth_privilege/delete/{id}
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
                'message' => 'Invalid privilege ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if privilege exists before deletion
            $existing_privilege = $this->Auth_privilege_model->get_privilege_by_id($id);
            if (!$existing_privilege) {
                $response = array(
                    'status' => 'error',
                    'message' => 'Privilege not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to delete the privilege
            $delete_result = $this->Auth_privilege_model->delete_privilege($id);

            if ($delete_result) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Privilege deleted successfully',
                    'data' => array('deleted_id' => $id)
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to delete privilege',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to delete privilege: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Check if a role has a specific privilege
     * URL: GET /auth_privilege/check_privilege/{role_name}/{privilege_name}
     * This is useful for frontend permission checking
     */
    public function check_privilege($role_name = null, $privilege_name = null)
    {
        // Validate parameters
        if (empty($role_name) || empty($privilege_name)) {
            $response = array(
                'status' => 'error',
                'message' => 'Both role_name and privilege_name parameters are required',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $has_privilege = $this->Auth_privilege_model->has_privilege($role_name, $privilege_name);

            $response = array(
                'status' => 'success',
                'message' => $has_privilege ? 'Role has privilege' : 'Role does not have privilege',
                'data' => array(
                    'role_name' => $role_name,
                    'privilege_name' => $privilege_name,
                    'has_privilege' => $has_privilege
                )
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to check privilege: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get all available privileges across all roles
     * URL: GET /auth_privilege/get_available_privileges
     * This returns a unique list of all privileges
     */
    public function get_available_privileges()
    {
        try {
            $privileges = $this->Auth_privilege_model->get_all_available_privileges();

            $response = array(
                'status' => 'success',
                'message' => 'Available privileges retrieved successfully',
                'data' => $privileges,
                'count' => count($privileges)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve available privileges: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }
}
