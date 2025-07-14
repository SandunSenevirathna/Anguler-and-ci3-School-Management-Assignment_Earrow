<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Auth_privilege_model extends CI_Model
{

    // Define the table name as a constant for easy maintenance
    private $table = 'auth_privilege';

    public function __construct()
    {
        parent::__construct();

        // Load the database library
        // This connects to the database using settings from database.php
        $this->load->database();
    }

    /**
     * Get all auth privileges from the database
     * This method retrieves all privilege records
     * 
     * @return array Array of privilege objects
     */
    public function get_all_privileges()
    {
        // Using Query Builder for safe, readable database queries
        // Order by role_name for logical grouping
        $query = $this->db
            ->select('id, role_name, privilege')
            ->from($this->table)
            ->order_by('role_name', 'ASC')
            ->get();

        // Process the results to decode JSON privilege data
        $results = $query->result();

        foreach ($results as $result) {
            // Decode JSON privilege data
            $result->privilege = json_decode($result->privilege, true);
        }

        return $results;
    }

    /**
     * Get privileges by role name
     * This is the main method for getting user privileges based on their role
     * 
     * @param string $role_name Role name (Admin, Teacher, Student)
     * @return object|null Privilege object or null if not found
     */
    public function get_privileges_by_role($role_name)
    {
        // Using where() method automatically escapes the parameter
        // This prevents SQL injection attacks
        $query = $this->db
            ->select('id, role_name, privilege')
            ->from($this->table)
            ->where('role_name', trim($role_name))
            ->get();

        $result = $query->row();

        if ($result) {
            // Decode JSON privilege data
            $result->privilege = json_decode($result->privilege, true);
        }

        return $result;
    }

    /**
     * Get a single privilege record by ID
     * 
     * @param int $id Privilege ID
     * @return object|null Privilege object or null if not found
     */
    public function get_privilege_by_id($id)
    {
        // Using where() method automatically escapes the parameter
        $query = $this->db
            ->select('id, role_name, privilege')
            ->from($this->table)
            ->where('id', $id)
            ->get();

        $result = $query->row();

        if ($result) {
            // Decode JSON privilege data
            $result->privilege = json_decode($result->privilege, true);
        }

        return $result;
    }

    /**
     * Create a new privilege record
     * This method handles data insertion with proper validation
     * 
     * @param array $data Privilege data to insert
     * @return int|false Insert ID on success, false on failure
     */
    public function create_privilege($data)
    {
        // Prepare data for insertion
        $insert_data = array(
            'role_name' => trim($data['role_name']),
            'privilege' => is_array($data['privilege']) ? json_encode($data['privilege']) : $data['privilege']
        );

        // Validate role name
        if (!$this->validate_role_name($insert_data['role_name'])) {
            throw new Exception('Role name must be one of: Admin, Teacher, Student');
        }

        // Check if role already exists
        if ($this->role_exists($insert_data['role_name'])) {
            throw new Exception('Privilege for this role already exists. Use update instead.');
        }

        // Validate privilege data
        if (!$this->validate_privilege_data($data['privilege'])) {
            throw new Exception('Invalid privilege data format');
        }

        // Perform the insertion
        if ($this->db->insert($this->table, $insert_data)) {
            // Return the ID of the newly created record
            return $this->db->insert_id();
        } else {
            // Log the database error for debugging
            log_message('error', 'Failed to insert privilege: ' . $this->db->error()['message']);
            return false;
        }
    }

    /**
     * Update an existing privilege record
     * This method demonstrates how to handle updates safely
     * 
     * @param int $id Privilege ID to update
     * @param array $data Updated privilege data
     * @return bool Success status
     */
    public function update_privilege($id, $data)
    {
        // Prepare update data
        $update_data = array();

        // Only update fields that are provided and not empty
        if (isset($data['role_name']) && !empty(trim($data['role_name']))) {
            $role_name = trim($data['role_name']);
            if ($this->validate_role_name($role_name)) {
                // Check if role already exists for other records
                if ($this->role_exists($role_name, $id)) {
                    throw new Exception('Privilege for this role already exists.');
                }
                $update_data['role_name'] = $role_name;
            } else {
                throw new Exception('Role name must be one of: Admin, Teacher, Student');
            }
        }

        if (isset($data['privilege'])) {
            if ($this->validate_privilege_data($data['privilege'])) {
                $update_data['privilege'] = is_array($data['privilege']) ? json_encode($data['privilege']) : $data['privilege'];
            } else {
                throw new Exception('Invalid privilege data format');
            }
        }

        // If no valid data to update, return false
        if (empty($update_data)) {
            throw new Exception('No valid data provided for update');
        }

        // Perform the update
        $this->db->where('id', $id);
        return $this->db->update($this->table, $update_data);
    }

    /**
     * Delete a privilege record
     * This method handles safe deletion
     * 
     * @param int $id Privilege ID to delete
     * @return bool Success status
     */
    public function delete_privilege($id)
    {
        // Check if privilege exists before attempting deletion
        if (!$this->get_privilege_by_id($id)) {
            throw new Exception('Privilege record not found');
        }

        // Perform the deletion
        $this->db->where('id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Check if a specific privilege exists for a role
     * This method checks if a role has access to a specific privilege
     * 
     * @param string $role_name Role name
     * @param string $privilege_name Privilege name to check
     * @return bool True if role has the privilege, false otherwise
     */
    public function has_privilege($role_name, $privilege_name)
    {
        $privileges = $this->get_privileges_by_role($role_name);

        if (!$privileges || !is_array($privileges->privilege)) {
            return false;
        }

        return in_array($privilege_name, $privileges->privilege);
    }

    /**
     * Get all available privileges (unique list from all roles)
     * This method returns all unique privileges across all roles
     * 
     * @return array Array of unique privilege names
     */
    public function get_all_available_privileges()
    {
        $query = $this->db
            ->select('privilege')
            ->from($this->table)
            ->get();

        $all_privileges = array();

        foreach ($query->result() as $row) {
            $privileges = json_decode($row->privilege, true);
            if (is_array($privileges)) {
                $all_privileges = array_merge($all_privileges, $privileges);
            }
        }

        // Return unique privileges
        return array_unique($all_privileges);
    }

    /**
     * Get total count of privilege records
     * Useful for pagination and statistics
     * 
     * @return int Total number of privilege records
     */
    public function get_total_privileges()
    {
        return $this->db->count_all($this->table);
    }

    /**
     * Check if role name exists
     * Private helper method to check role name uniqueness
     * 
     * @param string $role_name Role name to check
     * @param int $exclude_id Record ID to exclude from check (for updates)
     * @return bool True if role exists, false otherwise
     */
    private function role_exists($role_name, $exclude_id = null)
    {
        $this->db->from($this->table);
        $this->db->where('role_name', trim($role_name));

        if ($exclude_id) {
            $this->db->where('id !=', $exclude_id);
        }

        return $this->db->count_all_results() > 0;
    }

    /**
     * Validate role name
     * Private helper method to validate role name format
     * 
     * @param string $role_name Role name to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_role_name($role_name)
    {
        $role_name = trim($role_name);
        $allowed_roles = ['Admin', 'Teacher', 'Student'];
        return in_array($role_name, $allowed_roles);
    }

    /**
     * Validate privilege data
     * Private helper method to validate privilege data format
     * 
     * @param mixed $privilege_data Privilege data to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_privilege_data($privilege_data)
    {
        // If it's a string, try to decode it as JSON
        if (is_string($privilege_data)) {
            $decoded = json_decode($privilege_data, true);
            return json_last_error() === JSON_ERROR_NONE && is_array($decoded);
        }

        // If it's an array, validate the contents
        if (is_array($privilege_data)) {
            // Check if all elements are strings
            foreach ($privilege_data as $privilege) {
                if (!is_string($privilege) || empty(trim($privilege))) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }
}
