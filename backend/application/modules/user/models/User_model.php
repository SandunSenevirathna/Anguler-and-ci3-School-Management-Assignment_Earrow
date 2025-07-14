<?php
defined('BASEPATH') or exit('No direct script access allowed');

class User_model extends CI_Model
{

    // Define the table name as a constant for easy maintenance
    private $table = 'User';

    public function __construct()
    {
        parent::__construct();

        // Load the database library
        // This connects to the database using settings from database.php
        $this->load->database();
    }

    /**
     * Get all users from the database
     * This method retrieves all user records with proper ordering
     * Note: Password field is excluded for security
     * 
     * @return array Array of user objects
     */
    public function get_all_users()
    {
        // Using Query Builder for safe, readable database queries
        // Order by role first, then by username for logical grouping
        // Exclude password field for security
        $query = $this->db
            ->select('user_id, username, role')
            ->from($this->table)
            ->order_by('role', 'ASC')
            ->order_by('username', 'ASC')
            ->get();

        // Return results as array of objects
        // result() returns an array of objects, result_array() returns array of arrays
        return $query->result();
    }

    /**
     * Get a single user by their ID
     * This demonstrates parameter binding for security
     * Note: Password field is excluded for security
     * 
     * @param int $id User ID
     * @return object|null User object or null if not found
     */
    public function get_user_by_id($id)
    {
        // Using where() method automatically escapes the parameter
        // This prevents SQL injection attacks
        $query = $this->db
            ->select('user_id, username, role')
            ->from($this->table)
            ->where('user_id', $id)
            ->get();

        // row() returns a single object, or null if no results
        return $query->row();
    }

