<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Payment_model extends CI_Model
{

    // Define the table name as a constant for easy maintenance
    private $table = 'payment';

    public function __construct()
    {
        parent::__construct();

        // Load the database library
        // This connects to the database using settings from database.php
        $this->load->database();
    }

    /**
     * Get all payments from the database
     * This method retrieves all payment records with proper ordering
     * 
     * @return array Array of payment objects
     */
    public function get_all_payments()
    {
        // Using Query Builder for safe, readable database queries
        // Order by payment_date desc, then by payment_time desc for chronological order
        $query = $this->db
            ->select('p.payment_id, p.student_id, p.service_type, p.amount, p.payment_date, p.payment_time, s.student_name')
            ->from($this->table . ' p')
            ->join('student s', 'p.student_id = s.student_id', 'left')
            ->order_by('p.payment_date', 'DESC')
            ->order_by('p.payment_time', 'DESC')
            ->get();

        // Return results as array of objects
        // result() returns an array of objects, result_array() returns array of arrays
        return $query->result();
    }

    /**
     * Get a single payment by their ID
     * This demonstrates parameter binding for security
     * 
     * @param int $id Payment ID
     * @return object|null Payment object or null if not found
     */
    public function get_payment_by_id($id)
    {
        // Using where() method automatically escapes the parameter
        // This prevents SQL injection attacks
        $query = $this->db
            ->select('payment_id, student_id, service_type, amount, payment_date, payment_time')
            ->from($this->table)
            ->where('payment_id', $id)
            ->get();

        // row() returns a single object, or null if no results
        return $query->row();
    }

    /**
     * Create a new payment record
     * This method handles data insertion with proper validation
     * 
     * @param array $data Payment data to insert
     * @return int|false Insert ID on success, false on failure
     */
    public function create_payment($data)
    {
        // Prepare data for insertion
        // We'll be selective about what fields we accept for security
        $insert_data = array(
            'student_id' => (int)$data['student_id'],              // Cast to integer for safety
            'service_type' => trim($data['service_type']),         // Remove extra whitespace
            'amount' => (float)$data['amount'],                    // Cast to float for decimal
            'payment_date' => $data['payment_date'],               // Date validation below
            'payment_time' => $data['payment_time']                // Time validation below
        );

        // Validate student_id (should be positive integer)
        if ($insert_data['student_id'] <= 0) {
            throw new Exception('Student ID must be a positive integer');
        }

        // Validate service_type
        if (!$this->validate_service_type($insert_data['service_type'])) {
            throw new Exception('Service type must be between 2 and 100 characters');
        }

        // Validate amount
        if (!$this->validate_amount($insert_data['amount'])) {
            throw new Exception('Amount must be a positive number with maximum 2 decimal places');
        }

        // Validate payment date format and reasonable range
        if (!$this->validate_payment_date($insert_data['payment_date'])) {
            throw new Exception('Invalid payment date format or unreasonable date. Use YYYY-MM-DD format');
        }

        // Validate payment time format
        if (!$this->validate_payment_time($insert_data['payment_time'])) {
            throw new Exception('Invalid payment time format. Use HH:MM:SS format');
        }

        // Perform the insertion
        if ($this->db->insert($this->table, $insert_data)) {
            // Return the ID of the newly created record
            return $this->db->insert_id();
        } else {
            // Log the database error for debugging
            log_message('error', 'Failed to insert payment: ' . $this->db->error()['message']);
            return false;
        }
    }

    /**
     * Update an existing payment record
     * This method demonstrates how to handle updates safely
     * 
     * @param int $id Payment ID to update
     * @param array $data Updated payment data
     * @return bool Success status
     */
    public function update_payment($id, $data)
    {
        // Prepare update data (only allow certain fields to be updated)
        $update_data = array();

        // Only update fields that are provided and not empty
        if (isset($data['student_id']) && !empty($data['student_id'])) {
            $student_id = (int)$data['student_id'];
            if ($student_id > 0) {
                $update_data['student_id'] = $student_id;
            } else {
                throw new Exception('Student ID must be a positive integer');
            }
        }

        if (isset($data['service_type']) && !empty(trim($data['service_type']))) {
            $service_type = trim($data['service_type']);
            if ($this->validate_service_type($service_type)) {
                $update_data['service_type'] = $service_type;
            } else {
                throw new Exception('Service type must be between 2 and 100 characters');
            }
        }

        if (isset($data['amount']) && !empty($data['amount'])) {
            $amount = (float)$data['amount'];
            if ($this->validate_amount($amount)) {
                $update_data['amount'] = $amount;
            } else {
                throw new Exception('Amount must be a positive number with maximum 2 decimal places');
            }
        }

        if (isset($data['payment_date']) && !empty($data['payment_date'])) {
            if ($this->validate_payment_date($data['payment_date'])) {
                $update_data['payment_date'] = $data['payment_date'];
            } else {
                throw new Exception('Invalid payment date format or unreasonable date. Use YYYY-MM-DD format');
            }
        }

        if (isset($data['payment_time']) && !empty($data['payment_time'])) {
            if ($this->validate_payment_time($data['payment_time'])) {
                $update_data['payment_time'] = $data['payment_time'];
            } else {
                throw new Exception('Invalid payment time format. Use HH:MM:SS format');
            }
        }

        // If no valid data to update, return false
        if (empty($update_data)) {
            throw new Exception('No valid data provided for update');
        }

        // Perform the update
        $this->db->where('payment_id', $id);
        return $this->db->update($this->table, $update_data);
    }

    /**
     * Delete a payment record
     * This method handles safe deletion
     * 
     * @param int $id Payment ID to delete
     * @return bool Success status
     */
    public function delete_payment($id)
    {
        // Check if payment exists before attempting deletion
        if (!$this->get_payment_by_id($id)) {
            throw new Exception('Payment not found');
        }

        // Perform the deletion
        $this->db->where('payment_id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Get payments by student ID
     * This demonstrates filtering and could be useful for student payment history
     * 
     * @param int $student_id Student ID to filter by
     * @return array Array of payment objects
     */
    public function get_payments_by_student($student_id)
    {
        $query = $this->db
            ->select('payment_id, student_id, service_type, amount, payment_date, payment_time')
            ->from($this->table)
            ->where('student_id', $student_id)
            ->order_by('payment_date', 'DESC')
            ->order_by('payment_time', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Get payments by service type
     * Useful for filtering payments by service category
     * 
     * @param string $service_type Service type to filter by
     * @return array Array of payment objects
     */
    public function get_payments_by_service_type($service_type)
    {
        $service_type = trim($service_type);
        if (!$this->validate_service_type($service_type)) {
            throw new Exception('Invalid service type provided');
        }

        $query = $this->db
            ->select('payment_id, student_id, service_type, amount, payment_date, payment_time')
            ->from($this->table)
            ->where('service_type', $service_type)
            ->order_by('payment_date', 'DESC')
            ->order_by('payment_time', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Get payments within a date range
     * Useful for generating reports for specific time periods
     * 
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return array Array of payment objects
     */
    public function get_payments_by_date_range($start_date, $end_date)
    {
        // Validate date formats
        if (!$this->validate_payment_date($start_date) || !$this->validate_payment_date($end_date)) {
            throw new Exception('Invalid date format. Use YYYY-MM-DD format');
        }

        // Ensure start_date is not after end_date
        if (strtotime($start_date) > strtotime($end_date)) {
            throw new Exception('Start date cannot be after end date');
        }

        $query = $this->db
            ->select('payment_id, student_id, service_type, amount, payment_date, payment_time')
            ->from($this->table)
            ->where('payment_date >=', $start_date)
            ->where('payment_date <=', $end_date)
            ->order_by('payment_date', 'DESC')
            ->order_by('payment_time', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Get total count of payments
     * Useful for pagination and statistics
     * 
     * @return int Total number of payments
     */
    public function get_total_payments()
    {
        return $this->db->count_all($this->table);
    }

    /**
     * Get total amount of all payments
     * Useful for financial reporting
     * 
     * @return float Total amount
     */
    public function get_total_amount()
    {
        $query = $this->db
            ->select_sum('amount')
            ->from($this->table)
            ->get();

        $result = $query->row();
        return $result->amount ? (float)$result->amount : 0.0;
    }

    /**
     * Get payment statistics
     * Returns various statistics about payments
     * 
     * @return array Array of statistics
     */
    public function get_payment_statistics()
    {
        // Total payments count
        $total_payments = $this->get_total_payments();

        // Total amount
        $total_amount = $this->get_total_amount();

        // Average payment amount
        $avg_query = $this->db
            ->select_avg('amount')
            ->from($this->table)
            ->get();
        $avg_result = $avg_query->row();
        $average_amount = $avg_result->amount ? (float)$avg_result->amount : 0.0;

        // Payments by service type
        $service_query = $this->db
            ->select('service_type, COUNT(*) as count, SUM(amount) as total_amount')
            ->from($this->table)
            ->group_by('service_type')
            ->order_by('count', 'DESC')
            ->get();
        $payments_by_service = $service_query->result();

        // Recent payments (last 30 days)
        $thirty_days_ago = date('Y-m-d', strtotime('-30 days'));
        $recent_query = $this->db
            ->select('COUNT(*) as count, SUM(amount) as total_amount')
            ->from($this->table)
            ->where('payment_date >=', $thirty_days_ago)
            ->get();
        $recent_result = $recent_query->row();

        return array(
            'total_payments' => $total_payments,
            'total_amount' => $total_amount,
            'average_amount' => $average_amount,
            'payments_by_service' => $payments_by_service,
            'recent_payments' => array(
                'count' => (int)$recent_result->count,
                'total_amount' => $recent_result->total_amount ? (float)$recent_result->total_amount : 0.0
            )
        );
    }

    /**
     * Get payments with student information
     * Join with student table to get student details
     * 
     * @return array Array of payment objects with student info
     */
    public function get_payments_with_student_info()
    {
        $query = $this->db
            ->select('p.payment_id, p.student_id, p.service_type, p.amount, p.payment_date, p.payment_time, s.student_name')
            ->from($this->table . ' p')
            ->join('student s', 'p.student_id = s.student_id', 'left')
            ->order_by('p.payment_date', 'DESC')
            ->order_by('p.payment_time', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Validate service type
     * Private helper method to validate service type values
     * 
     * @param string $service_type Service type to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_service_type($service_type)
    {
        $service_type = trim($service_type);

        // Check length (between 2 and 100 characters as per varchar(100))
        if (strlen($service_type) < 2 || strlen($service_type) > 100) {
            return false;
        }

        return true;
    }

    /**
     * Validate amount
     * Private helper method to validate payment amount
     * 
     * @param float $amount Amount to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_amount($amount)
    {
        // Must be positive
        if ($amount <= 0) {
            return false;
        }

        // Check decimal places (maximum 2 as per decimal(10,2))
        if (round($amount, 2) != $amount) {
            return false;
        }

        // Check maximum value (considering decimal(10,2) can hold up to 99999999.99)
        if ($amount > 99999999.99) {
            return false;
        }

        return true;
    }

    /**
     * Validate payment date
     * Private helper method to validate payment date format and range
     * 
     * @param string $payment_date Payment date to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_payment_date($payment_date)
    {
        // Check date format (YYYY-MM-DD)
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $payment_date)) {
            return false;
        }

        // Check if it's a valid date
        $date_parts = explode('-', $payment_date);
        if (!checkdate($date_parts[1], $date_parts[2], $date_parts[0])) {
            return false;
        }

        // Check if the date is reasonable (not too far in the future, not too old)
        $payment_timestamp = strtotime($payment_date);
        $current_timestamp = time();
        $one_year_future = strtotime('+1 year');
        $ten_years_ago = strtotime('-10 years');

        // Date should be within reasonable range
        if ($payment_timestamp > $one_year_future || $payment_timestamp < $ten_years_ago) {
            return false;
        }

        return true;
    }

    /**
     * Validate payment time
     * Private helper method to validate payment time format
     * 
     * @param string $payment_time Payment time to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_payment_time($payment_time)
    {
        // Check time format (HH:MM:SS)
        if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', $payment_time)) {
            return false;
        }

        return true;
    }
}
