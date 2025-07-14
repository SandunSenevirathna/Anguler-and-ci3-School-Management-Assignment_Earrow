<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Student_model extends CI_Model
{

    // Define the table name as a constant for easy maintenance
    private $table = 'student';

    public function __construct()
    {
        parent::__construct();

        // Load the database library
        // This connects to the database using settings from database.php
        $this->load->database();
    }

    /**
     * Get all students from the database
     * This method retrieves all student records with proper ordering
     * 
     * @return array Array of student objects
     */
    public function get_all_students()
    {
        // Using Query Builder for safe, readable database queries
        // Order by class_id first, then by student name for logical grouping
        $query = $this->db
            ->select('student_id, student_name, birth_date, gender, class_id')
            ->from($this->table)
            ->order_by('class_id', 'ASC')
            ->order_by('student_name', 'ASC')
            ->get();

        // Return results as array of objects
        // result() returns an array of objects, result_array() returns array of arrays
        return $query->result();
    }

    /**
     * Get a single student by their ID
     * This demonstrates parameter binding for security
     * 
     * @param int $id Student ID
     * @return object|null Student object or null if not found
     */
    public function get_student_by_id($id)
    {
        // Using where() method automatically escapes the parameter
        // This prevents SQL injection attacks
        $query = $this->db
            ->select('student_id, student_name, birth_date, gender, class_id')
            ->from($this->table)
            ->where('student_id', $id)
            ->get();

        // row() returns a single object, or null if no results
        return $query->row();
    }

    /**
     * Get students by class name (for attendance system)
     * This method gets students where class_id matches the class_name from teacher
     * 
     * @param string $class_name Class name to filter by
     * @return array Array of student objects
     */
    public function get_students_by_class_name($class_name)
    {
        // Assuming class_id field in student table stores the class name
        // If your database structure is different, adjust accordingly
        $query = $this->db
            ->select('student_id, student_name, birth_date, gender, class_id')
            ->from($this->table)
            ->where('class_id', $class_name)
            ->order_by('student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Create a new student record
     * This method handles data insertion with proper validation
     * 
     * @param array $data Student data to insert
     * @return int|false Insert ID on success, false on failure
     */
    public function create_student($data)
    {
        // Prepare data for insertion
        // We'll be selective about what fields we accept for security
        $insert_data = array(
            'student_name' => trim($data['student_name']), // Remove extra whitespace
            'birth_date' => $data['birth_date'],           // Date validation below
            'gender' => trim(strtolower($data['gender'])), // Normalize gender
            'class_id' => trim($data['class_id'])          // Class ID (could be class name)
        );

        // Validate student name length
        if (strlen($insert_data['student_name']) < 2 || strlen($insert_data['student_name']) > 100) {
            throw new Exception('Student name must be between 2 and 100 characters');
        }

        // Validate birth date format and reasonable range
        if (!$this->validate_birth_date($insert_data['birth_date'])) {
            throw new Exception('Invalid birth date format or unreasonable date. Use YYYY-MM-DD format');
        }

        // Validate gender
        if (!$this->validate_gender($insert_data['gender'])) {
            throw new Exception('Gender must be either "male" or "female"');
        }

        // Validate class_id (ensure it's not empty)
        if (empty($insert_data['class_id'])) {
            throw new Exception('Class ID is required');
        }

        // Perform the insertion
        if ($this->db->insert($this->table, $insert_data)) {
            // Return the ID of the newly created record
            return $this->db->insert_id();
        } else {
            // Log the database error for debugging
            log_message('error', 'Failed to insert student: ' . $this->db->error()['message']);
            return false;
        }
    }

    /**
     * Update an existing student record
     * This method demonstrates how to handle updates safely
     * 
     * @param int $id Student ID to update
     * @param array $data Updated student data
     * @return bool Success status
     */
    public function update_student($id, $data)
    {
        // Prepare update data (only allow certain fields to be updated)
        $update_data = array();

        // Only update fields that are provided and not empty
        if (isset($data['student_name']) && !empty(trim($data['student_name']))) {
            $student_name = trim($data['student_name']);
            if (strlen($student_name) >= 2 && strlen($student_name) <= 100) {
                $update_data['student_name'] = $student_name;
            } else {
                throw new Exception('Student name must be between 2 and 100 characters');
            }
        }

        if (isset($data['birth_date']) && !empty($data['birth_date'])) {
            if ($this->validate_birth_date($data['birth_date'])) {
                $update_data['birth_date'] = $data['birth_date'];
            } else {
                throw new Exception('Invalid birth date format or unreasonable date. Use YYYY-MM-DD format');
            }
        }

        if (isset($data['gender']) && !empty(trim($data['gender']))) {
            $gender = trim(strtolower($data['gender']));
            if ($this->validate_gender($gender)) {
                $update_data['gender'] = $gender;
            } else {
                throw new Exception('Gender must be either "male" or "female"');
            }
        }

        if (isset($data['class_id']) && !empty(trim($data['class_id']))) {
            $update_data['class_id'] = trim($data['class_id']);
        }

        // If no valid data to update, return false
        if (empty($update_data)) {
            throw new Exception('No valid data provided for update');
        }

        // Perform the update
        $this->db->where('student_id', $id);
        return $this->db->update($this->table, $update_data);
    }

    /**
     * Delete a student record
     * This method handles safe deletion
     * 
     * @param int $id Student ID to delete
     * @return bool Success status
     */
    public function delete_student($id)
    {
        // Check if student exists before attempting deletion
        if (!$this->get_student_by_id($id)) {
            throw new Exception('Student not found');
        }

        // Perform the deletion
        $this->db->where('student_id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Get students by class ID
     * This demonstrates filtering and could be useful for reports
     * 
     * @param int $class_id Class ID to filter by
     * @return array Array of student objects
     */
    public function get_students_by_class($class_id)
    {
        $query = $this->db
            ->select('student_id, student_name, birth_date, gender, class_id')
            ->from($this->table)
            ->where('class_id', $class_id)
            ->order_by('student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get total count of students
     * Useful for pagination and statistics
     * 
     * @return int Total number of students
     */
    public function get_total_students()
    {
        return $this->db->count_all($this->table);
    }

    /**
     * Get students by gender
     * Additional utility method for filtering by gender
     * 
     * @param string $gender Gender to filter by
     * @return array Array of student objects
     */
    public function get_students_by_gender($gender)
    {
        $gender = trim(strtolower($gender));
        if (!$this->validate_gender($gender)) {
            throw new Exception('Invalid gender provided');
        }

        $query = $this->db
            ->select('student_id, student_name, birth_date, gender, class_id')
            ->from($this->table)
            ->where('gender', $gender)
            ->order_by('student_name', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Get students by class name with detailed info
     * This includes additional filtering and validation
     * 
     * @param string $class_name Class name to search for
     * @return array Array of student objects with additional info
     */
    public function get_students_with_class_details($class_name)
    {
        $query = $this->db
            ->select('s.student_id, s.student_name, s.birth_date, s.gender, s.class_id')
            ->from($this->table . ' s')
            ->where('s.class_id', $class_name)
            ->order_by('s.student_name', 'ASC')
            ->get();

        $students = $query->result();

        // Add calculated age for each student
        foreach ($students as $student) {
            $student->age = $this->calculate_age($student->birth_date);
        }

        return $students;
    }

    /**
     * Calculate age from birth date
     * Utility method to calculate age based on birth_date
     * 
     * @param string $birth_date Birth date in YYYY-MM-DD format
     * @return int Age in years
     */
    public function calculate_age($birth_date)
    {
        $birth = new DateTime($birth_date);
        $today = new DateTime();
        $age = $birth->diff($today);
        return $age->y;
    }

    /**
     * Validate birth date
     * Private helper method to validate birth date format and range
     * 
     * @param string $birth_date Birth date to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_birth_date($birth_date)
    {
        // Check date format (YYYY-MM-DD)
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birth_date)) {
            return false;
        }

        // Check if it's a valid date
        $date_parts = explode('-', $birth_date);
        if (!checkdate($date_parts[1], $date_parts[2], $date_parts[0])) {
            return false;
        }

        // Check if the date is reasonable (not in the future, not too old)
        $birth = new DateTime($birth_date);
        $today = new DateTime();
        $age = $birth->diff($today);

        // Age should be between 3 and 30 years (reasonable for students)
        if ($birth > $today || $age->y < 3 || $age->y > 30) {
            return false;
        }

        return true;
    }

    /**
     * Validate gender
     * Private helper method to validate gender values
     * 
     * @param string $gender Gender to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_gender($gender)
    {
        $allowed_genders = ['male', 'female'];
        return in_array(trim(strtolower($gender)), $allowed_genders);
    }
}