    /**
     * Create a new user record
     * This method handles data insertion with proper validation and password hashing
     * 
     * @param array $data User data to insert
     * @return int|false Insert ID on success, false on failure
     */
    public function create_user($data)
    {
        // Prepare data for insertion
        // We'll be selective about what fields we accept for security
        $insert_data = array(
            'username' => trim($data['username']),     // Remove extra whitespace
            'password' => $data['password'],           // Will be hashed below
            'role' => trim($data['role'])              // Normalize role
        );

        // Validate username
        if (!$this->validate_username($insert_data['username'])) {
            throw new Exception('Username must be between 3 and 50 characters and contain only letters, numbers, and underscores');
        }

        // Check if username already exists
        if ($this->username_exists($insert_data['username'])) {
            throw new Exception('Username already exists. Please choose a different username.');
        }

        // Validate password
        if (!$this->validate_password($insert_data['password'])) {
            throw new Exception('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }

        // Validate role
        if (!$this->validate_role($insert_data['role'])) {
            throw new Exception('Role must be one of: Admin, Teacher, Student');
        }

        // Hash the password for security
        $insert_data['password'] = password_hash($insert_data['password'], PASSWORD_DEFAULT);

        // Perform the insertion
        if ($this->db->insert($this->table, $insert_data)) {
            // Return the ID of the newly created record
            return $this->db->insert_id();
        } else {
            // Log the database error for debugging
            log_message('error', 'Failed to insert user: ' . $this->db->error()['message']);
            return false;
        }
    }

    /**
     * Update an existing user record
     * This method demonstrates how to handle updates safely
     * 
     * @param int $id User ID to update
     * @param array $data Updated user data
     * @return bool Success status
     */
    public function update_user($id, $data)
    {
        // Prepare update data (only allow certain fields to be updated)
        $update_data = array();

        // Only update fields that are provided and not empty
        if (isset($data['username']) && !empty(trim($data['username']))) {
            $username = trim($data['username']);
            if ($this->validate_username($username)) {
                // Check if username already exists for other users
                if ($this->username_exists($username, $id)) {
                    throw new Exception('Username already exists. Please choose a different username.');
                }
                $update_data['username'] = $username;
            } else {
                throw new Exception('Username must be between 3 and 50 characters and contain only letters, numbers, and underscores');
            }
        }

        if (isset($data['password']) && !empty($data['password'])) {
            if ($this->validate_password($data['password'])) {
                // Hash the new password
                $update_data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            } else {
                throw new Exception('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
            }
        }

        if (isset($data['role']) && !empty(trim($data['role']))) {
            $role = trim($data['role']);
            if ($this->validate_role($role)) {
                $update_data['role'] = $role;
            } else {
                throw new Exception('Role must be one of: Admin, Teacher, Student');
            }
        }

        // If no valid data to update, return false
        if (empty($update_data)) {
            throw new Exception('No valid data provided for update');
        }

        // Perform the update
        $this->db->where('user_id', $id);
        return $this->db->update($this->table, $update_data);
    }

    /**
     * Delete a user record
     * This method handles safe deletion
     * 
     * @param int $id User ID to delete
     * @return bool Success status
     */
    public function delete_user($id)
    {
        // Check if user exists before attempting deletion
        if (!$this->get_user_by_id($id)) {
            throw new Exception('User not found');
        }

        // Perform the deletion
        $this->db->where('user_id', $id);
        return $this->db->delete($this->table);
    }

    /**
     * Get users by role
     * This demonstrates filtering and could be useful for role-based operations
     * 
     * @param string $role Role to filter by
     * @return array Array of user objects
     */
    public function get_users_by_role($role)
    {
        if (!$this->validate_role($role)) {
            throw new Exception('Invalid role provided');
        }

        $query = $this->db
            ->select('user_id, username, role')
            ->from($this->table)
            ->where('role', $role)
            ->order_by('username', 'ASC')
            ->get();

        return $query->result();
    }

    /**
     * Authenticate user login
     * This method handles user authentication with password verification
     * 
     * @param string $username Username
     * @param string $password Plain text password
     * @return object|false User object on success, false on failure
     */
    public function authenticate_user($username, $password)
    {
        // Get user with password for verification
        $query = $this->db
            ->select('user_id, username, password, role')
            ->from($this->table)
            ->where('username', trim($username))
            ->get();

        $user = $query->row();

        if ($user && password_verify($password, $user->password)) {
            // Remove password from response for security
            unset($user->password);
            return $user;
        }

        return false;
    }

    /**
     * Change user password
     * This method handles password changes with current password verification
     * 
     * @param int $id User ID
     * @param string $current_password Current password
     * @param string $new_password New password
     * @return bool Success status
     */
    public function change_password($id, $current_password, $new_password)
    {
        // Get user with current password
        $query = $this->db
            ->select('user_id, password')
            ->from($this->table)
            ->where('user_id', $id)
            ->get();

        $user = $query->row();

        if (!$user) {
            throw new Exception('User not found');
        }

        // Verify current password
        if (!password_verify($current_password, $user->password)) {
            return false; // Current password is incorrect
        }

        // Validate new password
        if (!$this->validate_password($new_password)) {
            throw new Exception('New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }

        // Hash new password and update
        $update_data = array(
            'password' => password_hash($new_password, PASSWORD_DEFAULT)
        );

        $this->db->where('user_id', $id);
        return $this->db->update($this->table, $update_data);
    }

    /**
     * Get total count of users
     * Useful for pagination and statistics
     * 
     * @return int Total number of users
     */
    public function get_total_users()
    {
        return $this->db->count_all($this->table);
    }

    /**
     * Get user count by role
     * Useful for dashboard statistics
     * 
     * @param string $role Role to count
     * @return int Number of users with specified role
     */
    public function get_user_count_by_role($role)
    {
        if (!$this->validate_role($role)) {
            throw new Exception('Invalid role provided');
        }

        return $this->db
            ->from($this->table)
            ->where('role', $role)
            ->count_all_results();
    }

    /**
     * Check if username exists
     * Private helper method to check username uniqueness
     * 
     * @param string $username Username to check
     * @param int $exclude_id User ID to exclude from check (for updates)
     * @return bool True if username exists, false otherwise
     */
    private function username_exists($username, $exclude_id = null)
    {
        $this->db->from($this->table);
        $this->db->where('username', trim($username));

        if ($exclude_id) {
            $this->db->where('user_id !=', $exclude_id);
        }

        return $this->db->count_all_results() > 0;
    }

    /**
     * Validate username
     * Private helper method to validate username format
     * 
     * @param string $username Username to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_username($username)
    {
        $username = trim($username);

        // Check length (3-50 characters)
        if (strlen($username) < 3 || strlen($username) > 50) {
            return false;
        }

        // Check format (letters, numbers, and underscores only)
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            return false;
        }

        return true;
    }

    /**
     * Validate password
     * Private helper method to validate password strength
     * 
     * @param string $password Password to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_password($password)
    {
        // Minimum 8 characters
        if (strlen($password) < 8) {
            return false;
        }

        // At least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            return false;
        }

        // At least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            return false;
        }

        // At least one number
        if (!preg_match('/[0-9]/', $password)) {
            return false;
        }

        return true;
    }

    /**
     * Validate role
     * Private helper method to validate role values against enum
     * 
     * @param string $role Role to validate
     * @return bool True if valid, false otherwise
     */
    private function validate_role($role)
    {
        $allowed_roles = ['Admin', 'Teacher', 'Student'];
        return in_array(trim($role), $allowed_roles);
    }
}
