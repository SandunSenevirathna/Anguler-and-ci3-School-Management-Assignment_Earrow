<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Payment extends MX_Controller
{

    public function __construct()
    {
        parent::__construct();

        // Load the model - notice we don't need to specify the path
        // HMVC automatically looks in the current module first
        $this->load->model('Payment_model');

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
     * Get all payments
     * URL: GET /payment/get_all
     * This is your main endpoint to fetch all payment records
     */
    public function get_all()
    {
        try {
            // Call the model method to get all payments
            $payments = $this->Payment_model->get_all_payments();

            // Prepare the response
            $response = array(
                'status' => 'success',
                'message' => 'Payments retrieved successfully',
                'data' => $payments,
                'count' => count($payments)
            );

            // Return JSON response with 200 status code
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            // Handle any errors that might occur
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve payments: ' . $e->getMessage(),
                'data' => null
            );

            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get a single payment by ID
     * URL: GET /payment/get_by_id/{id}
     * This demonstrates how to handle URL parameters
     */
    public function get_by_id($id = null)
    {
        // Validate the ID parameter
        if (empty($id) || !is_numeric($id)) {
            $response = array(
                'status' => 'error',
                'message' => 'Invalid payment ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $payment = $this->Payment_model->get_payment_by_id($id);

            if ($payment) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Payment found',
                    'data' => $payment
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Payment not found',
                    'data' => null
                );
                http_response_code(404);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve payment: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Create a new payment
     * URL: POST /payment/create
     * Expects JSON data in request body
     * Required fields: student_id, service_type, amount, payment_date, payment_time
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
        $required_fields = ['student_id', 'service_type', 'amount', 'payment_date', 'payment_time'];
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
            $payment_id = $this->Payment_model->create_payment($input_data);

            if ($payment_id) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Payment created successfully',
                    'data' => array('payment_id' => $payment_id)
                );
                http_response_code(201);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to create payment',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to create payment: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Update an existing payment
     * URL: PUT /payment/update/{id}
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
                'message' => 'Invalid payment ID provided',
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
        $allowed_fields = ['student_id', 'service_type', 'amount', 'payment_date', 'payment_time'];
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
                'message' => 'At least one field (student_id, service_type, amount, payment_date, payment_time) is required for update',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if payment exists
            $existing_payment = $this->Payment_model->get_payment_by_id($id);
            if (!$existing_payment) {
                $response = array(
                    'status' => 'error',
                    'message' => 'Payment not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to update the payment
            $update_result = $this->Payment_model->update_payment($id, $input_data);

            if ($update_result) {
                // Get the updated payment data
                $updated_payment = $this->Payment_model->get_payment_by_id($id);

                $response = array(
                    'status' => 'success',
                    'message' => 'Payment updated successfully',
                    'data' => $updated_payment
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to update payment',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to update payment: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Delete a payment
     * URL: DELETE /payment/delete/{id}
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
                'message' => 'Invalid payment ID provided',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            // Check if payment exists before deletion
            $existing_payment = $this->Payment_model->get_payment_by_id($id);
            if (!$existing_payment) {
                $response = array(
                    'status' => 'error',
                    'message' => 'Payment not found',
                    'data' => null
                );
                http_response_code(404);
                echo json_encode($response);
                return;
            }

            // Attempt to delete the payment
            $delete_result = $this->Payment_model->delete_payment($id);

            if ($delete_result) {
                $response = array(
                    'status' => 'success',
                    'message' => 'Payment deleted successfully',
                    'data' => array('deleted_id' => $id)
                );
                http_response_code(200);
            } else {
                $response = array(
                    'status' => 'error',
                    'message' => 'Failed to delete payment',
                    'data' => null
                );
                http_response_code(500);
            }

            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to delete payment: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get payments by student ID
     * URL: GET /payment/get_by_student/{student_id}
     */
    public function get_by_student($student_id = null)
    {
        // Validate the student_id parameter
        if (empty($student_id) || !is_numeric($student_id)) {
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
            $payments = $this->Payment_model->get_payments_by_student($student_id);

            $response = array(
                'status' => 'success',
                'message' => 'Payments retrieved successfully',
                'data' => $payments,
                'count' => count($payments)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve payments: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get payments by service type
     * URL: GET /payment/get_by_service/{service_type}
     */
    public function get_by_service($service_type = null)
    {
        // Validate the service_type parameter
        if (empty($service_type)) {
            $response = array(
                'status' => 'error',
                'message' => 'Service type is required',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $payments = $this->Payment_model->get_payments_by_service_type($service_type);

            $response = array(
                'status' => 'success',
                'message' => 'Payments retrieved successfully',
                'data' => $payments,
                'count' => count($payments)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve payments: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get payments by date range
     * URL: GET /payment/get_by_date_range?start_date=2024-01-01&end_date=2024-12-31
     */
    public function get_by_date_range()
    {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');

        // Validate required parameters
        if (empty($start_date) || empty($end_date)) {
            $response = array(
                'status' => 'error',
                'message' => 'Both start_date and end_date parameters are required',
                'data' => null
            );
            http_response_code(400);
            echo json_encode($response);
            return;
        }

        try {
            $payments = $this->Payment_model->get_payments_by_date_range($start_date, $end_date);

            $response = array(
                'status' => 'success',
                'message' => 'Payments retrieved successfully',
                'data' => $payments,
                'count' => count($payments)
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve payments: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }

    /**
     * Get payment statistics
     * URL: GET /payment/get_stats
     */
    public function get_stats()
    {
        try {
            $stats = $this->Payment_model->get_payment_statistics();

            $response = array(
                'status' => 'success',
                'message' => 'Payment statistics retrieved successfully',
                'data' => $stats
            );
            http_response_code(200);
            echo json_encode($response);
        } catch (Exception $e) {
            $response = array(
                'status' => 'error',
                'message' => 'Failed to retrieve payment statistics: ' . $e->getMessage(),
                'data' => null
            );
            http_response_code(500);
            echo json_encode($response);
        }
    }
}
