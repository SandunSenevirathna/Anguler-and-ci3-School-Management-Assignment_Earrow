<?php
defined('BASEPATH') or exit('No direct script access allowed');

class User extends MX_Controller
{

    public function __construct()
    {
        parent::__construct();

        // Load the model - notice we don't need to specify the path
        // HMVC automatically looks in the current module first
        $this->load->model('User_model');

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
     * Get all users
     * URL: GET /user/get_all
     * This is your main endpoint to fetch all user records
     */
    public function get_all()
    {
        try {
            // Call the model method to get all users
            $users = $this->User_model->get_all_users();

            // Prepare the response
            $response = array(
                'status' => 'success',
                'message' => 'Users retrieved successfully',
                'data' => $users,
                'count' => count($users)
            );

            // Return JSON response with 200 status code
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            // Handle any errors that might occur
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve users: ' . $e->getMessage(),
                'data' => null
            );

            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get a single user by ID
     * URL: GET /user/get_by_id/{id}
     * This demonstrates how to handle URL parameters
     */
    public function get_by_id($id = null)
    {
        // Validate the ID parameter
        if (empty($id) || !is_numeric($id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid user ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $user = $this->User_model->get_user_by_id($id);

            if ($user) {
                $response = array(
                    'status' => 'success',
                    'message' => 'User found',
                    'data' => $user
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'User not found',
                    'data' => null
                );
                http_response_code(404);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve user: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Create a new user
     * URL: POST /user/create
     * Expects JSON data in request body
     * Required fields: username, password, role
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
        $required_fields = ['username', 'password', 'role'];
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
            $user_id = $this->User_model->create_user($input_data);

            if ($user_id) {
                $response = array(
                    'status' => 'success',
                    'message' => 'User created successfully',
                    'data' => array('user_id' => $user_id)
                );
                http_response_code(201);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to create user',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to create user: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Update an existing user
     * URL: PUT /user/update/{id}
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
                'message' => 'Invalid user ID provided',
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
        $allowed_fields = ['username', 'password', 'role'];
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
                'message' => 'At least one field (username, password, role) is required for update',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if user exists
            $existing_user = $this->User_model->get_user_by_id($id);
            if (!$existing_user) {
                $response = array(
                    'status' => 'error',
                    'message' => 'User not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to update the user
            $update_result = $this->User_model->update_user($id, $input_data);

            if ($update_result) {
                // Get the updated user data
                $updated_user = $this->User_model->get_user_by_id($id);

                $response = array(
                    'status' => 'success',
                    'message' => 'User updated successfully',
                    'data' => $updated_user
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to update user',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to update user: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Delete a user
     * URL: DELETE /user/delete/{id}
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
                'message' => 'Invalid user ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if user exists before deletion
            $existing_user = $this->User_model->get_user_by_id($id);
            if (!$existing_user) {
                $response = array(
                    'status' => 'error',
                    'message' => 'User not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to delete the user
            $delete_result = $this->User_model->delete_user($id);

            if ($delete_result) {
                $response = array(
                    'status' => 'success',
                    'message' => 'User deleted successfully',
                    'data' => array('deleted_id' => $id)
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to delete user',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to delete user: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get users by role
     * URL: GET /user/get_by_role/{role}
     */
    public function get_by_role($role = null)
    {
        // Validate the role parameter
        if (empty($role)) {
            $response = array(
                'status' => 'error',
                'message' => 'Role parameter is required',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $users = $this->User_model->get_users_by_role($role);

            $response = array(
                'status' => 'success',
                'message' => 'Users retrieved successfully',
                'data' => $users,
                'count' => count($users)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve users: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * User login authentication
     * URL: POST /user/login
     * Expects JSON data: username, password
     */
    public function login()
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
        $required_fields = ['username', 'password'];
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
            $user = $this->User_model->authenticate_user($input_data['username'], $input_data['password']);

            if ($user) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Login successful',
                    'data' => $user
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Invalid username or password',
                    'data' => null
                );
                http_response_code(401);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Login failed: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Change user password
     * URL: PUT /user/change_password/{id}
     * Expects JSON data: current_password, new_password
     */
    public function change_password($id = null)
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
                'message' => 'Invalid user ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        // Get JSON input data
        $input_data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required_fields = ['current_password', 'new_password'];
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
            $result = $this->User_model->change_password($id, $input_data['current_password'], $input_data['new_password']);

            if ($result) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Password changed successfully',
                    'data' => array('user_id' => $id)
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to change password. Current password may be incorrect.',
                    'data' => null
                );
                http_response_code(400);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to change password: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }
}
