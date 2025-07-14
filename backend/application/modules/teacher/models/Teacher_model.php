<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Teacher_model extends CI_Model
{

    // Define the table name as a constant for easy maintenance
    private $table = 'teacher';

    public function __construct()
    {
        parent::__construct();

        // Load the database library
        $this->load->database();
    }

    /**
     * Get all teachers from the database
     * This method retrieves all teacher records with proper ordering
     * 
     * @return array Array of teacher objects
     */
    public function get_all_teachers()
    {
        // Using Query Builder for safe, readable database queries
        // Order by class_name first, then by teacher name for logical grouping
        $query = $this->db
            ->select('teacher_id, teacher_name, class_name, gender, created_date, created_time')
            ->from($this->table)
            ->order_by('class_name', 'ASC')
            ->order_by('teacher_name', 'ASC')
            ->get();

        // Return results as array of objects
        return $query->result();
    }

    /**
     * Get a single teacher by their ID
     * This demonstrates parameter binding for security
     * 
     * @param int $id Teacher ID
     * @return object|null Teacher object or null if not found
     */
    public function get_teacher_by_id($id)
    {
        // Using where() method automatically escapes the parameter
        $query = $this->db
            ->select('teacher_id, teacher_name, class_name, gender, created_date, created_time')
            ->from($this->table)
            ->where('teacher_id', $id)
            ->get();

        // row() returns a single object, or null if no results
        return $query->row();
    }

    /**
     * Get a single teacher by their name
     * This is used for attendance system where username = teacher_name
     * 
     * @param string $teacher_name Teacher name
     * @return object|null Teacher object or null if not found
     */
    public function get_teacher_by_name($teacher_name)
    {
        // Using where() method automatically escapes the parameter
        $query = $this->db
            ->select('teacher_id, teacher_name, class_name, gender, created_date, created_time')
            ->from($this->table)
            ->where('teacher_name', $teacher_name)
            ->get();

        // row() returns a single object, or null if no results
        return $query->row();
    }

    /**
     * Create a new teacher record
     * This method handles data insertion with proper validation
     * 
     * @param array $data Teacher data to insert
     * @return int|false Insert ID on success, false on failure
     */
    public function create_teacher($data)
    {
        // Get current date and time
        $current_date = date('Y-m-d');
        $current_time = date('H:i:s');

        // Prepare data for insertion
        $insert_data = array(
            'teacher_name' => trim($data['teacher_name']),
            'class_name' => trim($data['class_name']),
            'gender' => $this->normalize_gender($data['gender']),
            'created_date' => $current_date,
            'created_time' => $current_time
        );

        // Validate teacher name length
        if (strlen($insert_data['teacher_name']) < 2 || strlen($insert_data['teacher_name']) > 100) {
            throw new Exception('Teacher name must be between 2 and 100 characters');
        }

        // Validate class name length
        if (strlen($insert_data['class_name']) < 1 || strlen($insert_data['class_name']) > 10) {
            throw new Exception('Class name must be between 1 and 10 characters');
        }

        // Validate gender
        if (!$this->validate_gender($insert_data['gender'])) {
            throw new Exception('Gender must be either "Male" or "Female"');
        }

        // Check if teacher name already exists
        if ($this->get_teacher_by_name($insert_data['teacher_name'])) {
            throw new Exception('Teacher with this name already exists');
        }

        // Perform the insertion
        if ($this->db->insert($this->table, $insert_data)) {
            // Return the ID of the newly created record
            return $this->db->insert_id();
        } else {
            // Log the database error for debugging
            log_message('error', 'Failed to insert teacher: ' . $this->db->error()['message']);
            return false;
        }
    }

    /**
     * Update an existing teacher record
     * This method demonstrates how to handle updates safely
     * 
     * @param int $id Teacher ID to update
     * @param array $data Updated teacher data
     * @return bool Success status
     */
    public function update_teacher($id, $data)
    {
        // Prepare update data (only allow certain fields to be updated)
        $update_data = array();

        // Only update fields that are provided and not empty
        if (isset($data['teacher_name']) && !empty(trim($data['teacher_name']))) {
            $teacher_name = trim($data['teacher_name']);
            if (strlen($teacher_name) >= 2 && strlen($teacher_name) <= 100) {
                // Check if the new name conflicts with existing teacher (excluding current teacher)
                $existing_teacher = $this->get_teacher_by_name($teacher_name);
                if ($existing_teacher && $existing_teacher->teacher_id != $id) {
                    throw new Exception('Teacher with this name already exists');
                }
                $update_data['teacher_name'] = $teacher_name;
            } else {
                throw new Exception('Teacher name must be between 2 and 100 characters');
            }
        }

        if (isset($data['class_name']) && !empty(trim($data['class_name']))) {
            $class_name = trim($data['class_name']);
            if (strlen($class_name) >= 1 && strlen($class_name) <= 10) {
                $update_data['class_name'] = $class_name;
            } else {
                throw new Exception('Class name must be between 1 and 10 characters');
            }
        }

        if (isset($data['gender']) && !empty(trim($data['gender']))) {
            $gender = $this->normalize_gender($data['gender']);
            if ($this->validate_gender($gender)) {
                $update_data['gender'] = $gender;
            } else {
                throw new Exception('Gender must be either "Male" or "Female"');
            }
        }

        // If no valid data to update, return false
        if (empty($update_data)) {
            throw new Exception('No valid data provided for update');
        }

        // Perform the update
        $this->db->where('teacher_id', $id);
        return $this->db->update($this->table, $update_data);
    }

    /**
     * Delete a teacher record
     * This method handles safe deletion
     * 
     * @param int $id Teacher ID to delete
     * @return bool Success status
     */
    public function delete_teacher($id)
    {
        // Check if teacher exists before attempting deletion
        if (!$this->get_teacher_by_id($id)) {
            throw new Exception('Teacher not found');
        }

        // Perform the deletion
        $this->db->where('teacher_id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Get teachers by class name
     * This demonstrates filtering and could be useful for reports
     * 
     * @param string $class_name Class name to filter by
     * @return array Array of teacher objects
     */
    public function get_teachers_by_class($class_name)
    {
        $query = $this->db
            ->select('teacher_id, teacher_name, class_name, gender, created_date, created_time')
            ->from($this->table)
            ->where('class_name', $class_name)
            ->order_by('teacher_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get total count of teachers
     * Useful for pagination and statistics
     * 
     * @return int Total number of teachers
     */
    public function get_total_teachers()
    {
        return $this->db->count_all($this->table);
    }

    /**
     * Get teachers by gender
     * Additional utility method for filtering by gender
     * 
     * @param string $gender Gender to filter by
     * @return array Array of teacher objects
     */
    public function get_teachers_by_gender($gender)
    {
        $gender = $this->normalize_gender($gender);
        if (!$this->validate_gender($gender)) {
            throw new Exception('Invalid gender provided');
        }

        $query = $this->db
            ->select('teacher_id, teacher_name, class_name, gender, created_date, created_time')
            ->from($this->table)
            ->where('gender', $gender)
            ->order_by('teacher_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get teachers created within a date range
     * Utility method for date-based filtering
     * 
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return array Array of teacher objects
     */
    public function get_teachers_by_date_range($start_date, $end_date)
    {
        $query = $this->db
            ->select('teacher_id, teacher_name, class_name, gender, created_date, created_time')
            ->from($this->table)
            ->where('created_date >=', $start_date)
            ->where('created_date <=', $end_date)
            ->order_by('created_date', 'DESC')
            ->order_by('created_time', 'DESC')
            ->get();

        return $query->result();
    }

    /**
     * Check if teacher name exists (useful for validation)
     * 
     * @param string $teacher_name Teacher name to check
     * @param int $exclude_id Optional teacher ID to exclude from check (for updates)
     * @return bool True if name exists, false otherwise
     */
    public function teacher_name_exists($teacher_name, $exclude_id = null)
    {
        $this->db->where('teacher_name', $teacher_name);

        if ($exclude_id) {
            $this->db->where('teacher_id !=', $exclude_id);
        }

        $query = $this->db->get($this->table);
        return $query->num_rows() > 0;
    }

    /**
     * Normalize gender input to match database enum values
     * Private helper method to ensure consistent gender format
     * 
     * @param string $gender Gender to normalize
     * @return string Normalized gender
     */
    private function normalize_gender($gender)
    {
        $gender = trim(strtolower($gender));

        // Convert to proper case for database enum
        if ($gender === 'male') {
            return 'Male';
        } elseif ($gender === 'female') {
            return 'Female';
        }

        // If already properly formatted, return as is
        if (in_array($gender, ['Male', 'Female'])) {
            return $gender;
        }

        // Default fallback
        return ucfirst($gender);
    }

    /**
     * Validate gender
     * Private helper method to validate gender values against database enum
     * 
     * @param string $gender Gender to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_gender($gender)
    {
        $allowed_genders = ['Male', 'Female'];
        return in_array($gender, $allowed_genders);
    }

    /**
     * Validate class name format
     * Private helper method to validate class name
     * 
     * @param string $class_name Class name to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_class_name($class_name)
    {
        // Check length
        if (strlen($class_name) < 1 || strlen($class_name) > 10) {
            return false;
        }

        // Allow alphanumeric characters, hyphens, and spaces
        if (!preg_match('/^[a-zA-Z0-9\s\-]+$/', $class_name)) {
            return false;
        }

        return true;
    }
}
